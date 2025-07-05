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
    
    prepare(signer: auth(Storage) &Account) {}
    
    execute {
        CampaignManager.createCampaign(
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