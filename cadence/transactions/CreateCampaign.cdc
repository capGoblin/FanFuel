import "CampaignManager"

/// Transaction to create a new crowdfunding campaign
///
transaction(
    title: String,
    description: String,
    goalAmount: UFix64,
    milestones: [String],
    totalNFTs: UInt64
) {
    
    let campaignManagerRef: &CampaignManager
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the CampaignManager contract
        self.campaignManagerRef = getAccount(0xf8d6e0586b0a20c7).contracts.borrow<&CampaignManager>(name: "CampaignManager")
            ?? panic("Could not borrow CampaignManager contract reference")
    }
    
    execute {
        self.campaignManagerRef.createCampaign(
            title: title,
            description: description,
            goalAmount: goalAmount,
            milestones: milestones,
            totalNFTs: totalNFTs
        )
        
        log("Campaign created successfully!")
        log("Title: ".concat(title))
        log("Goal Amount: ".concat(goalAmount.toString()))
    }
} 