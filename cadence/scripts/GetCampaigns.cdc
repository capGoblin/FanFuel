import "CampaignManager"

access(all) fun main(): [CampaignManager.Campaign] {
    let campaignManagerRef = getAccount(0xf6b21946a45d6228).contracts.borrow<&CampaignManager>(name: "CampaignManager")
        ?? panic("Could not borrow CampaignManager contract reference")
    
    return campaignManagerRef.getCampaigns()
}