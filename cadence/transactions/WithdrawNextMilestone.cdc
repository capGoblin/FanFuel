import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"
import CampaignManager from "CampaignManager"

/// Withdraw the next milestone payout for a given campaign.
/// Must be signed by the campaign creator.
///
/// Parameters:
///   - `campaignID`: The ID of the campaign to withdraw from.
transaction(campaignID: UInt64) {

    /// We need storage access to read the creator's vault capability.
    prepare(acct: auth(Storage) &Account) {
        // Obtain the creator's FlowToken receiver capability at the public path
        let creatorCap = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // Call the contract to perform the withdrawal. It will verify that the
        // capability address matches the campaign's creator and that enough
        // funds are available for the next milestone.
        CampaignManager.withdrawNextMilestone(
            campaignID: campaignID,
            recipientCap: creatorCap
        )
    }

    execute {
        log("Successfully withdrew next milestone payout ✨")
    }
} 