import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Return early if the account already has a collection
        if signer.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath) != nil {
            log("Collection already exists")
            return
        }

        // Create a new empty collection
        let collection <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())

        // Save it to the account
        signer.storage.save(<-collection, to: MilestoneNFT.CollectionStoragePath)

        // Create a public capability for the collection
        signer.capabilities.publish(
            signer.capabilities.storage.issue<&{NonFungibleToken.Collection}>(MilestoneNFT.CollectionStoragePath),
            at: MilestoneNFT.CollectionPublicPath
        )

        log("NFT Collection setup complete")
    }

    execute {
        log("Setup NFT Collection transaction executed")
    }
} 