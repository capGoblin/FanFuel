import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"

transaction(recipient: Address) {
    prepare(signer: auth(Storage) &Account) {
        // Get a reference to the recipient's collection
        let recipientCollectionRef = getAccount(recipient)
            .capabilities.get<&{NonFungibleToken.Collection}>(MilestoneNFT.CollectionPublicPath)
            .borrow()
            ?? panic("Could not get recipient's collection reference")

        // Mint the NFT
        MilestoneNFT.mintNFT(recipient: recipientCollectionRef)

        log("NFT minted successfully")
    }

    execute {
        log("Mint NFT transaction executed")
    }
} 