import MetadataViews from "MetadataViews"
import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"
import ViewResolver from "ViewResolver"

/// Returns Display and Royalties metadata for an NFT
/// Result structure: {"display": MetadataViews.Display?, "royalties": MetadataViews.Royalties?}
access(all) fun main(account: Address, id: UInt64): {String: AnyStruct?} {
    let collection = getAccount(account)
        .capabilities.get<&{ViewResolver.ResolverCollection}>(MilestoneNFT.CollectionPublicPath)
        .borrow()
        ?? panic("Could not borrow resolver collection")

    let resolver = collection.borrowViewResolver(id: id)
        ?? panic("No NFT with this ID")
    let display = MetadataViews.getDisplay(resolver)
    let royalties = MetadataViews.getRoyalties(resolver)
    return {
        "display": display,
        "royalties": royalties
    }
} 