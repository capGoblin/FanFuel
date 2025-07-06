import NonFungibleToken from 0x631e88ae7f1d7c20
import MilestoneNFT from 0xa474cefca3cbc541

/// Script to directly access NFT fields bypassing MetadataViews
access(all) fun main(account: Address, id: UInt64): {String: String} {
    let collection = getAccount(account)
        .capabilities.get<&{NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)
        .borrow()
        ?? panic("Could not borrow collection")

    let nft = collection.borrowNFT(id: id)
        ?? panic("No NFT with this ID")
    
    // Cast to MilestoneNFT to access direct fields
    if let milestoneNFT = nft as? &MilestoneNFT.NFT {
        return {
            "id": milestoneNFT.id.toString(),
            "name": milestoneNFT.name,
            "description": milestoneNFT.description,
            "image": milestoneNFT.image
        }
    }
    
    return {
        "error": "Could not cast to MilestoneNFT"
    }
} 