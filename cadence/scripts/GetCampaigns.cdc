import "CampaignManager"

/// Script to get all campaigns from the CampaignManager
///
access(all) fun main(): [CampaignManager.Campaign] {
    let campaignManagerRef = getAccount(0xf8d6e0586b0a20c7).contracts.borrow<&CampaignManager>(name: "CampaignManager")
        ?? panic("Could not borrow CampaignManager contract reference")
    
    return campaignManagerRef.getCampaigns()
} 