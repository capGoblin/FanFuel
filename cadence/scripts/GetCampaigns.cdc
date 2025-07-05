import "CampaignManager"

/// Returns all campaigns (array of Campaign structs)
access(all) fun main(): [CampaignManager.Campaign] {
    return CampaignManager.getCampaigns()
} 