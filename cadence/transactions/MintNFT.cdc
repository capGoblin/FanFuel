import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"
import FungibleToken from "FungibleToken"

transaction(recipient: Address, name: String, description: String, image: String, royaltyCut: UFix64) {
    prepare(signer: auth(Storage) &Account) {
        // Get a reference to the recipient's collection
        let recipientCollectionRef = getAccount(recipient)
            .capabilities.get<&{NonFungibleToken.Collection}>(MilestoneNFT.CollectionPublicPath)
            .borrow()
            ?? panic("Could not get recipient's collection reference")

        // Get royalty receiver capability (FlowToken receiver for signer)
        let royaltyCap = signer.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // Mint the NFT
        MilestoneNFT.mintNFT(
            recipient: recipientCollectionRef,
            name: name,
            description: description,
            image: image,
            royaltyReceiver: royaltyCap,
            royaltyCut: royaltyCut
        )

        log("NFT minted successfully")
    }

    execute {
        log("Mint NFT transaction executed")
    }
} 