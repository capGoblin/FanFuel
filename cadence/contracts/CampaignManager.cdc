import "FungibleToken"
import "FlowToken"
import "NonFungibleToken"
import "MilestoneNFT"

/// CampaignManager contract
///
/// This contract is responsible for creating and managing all crowdfunding campaigns on FanFuel.
access(all) contract CampaignManager {

    // --- Events ---
    access(all) event CampaignCreated(id: UInt64, creator: Address, title: String, goalAmount: UFix64)
    access(all) event ContributionReceived(campaignID: UInt64, from: Address, amount: UFix64)
    access(all) event NFTMinted(campaignID: UInt64, nftID: UInt64, recipient: Address)

    // --- Contract-level state ---
    access(all) var totalCampaigns: UInt64
    access(self) var campaigns: {UInt64: Campaign}

    // --- Structs ---
    access(all) struct Campaign {
        access(all) let id: UInt64
        access(all) let creator: Address
        access(all) let title: String
        access(all) let description: String
        access(all) let goalAmount: UFix64
        access(all) let milestones: [String]
        access(all) let totalNFTs: UInt64
        access(all) var fundedAmount: UFix64
        access(all) var nftsMinted: UInt64

        init(creator: Address, title: String, description: String, goalAmount: UFix64, milestones: [String], totalNFTs: UInt64) {
            pre {
                goalAmount > 0.0: "Campaign goal must be positive"
                totalNFTs > 0: "Must mint at least one NFT"
            }
            self.id = CampaignManager.totalCampaigns
            self.creator = creator
            self.title = title
            self.description = description
            self.goalAmount = goalAmount
            self.milestones = milestones
            self.totalNFTs = totalNFTs
            self.fundedAmount = 0.0
            self.nftsMinted = 0
        }

        access(contract) fun updateFunding(amount: UFix64) {
            self.fundedAmount = self.fundedAmount + amount
        }

        access(contract) fun incrementNFTsMinted() {
            self.nftsMinted = self.nftsMinted + 1
        }

        access(all) fun getNFTPrice(): UFix64 {
            return self.goalAmount / UFix64(self.totalNFTs)
        }

        access(all) fun isFullyFunded(): Bool {
            return self.fundedAmount >= self.goalAmount
        }

        access(all) fun canMintMore(): Bool {
            return self.nftsMinted < self.totalNFTs
        }
    }

    // --- Public Functions ---
    access(all) fun createCampaign(title: String, description: String, goalAmount: UFix64, milestones: [String], totalNFTs: UInt64) {
        let newCampaign = Campaign(
            creator: self.account.address,
            title: title,
            description: description,
            goalAmount: goalAmount,
            milestones: milestones,
            totalNFTs: totalNFTs
        )

        self.campaigns[newCampaign.id] = newCampaign
        
        emit CampaignCreated(id: newCampaign.id, creator: newCampaign.creator, title: newCampaign.title, goalAmount: newCampaign.goalAmount)

        self.totalCampaigns = self.totalCampaigns + 1
    }

    access(all) fun contributeAndMint(
        campaignID: UInt64, 
        payment: @{FungibleToken.Vault},
        nftRecipient: &{NonFungibleToken.Receiver}
    ) {
        pre {
            self.campaigns[campaignID] != nil: "Campaign does not exist"
        }

        let campaign = &self.campaigns[campaignID]! as &Campaign
        let nftPrice = campaign.getNFTPrice()
        
        // Verify payment amount
        assert(payment.balance == nftPrice, message: "Incorrect payment amount")
        assert(campaign.canMintMore(), message: "No more NFTs available for this campaign")

        // Update campaign funding
        campaign.updateFunding(amount: payment.balance)
        campaign.incrementNFTsMinted()

        // Store the payment (in a real implementation, this would go to the creator)
        // For MVP, simply destroy it
        destroy payment

        // Mint the NFT to the contributor
        let newNFTID: UInt64 = MilestoneNFT.mintNFT(recipient: nftRecipient)

        emit ContributionReceived(campaignID: campaignID, from: nftRecipient.owner!.address, amount: nftPrice)
        emit NFTMinted(campaignID: campaignID, nftID: newNFTID, recipient: nftRecipient.owner!.address)
    }

    access(all) fun getCampaigns(): [Campaign] {
        return self.campaigns.values
    }

    access(all) fun getCampaign(id: UInt64): Campaign? {
        return self.campaigns[id]
    }

    // --- Initialization ---
    init() {
        self.totalCampaigns = 0
        self.campaigns = {}
    }
} 