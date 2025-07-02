import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"

access(all) fun main(account: Address): [UInt64] {
    let collectionRef = getAccount(account)
        .capabilities.get<&{NonFungibleToken.Collection}>(MilestoneNFT.CollectionPublicPath)
        .borrow()
        ?? panic("Could not get collection reference")

    return collectionRef.getIDs()
} 