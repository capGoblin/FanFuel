import NFTStorefrontV2 from "NFTStorefrontV2"
import MilestoneNFT      from "MilestoneNFT"
import NonFungibleToken  from "NonFungibleToken"
import MetadataViews     from "MetadataViews"
import ViewResolver      from "ViewResolver"

/// Returns all active listings for MilestoneNFTs in the given account's storefront.
/// Each element is a {String: AnyStruct} dictionary with keys:
///  - listingID    : UInt64
///  - nftID        : UInt64
///  - price        : UFix64 (FLOW)
///  - expiry       : UInt64 (timestamp)
///  - seller       : Address
///  - name         : String (Display.name)
///  - description  : String (Display.description)
///  - image        : String (Display.thumbnail.url)
///  - royaltyCut   : UFix64 (first royalty cut if available, 0.0 otherwise)
///
/// If the account has no storefront, or no matching listings, the script returns an empty array.
access(all) fun main(account: Address): [{String: AnyStruct}] {
    // Borrow the public storefront capability. Return early if absent
    let storefront = getAccount(account)
        .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
        .borrow()
    if storefront == nil {
    return []
    }

    // Try to borrow the owner's MilestoneNFT collection for metadata look-ups.
    // We use the ResolverCollection interface so we can call borrowViewResolver.
    let resolverCol = getAccount(account)
        .capabilities.get<&{ViewResolver.ResolverCollection}>(MilestoneNFT.CollectionPublicPath)
        .borrow()

    let ids = storefront!.getListingIDs()
    var results: [{String: AnyStruct}] = []

    for id in ids {
        if let listing = storefront!.borrowListing(listingResourceID: id) {
            let details = listing.getDetails()
            
            // Skip listings that have already been purchased
            if details.purchased {
                continue
            }
            
            // Include only MilestoneNFT listings
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
                    "listingID":   id,
                    "nftID":       details.nftID,
                    "price":       details.salePrice,
                    "expiry":      details.expiry,
                    "seller":      account,
                    "name":        name,
                    "description": desc,
                    "image":       img,
                    "royaltyCut":  royalty
                })
            }
        }
    }

    return results
} 