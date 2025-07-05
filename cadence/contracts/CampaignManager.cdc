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
    access(all) event MilestoneWithdrawn(campaignID: UInt64, milestoneIndex: UInt64, amount: UFix64)

    // --- Contract-level state ---
    access(all) var totalCampaigns: UInt64
    access(self) var campaigns: {UInt64: Campaign}
    // Each campaign ID maps to a Flow vault that accumulates contributions
    access(self) var campaignVaults: @{UInt64: FlowToken.Vault}

    // --- Structs ---
    access(all) struct Campaign {
        access(all) let id: UInt64
        access(all) let creator: Address
        access(all) let title: String
        access(all) let description: String
        access(all) let imageURL: String
        access(all) let goalAmount: UFix64
        access(all) let milestones: [String]
        access(all) let totalNFTs: UInt64
        access(all) var fundedAmount: UFix64
        access(all) var nftsMinted: UInt64
        access(all) var milestonesClaimed: UInt64

        init(creator: Address, title: String, description: String, imageURL: String, goalAmount: UFix64, milestones: [String], totalNFTs: UInt64) {
            pre {
                goalAmount > 0.0: "Campaign goal must be positive"
                totalNFTs > 0: "Must mint at least one NFT"
            }
            self.id = CampaignManager.totalCampaigns
            self.creator = creator
            self.title = title
            self.description = description
            self.imageURL = imageURL
            self.goalAmount = goalAmount
            self.milestones = milestones
            self.totalNFTs = totalNFTs
            self.fundedAmount = 0.0
            self.nftsMinted = 0
            self.milestonesClaimed = 0
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

        access(all) fun getMilestoneAmount(): UFix64 {
            return self.goalAmount / UFix64(self.milestones.length)
        }

        access(all) fun totalMilestones(): UInt64 {
            return UInt64(self.milestones.length)
        }

        access(contract) fun incrementMilestonesClaimed() {
            self.milestonesClaimed = self.milestonesClaimed + 1
        }
    }

    // --- Public Functions ---
    access(all) fun createCampaign(title: String, description: String, imageURL: String, goalAmount: UFix64, milestones: [String], totalNFTs: UInt64) {
        pre { milestones.length > 0: "Must provide at least one milestone" }
        let newCampaign = Campaign(
            creator: self.account.address,
            title: title,
            description: description,
            imageURL: imageURL,
            goalAmount: goalAmount,
            milestones: milestones,
            totalNFTs: totalNFTs
        )

        self.campaigns[newCampaign.id] = newCampaign
        
        emit CampaignCreated(id: newCampaign.id, creator: newCampaign.creator, title: newCampaign.title, goalAmount: newCampaign.goalAmount)

        self.totalCampaigns = self.totalCampaigns + 1

        // Create an empty vault to hold this campaign's funds
        let emptyVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
        self.campaignVaults[newCampaign.id] <-! emptyVault
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

        // Move the campaign vault out, deposit, then store it back
        let vault <- self.campaignVaults.remove(key: campaignID) 
            ?? panic("Vault missing")
        let receiverRef = (&vault as &{FungibleToken.Receiver})
        receiverRef.deposit(from: <-payment)
        self.campaignVaults[campaignID] <-! vault

        // Build royalty capability for campaign creator
        let creatorCap = getAccount(campaign.creator)
            .capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        let newNFTID: UInt64 = MilestoneNFT.mintNFT(
            recipient: nftRecipient,
            name: campaign.title,
            description: campaign.description,
            image: campaign.imageURL,
            royaltyReceiver: creatorCap,
            royaltyCut: 0.05
        )

        emit ContributionReceived(campaignID: campaignID, from: nftRecipient.owner!.address, amount: nftPrice)
        emit NFTMinted(campaignID: campaignID, nftID: newNFTID, recipient: nftRecipient.owner!.address)
    }

    access(all) fun getCampaigns(): [Campaign] {
        return self.campaigns.values
    }

    access(all) fun getCampaign(id: UInt64): Campaign? {
        return self.campaigns[id]
    }

    access(all) fun getNFTPriceFor(campaignID: UInt64): UFix64 {
        pre { self.campaigns[campaignID] != nil: "Campaign does not exist" }
        let camp = self.campaigns[campaignID]!
        return camp.getNFTPrice()
    }

    // --- NEW: view the amount collected for a campaign ---
    access(all) view fun getCollectedAmount(campaignID: UInt64): UFix64 {
    pre {
        self.campaignVaults[campaignID] != nil: "Vault does not exist"
    }

        let vaultRef = (&self.campaignVaults[campaignID] as &FlowToken.Vault?)!
        return vaultRef.balance
    }

    // --- NEW: creator-controlled withdrawal ---
    // `recipientCap` is usually the creator's /public/flowTokenReceiver capability.
    access(all) fun withdrawFunds(
        campaignID: UInt64,
        amount: UFix64,
        recipientCap: Capability<&{FungibleToken.Receiver}>
    ) {
        pre {
            self.campaigns[campaignID] != nil: "Campaign does not exist"
            self.campaignVaults[campaignID] != nil: "Vault not found"
        }

        let campaign = self.campaigns[campaignID]!

        // OPTIONAL: ensure the caller passed a cap that belongs to the creator.
        // We can't inspect the transaction signer here, but we can at least check the
        // cap's address matches the campaign creator.
        assert(recipientCap.address == campaign.creator, message: "Recipient must be the campaign creator")

        var vault <- self.campaignVaults.remove(key: campaignID) 
            ?? panic("Vault not found")

        let withdrawal <- vault.withdraw(amount: amount)

        // put vault back after withdrawal
        self.campaignVaults[campaignID] <-! vault

        // deposit to creator
        let receiver = recipientCap.borrow()
            ?? panic("Could not borrow receiver capability")

        receiver.deposit(from: <-withdrawal)

        // Generic withdrawal does not emit milestone events or alter milestone counters
    }

    // --- NEW: Withdraw exactly one milestone payout once enough funds have accumulated ---
    access(all) fun withdrawNextMilestone(
        campaignID: UInt64,
        recipientCap: Capability<&{FungibleToken.Receiver}>
    ) {
        pre {
            self.campaigns[campaignID] != nil: "Campaign does not exist"
            self.campaignVaults[campaignID] != nil: "Vault not found"
        }

        let campaign = &self.campaigns[campaignID]! as &Campaign

        // Ensure the caller supplied the creator's capability
        assert(recipientCap.address == campaign.creator, message: "Recipient must be the campaign creator")

        // Ensure there are still milestones left to claim
        assert(campaign.milestonesClaimed < campaign.totalMilestones(), message: "All milestones already claimed")

        let milestoneAmount: UFix64 = campaign.getMilestoneAmount()

        // Access the vault holding this campaign's funds
        var vault <- self.campaignVaults.remove(key: campaignID) ?? panic("Vault not found")

        // Verify that enough money has been collected for the next milestone payout
        assert(vault.balance >= milestoneAmount, message: "Not enough funds collected for next milestone")

        let payout <- vault.withdraw(amount: milestoneAmount)

        // Store back the vault after withdrawal
        self.campaignVaults[campaignID] <-! vault

        // Deposit into creator's vault
        let receiver = recipientCap.borrow() ?? panic("Could not borrow receiver capability")
        receiver.deposit(from: <-payout)

        // Update milestone tracker
        campaign.incrementMilestonesClaimed()

        emit MilestoneWithdrawn(campaignID: campaignID, milestoneIndex: campaign.milestonesClaimed - 1, amount: milestoneAmount)
    }

    // --- Initialization ---
    init() {
        self.totalCampaigns = 0
        self.campaigns = {}
        self.campaignVaults <- {}
    }

    // (no custom destructor – Cadence 1.0 disallows it)
}