"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

// Script to fetch listings for a single account's storefront, including metadata
const GET_ACCOUNT_LISTINGS_SCRIPT = `
import NFTStorefrontV2 from 0x2d55b98eb200daef
import MetadataViews     from 0x631e88ae7f1d7c20
import MilestoneNFT      from 0xcc3f81c625b55c77
import NonFungibleToken  from 0x631e88ae7f1d7c20
import ViewResolver      from 0x631e88ae7f1d7c20

access(all) fun main(account: Address): [{String: AnyStruct}] {
    let storefront = getAccount(account)
        .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
        .borrow()
    if storefront == nil {
        return []
    }

    let resolverCol = getAccount(account)
        .capabilities.get<&{ViewResolver.ResolverCollection}>(MilestoneNFT.CollectionPublicPath)
        .borrow()

    let ids = storefront!.getListingIDs()
    var results: [{String: AnyStruct}] = []

    for id in ids {
        if let listing = storefront!.borrowListing(listingResourceID: id) {
            let details = listing.getDetails()
            if details.purchased {
                continue
            }
            if details.nftType == Type<@MilestoneNFT.NFT>() {
                var name: String = ""
                var desc: String = ""
                var img: String = ""
                var royalty: UFix64 = 0.0

                // If we have the resolver collection, try to resolve metadata
                if resolverCol != nil {
                    if let resolver = resolverCol!.borrowViewResolver(id: details.nftID) {
                        log("Got resolver from collection for ".concat(details.nftID.toString()))
                        if let display = MetadataViews.getDisplay(resolver) {
                            log("Got display from collection")
                            name = display.name
                            desc = display.description
                            img = display.thumbnail.uri()
                        }
                        if let royalties = MetadataViews.getRoyalties(resolver) {
                            if royalties.getRoyalties().length > 0 {
                                royalty = royalties.getRoyalties()[0].cut
                            }
                        }
                    } else {
                        log("No resolver in collection for ".concat(details.nftID.toString()))
                    }
                } else {
                    log("No resolver collection for seller")
                }

                // Fallback: resolve metadata directly from the listed NFT (it now lives inside the Listing)
                if img == "" || name == "" {
                    log("Trying listing.borrowNFT() for ".concat(details.nftID.toString()))
                    if let nftRef = listing.borrowNFT() {
                        log("borrowNFT succeeded")
                        if let nftResolver = nftRef as? &{ViewResolver.Resolver} {
                            if let display = MetadataViews.getDisplay(nftResolver) {
                                log("Got display from listed NFT")
                                if name == "" { name = display.name }
                                if desc == "" { desc = display.description }
                                if img == "" { img = display.thumbnail.uri() }
                            } else {
                                log("No display on listed NFT")
                            }
                            if let royalties = MetadataViews.getRoyalties(nftResolver) {
                                if royalties.getRoyalties().length > 0 {
                                    royalty = royalties.getRoyalties()[0].cut
                                }
                            }
                        }
                        if let milestone = nftRef as? &MilestoneNFT.NFT {
                            if name == "" { name = milestone.name }
                            if desc == "" { desc = milestone.description }
                            if img == "" { img = milestone.image }
                            if royalty == 0.0 { royalty = milestone.royaltyCut }
                        }
                    } else {
                        log("borrowNFT returned nil")
                    }
                }

                // Final fallback: borrow the NFT from the seller's public collection and read its fields directly
                if img == "" || name == "" {
                    let colRef = getAccount(account)
                        .capabilities.get<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)
                        .borrow()
                    if colRef != nil {
                        if let nft = colRef!.borrowNFT(details.nftID) {
                            if let milestone = nft as? &MilestoneNFT.NFT {
                                if name == "" { name = milestone.name }
                                if desc == "" { desc = milestone.description }
                                if img == "" { img = milestone.image }
                                if royalty == 0.0 { royalty = milestone.royaltyCut }
                            }
                        }
                    }
                }

                results.append({
                    "listingID": id,
                    "nftID": details.nftID,
                    "price": details.salePrice,
                    "expiry": details.expiry,
                    "seller": account,
                    "name": name,
                    "description": desc,
                    "image": img,
                    "royaltyCut": royalty
                })
                log("RESULT ".concat(id.toString()).concat(" name ").concat(name).concat(" img ").concat(img))
            }
        }
    }
    return results
}
`;

// Helper function to convert Pinata URLs to gateway URLs for better loading
const optimizePinataImageUrl = (url: string): string => {
  if (!url) return url;

  // Convert mypinata.cloud URLs to gateway.pinata.cloud for better performance
  if (url.includes(".mypinata.cloud/ipfs/")) {
    const ipfsHash = url.split("/ipfs/")[1];
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  return url;
};

// Addresses to scan for storefront listings. In a real app you would index events instead.
const DEFAULT_SELLERS = [
  "0xcc3f81c625b55c77", // FanFuel testnet account
  "0x5a81c99ad97bb81f",
];

export interface MarketplaceListing {
  id: string;
  name: string;
  image: string;
  campaign: string;
  campaignId: string;
  milestone: string;
  price: number;
  seller: string;
  listedAt: string;
  royaltyRate: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
  listingId: string;
}

interface UseMarketplaceListingsResult {
  listings: MarketplaceListing[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketplaceListings(
  sellers: string[] = DEFAULT_SELLERS
): UseMarketplaceListingsResult {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const allListings: MarketplaceListing[] = [];

      for (const addr of sellers) {
        console.log(`Fetching listings for address: ${addr}`);

        const accountListings: any[] = await fcl.query({
          cadence: GET_ACCOUNT_LISTINGS_SCRIPT,
          args: (arg, t) => [arg(addr, t.Address)],
        });

        console.log(
          `Found ${accountListings.length} listings for ${addr}:`,
          accountListings
        );

        for (const raw of accountListings) {
          try {
            console.log(
              `Fetching metadata for NFT ${raw.nftID} (listing ${raw.listingID}) from ${addr}`
            );

            // Extract metadata with fallbacks
            const name = raw.name || `Milestone NFT #${raw.nftID}`;
            const description =
              raw.description || "Milestone NFT from FanFuel campaign";
            const campaign = "Unknown Campaign";
            const milestone = "Milestone";
            const imageUrl = optimizePinataImageUrl(raw.image || "");

            console.log(`Processed NFT ${raw.nftID}:`, {
              name,
              description,
              campaign,
              milestone,
              originalImage: raw.image,
              optimizedImage: imageUrl,
              hasMetadata: !!(raw.name && raw.image),
            });

            // Only log warning if we couldn't get metadata from either source
            if (imageUrl === "") {
              console.warn(
                `Could not fetch metadata for NFT ${raw.nftID} from either storefront or collection`
              );
            }

            allListings.push({
              id: `${raw.listingID}`,
              listingId: `${raw.listingID}`,
              name,
              image: imageUrl,
              campaign,
              campaignId: "0", // Could be extracted from campaign metadata if needed
              milestone,
              price: parseFloat(raw.price),
              seller: addr,
              listedAt: new Date().toISOString(),
              royaltyRate: parseFloat(raw.royaltyCut),
              rarity: "Common", // Could be determined from metadata
              description,
            });
          } catch (metadataError) {
            console.error(
              `Error fetching metadata for NFT ${raw.nftID} (listing ${raw.listingID}):`,
              metadataError
            );

            // Add listing with fallback data if metadata fetch fails
            allListings.push({
              id: `${raw.listingID}`,
              listingId: `${raw.listingID}`,
              name: `Milestone NFT #${raw.nftID}`,
              image: "",
              campaign: "Unknown Campaign",
              campaignId: "0",
              milestone: "Milestone",
              price: parseFloat(raw.price),
              seller: addr,
              listedAt: new Date().toISOString(),
              royaltyRate: 0.05,
              rarity: "Common",
              description: "Milestone NFT listed on FanFuel",
            });
          }
        }
      }

      console.log(
        `Total processed listings: ${allListings.length}`,
        allListings
      );
      setListings(allListings);
    } catch (err) {
      console.error("Error fetching marketplace listings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch marketplace listings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellers.join(",")]);

  return { listings, loading, error, refetch: fetchListings };
}
