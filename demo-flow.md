Here’s a clear catalogue of every on-chain function (grouped by file) and a recommended linear “happy-path” you can showcase in the dApp demo.

────────────────────────────────────────

1. Smart-contracts (cadence/contracts)
   ────────────────────────────────────────
   A. MilestoneNFT.cdc
   • createEmptyCollection() → @Collection
   • mintNFT(recipient, name, description, image, royaltyReceiver, royaltyCut) → UInt64
   • Collection implements
    • deposit\(\) / withdraw\(\) (NFT)
    • borrowNFT(id)
    • borrowViewResolver(id) – enables MetadataViews

B. CampaignManager.cdc
• createCampaign(title, description, goalAmount, milestones[], totalNFTs)
• contributeAndMint(campaignID, paymentVault, nftRecipient)
• getCampaigns() / getCampaign(id)
• getNFTPriceFor(campaignID) → UFix64

C. NFTStorefrontV2.cdc (stub)
• createStorefront() → @Storefront
  Storefront resource exposes:
 • createListing(..) – logs “Listing created (stub)”
 • purchaseListing(listingID, payment @Vault) – logs “Listing purchased (stub)”

────────────────────────────────────────
2. User-facing transactions (cadence/transactions)
────────────────────────────────────────
• SetupNFTCollection.cdc – one-time collection bootstrap
• SetupStorefront.cdc   – one-time storefront bootstrap
• CreateCampaign.cdc    – creator mints a campaign
• ContributeAndMint.cdc – fan pays FLOW + receives NFT
• MintNFT.cdc           – admin/dev mint (testing)
• CreateListing.cdc     – fan lists an owned NFT (stub)
• PurchaseListing.cdc   – buyer purchases the listing (stub)

────────────────────────────────────────
3. Read-only scripts (cadence/scripts)
────────────────────────────────────────
• GetCampaigns.cdc   – array of Campaign structs
• GetNFTCollection.cdc – IDs in a user’s collection
• GetNFTMetadata.cdc  – Display & Royalties views for an NFT
• GetListings.cdc     – returns [] for now (stub placeholder)

────────────────────────────────────────
4. Demo sequence for the dApp
────────────────────────────────────────
Below is the order you can wire into the UI or run in a live walkthrough:

Creator Journey

1. Run SetupNFTCollection (creator account) – ensures a collection exists.
2. CreateCampaign with goal, title, etc. – UI shows “CampaignCreated” event.
3. Use GetCampaigns to populate campaign list; show NFT price via getNFTPriceFor.

Fan Journey
4. SetupNFTCollection (fan) – first-time only.
5. ContributeAndMint with exact price – FLOW is withdrawn, events “ContributionReceived” & “NFTMinted” fire.
6. Call GetNFTCollection & GetNFTMetadata to display the newly received NFT card.

Secondary-market Journey (stubbed)
7. SetupStorefront (fan) – creates Storefront + publishes public capability.
8. CreateListing with NFT id & price – logs “Listing created (stub)”.
9. (Use GetListings once we implement real listing storage.)
10. PurchaseListing from another account – FLOW withdrawn & “Listing purchased (stub)” log confirms call.

That completes the loop: campaign creation → funding → NFT delivery → resale listing → purchase.

Once the UI follows this order the demo will run end-to-end on the emulator. Future work is simply replacing the stubbed storefront with the full open-source NFTStorefrontV2 to get real listing data and events.
