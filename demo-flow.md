## 📄 Smart Contracts (`cadence/contracts`)

### A. `MilestoneNFT.cdc`

**Public Functions**

- `createEmptyCollection(): @Collection`
- `mintNFT(recipient, name, description, image, royaltyReceiver, royaltyCut): UInt64`

**Collection Resource Interface**

- `deposit(token: @NFT)`
- `withdraw(withdrawID: UInt64): @NFT`
- `borrowNFT(id: UInt64): &NFT`
- `borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver}`

---

### B. `CampaignManager.cdc`

**Core Campaign Functions**

- `createCampaign(title, description, goalAmount, milestones: [String], totalNFTs: UInt64)`
- `contributeAndMint(campaignID: UInt64, paymentVault: @FungibleToken.Vault, nftRecipient: Address)`
- `getCampaigns(): [Campaign]`
- `getCampaign(id: UInt64): Campaign`
- `getNFTPriceFor(campaignID: UInt64): UFix64`

---

### C. `NFTStorefrontV2.cdc` (Stub)

**Storefront Lifecycle**

- `createStorefront(): @Storefront`

**Storefront Resource Functions**

- `createListing(...)` → logs: _“Listing created (stub)”_
- `purchaseListing(listingID, payment: @Vault)` → logs: _“Listing purchased (stub)”_

---

## 🧾 User-Facing Transactions (`cadence/transactions`)

- `SetupNFTCollection.cdc` – one-time setup per user
- `SetupStorefront.cdc` – one-time storefront setup
- `CreateCampaign.cdc` – create new campaign
- `ContributeAndMint.cdc` – contribute FLOW + receive NFT
- `MintNFT.cdc` – dev-only manual mint
- `CreateListing.cdc` – list owned NFT for resale _(stub)_
- `PurchaseListing.cdc` – purchase listed NFT _(stub)_

---

## 🔍 Read-Only Scripts (`cadence/scripts`)

- `GetCampaigns.cdc` – return `[Campaign]`
- `GetNFTCollection.cdc` – return `[UInt64]` of owned NFTs
- `GetNFTMetadata.cdc` – return MetadataViews for NFT ID
- `GetListings.cdc` – stub placeholder, returns empty list

---

## 🧪 dApp Demo Sequence

### 👤 Creator Journey

1. **Run** `SetupNFTCollection` _(creator)_
2. **Call** `CreateCampaign` with title, goal, milestones
3. **Script** `GetCampaigns` → display in UI
4. **Call** `getNFTPriceFor(campaignID)` → show contribution price

### 🙋 Fan Journey

5. **Run** `SetupNFTCollection` _(fan – one-time)_
6. **Call** `ContributeAndMint` with FLOW & campaignID

   🔔 Expect:

   - `ContributionReceived` event
   - `NFTMinted` event

7. **Script** `GetNFTCollection` & `GetNFTMetadata` → display NFT

### 🔄 Secondary Market (Stub)

8. **Run** `SetupStorefront` _(fan)_
9. **Call** `CreateListing` with NFT ID & price → log: _“Listing created (stub)”_
10. _(Optional)_ `GetListings` (stub) → returns `[]`
11. **Call** `PurchaseListing` _(from another account)_

    🔔 Expect: _“Listing purchased (stub)”_ log

---

## ✅ Outcome

You’ve now walked through:

**Campaign creation → Contribution → NFT mint → Listing → Purchase**

To go production-ready, simply swap the stubbed `NFTStorefrontV2` logic with the full Flow open-source storefront implementation.
