import "CampaignManager"

/// Script to get a single campaign by ID from the CampaignManager
///
access(all) fun main(campaignID: UInt64): CampaignManager.Campaign? {
    let campaignManagerRef = getAccount(0xf6b21946a45d6228).contracts.borrow<&CampaignManager>(name: "CampaignManager")
        ?? panic("Could not borrow CampaignManager contract reference")
    
    return campaignManagerRef.getCampaign(id: campaignID)
} 