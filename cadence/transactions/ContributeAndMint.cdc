import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import CampaignManager from "CampaignManager"
import NonFungibleToken from "NonFungibleToken"
import MilestoneNFT from "MilestoneNFT"

/// Contribute a specified FLOW amount to a campaign and automatically receive an NFT.
/// The signer must be the contributor.
transaction(campaignID: UInt64, amount: UFix64) {
    /// We need Storage access to read/write, and BorrowValue to borrow from storage.
    prepare(acct: auth(Storage, BorrowValue) &Account) {
        // 1️⃣ Ensure the signer has a MilestoneNFT.Collection stored
        if acct.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath) == nil {
            let collection <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
            acct.storage.save(<-collection, to: MilestoneNFT.CollectionStoragePath)
        }

        // Collection acts as an NFT receiver
        let receiverRef = acct.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath)
            ?? panic("Could not borrow NFT collection")
        let nftReceiver = receiverRef as &{NonFungibleToken.Receiver}

        // 2️⃣ Withdraw the specified FLOW amount from the user's vault
        let vaultRef = acct.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault with withdraw capability")
        let payment <- vaultRef.withdraw(amount: amount)

        // 3️⃣ Call the contract to record contribution and mint NFT
        CampaignManager.contributeAndMint(
            campaignID: campaignID,
            payment: <-payment,
            nftRecipient: nftReceiver
        )
    }

    execute {
        log("Contribution successful and NFT minted 🎉")
    }
} 