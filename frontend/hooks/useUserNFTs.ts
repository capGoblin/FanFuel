import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { CloudCog } from "lucide-react";

interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  royalties?: {
    receiver: string;
    cut: number;
    description: string;
  }[];
}

interface UseUserNFTsResult {
  nfts: NFTMetadata[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

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

export function useUserNFTs(userAddress: string | null): UseUserNFTsResult {
  const [nfts, setNFTs] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNFTs = async () => {
    if (!userAddress) {
      setNFTs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, get the NFT IDs owned by the user
      const getNFTIdsScript = `
        import NonFungibleToken from 0x631e88ae7f1d7c20
        import MilestoneNFT from 0xMilestoneNFT

        access(all) fun main(account: Address): [UInt64] {
            let collectionRef = getAccount(account)
                .capabilities.get<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)
                .borrow()

            if collectionRef == nil {
                return []
            }

            return collectionRef!.getIDs()
        }
      `;

      const nftIds = await fcl.query({
        cadence: getNFTIdsScript,
        args: (arg, t) => [arg(userAddress, t.Address)],
      });

      if (!nftIds || nftIds.length === 0) {
        setNFTs([]);
        return;
      }

      // Then, get metadata for each NFT
      const getNFTMetadataScript = `
        import NonFungibleToken from 0x631e88ae7f1d7c20
        import MilestoneNFT from 0xMilestoneNFT

        access(all) fun main(account: Address, id: UInt64): {String: String?} {
            let collection = getAccount(account)
                .capabilities.get<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)
                .borrow()
                ?? panic("Could not borrow collection")

            let nft = collection.borrowNFT(id)
                ?? panic("No NFT with this ID")
            
            // Try to get the actual MilestoneNFT to access fields directly
            if let milestoneNFT = nft as? &MilestoneNFT.NFT {
                return {
                    "directImage": milestoneNFT.image,
                    "directName": milestoneNFT.name,
                    "directDescription": milestoneNFT.description
                }
            }
            
            // Fallback
            return {
                "directImage": "",
                "directName": "",
                "directDescription": ""
            }
        }
      `;

      // Fetch metadata for all NFTs
      const nftMetadataPromises = nftIds.map(async (id: number) => {
        try {
          const metadata = await fcl.query({
            cadence: getNFTMetadataScript,
            args: (arg, t) => [
              arg(userAddress, t.Address),
              arg(id.toString(), t.UInt64),
            ],
          });

          const display = metadata.display;
          const royalties = metadata.royalties;

          console.log(`NFT ${id} metadata:`, {
            display,
            royalties,
            image: display?.thumbnail?.url,
          });

          // Try direct access first, then fall back to MetadataViews
          let imageUrl = "";
          let name = "";
          let description = "";

          if (metadata.directImage !== undefined) {
            // Direct access to NFT fields
            imageUrl = metadata.directImage || "";
            name = metadata.directName || `FanFuel NFT #${id}`;
            description =
              metadata.directDescription ||
              "Milestone NFT from FanFuel campaign";
            console.log(`NFT ${id} using direct access:`, {
              imageUrl,
              name,
              description,
            });
          } else if (display) {
            // MetadataViews access
            imageUrl = display?.thumbnail?.url || "";
            name = display?.name || `FanFuel NFT #${id}`;
            description =
              display?.description || "Milestone NFT from FanFuel campaign";
            console.log(`NFT ${id} using MetadataViews:`, {
              imageUrl,
              name,
              description,
            });
          } else {
            // Fallback
            name = `FanFuel NFT #${id}`;
            description = "Milestone NFT from FanFuel campaign";
            console.log(`NFT ${id} using fallback:`, {
              imageUrl,
              name,
              description,
            });
          }

          const optimizedImageUrl = optimizePinataImageUrl(imageUrl);

          console.log(`NFT ${id} detailed metadata:`, {
            fullMetadata: metadata,
            display: display,
            thumbnail: display?.thumbnail,
            thumbnailUrl: display?.thumbnail?.url,
            originalImageUrl: imageUrl,
            optimizedImageUrl,
          });

          if (imageUrl !== optimizedImageUrl) {
            console.log(`NFT ${id} URL optimized:`, {
              original: imageUrl,
              optimized: optimizedImageUrl,
            });
          }

          return {
            id: id.toString(),
            name,
            description,
            image: optimizedImageUrl, // Use optimized URL for better loading
            royalties:
              royalties?.map((royalty: any) => ({
                receiver: royalty.receiver?.address || "",
                cut: parseFloat(royalty.cut || "0"),
                description: royalty.description || "",
              })) || [],
          };
        } catch (err) {
          console.error(`Error fetching metadata for NFT ${id}:`, err);
          // Return basic NFT info even if metadata fails
          return {
            id: id.toString(),
            name: `FanFuel NFT #${id}`,
            description: "Milestone NFT from FanFuel campaign",
            image: "", // Empty string to trigger fallback UI
            royalties: [],
          };
        }
      });

      const nftMetadata = await Promise.all(nftMetadataPromises);
      console.log(nftMetadata);
      setNFTs(nftMetadata);
    } catch (err) {
      console.error("Error fetching user NFTs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNFTs();
  }, [userAddress]);

  return {
    nfts,
    loading,
    error,
    refetch: fetchUserNFTs,
  };
}
