import "CampaignManager"

/// Transaction to create a new crowdfunding campaign
///
transaction(
    title: String,
    description: String,
    imageURL: String,
    goalAmount: UFix64,
    milestones: [String],
    totalNFTs: UInt64
) {
    
    // cache signer address for use in execute
    let creatorAddress: Address
    
    let campaignManagerRef: &CampaignManager
    
    prepare(signer: auth(Storage) &Account) {
        // Get reference to the CampaignManager contract
        self.campaignManagerRef = getAccount(0xf6b21946a45d6228).contracts.borrow<&CampaignManager>(name: "CampaignManager")
            ?? panic("Could not borrow CampaignManager contract reference")
        
        self.creatorAddress = signer.address
    }
    
    execute {
        self.campaignManagerRef.createCampaign(
            creator: self.creatorAddress,
            title: title,
            description: description,
            imageURL: imageURL,
            goalAmount: goalAmount,
            milestones: milestones,
            totalNFTs: totalNFTs
        )
        
        log("Campaign created successfully!")
        log("Title: ".concat(title))
        log("Goal Amount: ".concat(goalAmount.toString()))
    }
}