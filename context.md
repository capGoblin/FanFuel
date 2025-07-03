### 🧠 Prompt: **"FanFuel" — A Milestone-Based NFT Crowdfunding Platform with Royalties for Fans**

---

**Project Name:** FanFuel

**One-Liner:** _Fan-powered NFT campaigns where backers own tradable milestones and earn resale royalties._

---

## 🧭 What is FanFuel?

**FanFuel** is a **crowdfunding platform on the Flow blockchain** , where creators launch **milestone-based campaigns** and mint **NFTs as proof of backer support** . These NFTs:

- Represent ownership in a specific campaign milestone
- Can be **resold in any Flow-compatible marketplace**
- Include **royalty logic** , so original backers earn **a cut of every secondary sale**

---

## 🧩 Problem

Creators want to raise funds with:

- Direct fan participation
- Built-in ownership + perks
- Composable monetization

Fans want:

- Real utility beyond just support
- Early access and resale value
- A way to benefit from viral creator success

Marketplaces & ecosystems want:

- NFTs with real financial logic
- Native royalty support
- Easy resale & integration

---

## 🚀 How FanFuel Works

### Step 1: Creator launches a campaign

- Creator defines:
  - `goalAmount`
  - `milestones[]` (e.g., ["Script", "Shooting", "Post", "Distribution"])
  - Number of NFTs to mint (e.g., 1000 NFTs)
- Each NFT represents a unit stake in the full campaign
- FanFuel contract mints NFTs via `MilestoneNFT` contract

### Step 2: Fans fund campaigns by buying NFTs

- Each NFT costs: `goalAmount / totalNFTs`
- NFT includes:
  - Metadata about campaign
  - Milestone structure
  - Royalties config
- Funds are tracked toward campaign goal

### Step 3: NFT resale anytime — with royalties

- Fans can sell their NFTs in any Flow-compatible marketplace (via NFTStorefrontV2)
- Creator **sets royalties** when minting
- Original fans earn % of secondary sale as royalties (optional shared royalty struct)

### Step 4: Creators unlock milestones

- As funding hits thresholds (e.g., 25%, 50%, etc.), creators can mark milestones completed
- Optional: unlock perks (e.g., private links, airdrops, physical items) for holders of NFTs tied to that milestone

---

## 🧑‍🤝‍🧑 User Roles

### 🧑 Creator

- Launches campaign
- Defines total raise + milestone names
- Mints NFTs to fans upon purchase
- Can create off-chain or on-chain perks
- Receives funds after milestones unlock

### 🧑 Fan

- Buys milestone NFTs
- Sells on any marketplace
- Earns resale royalties (if applicable)
- Gets access to perks if eligible

### 🛍️ Marketplace (optional)

- Indexes `ListingAvailable` events
- Shows NFTs listed by fans
- Honors Flow’s royalty metadata for payouts

---

## 📜 Contracts Overview

### ✅ 1. `CampaignManager.cdc`

- Stores all campaign metadata
- Handles milestone logic
- Triggers NFT minting

**Key Methods:**

- `createCampaign()`
- `getCampaigns()`
- `contributeAndMint()`

---

### ✅ 2. `MilestoneNFT.cdc`

- Standard Flow NFT contract
- Inherits:
  - `NonFungibleToken`
  - `MetadataViews.Resolver`
  - `MetadataViews.Royalties`

**NFT Metadata:**

- Campaign ID
- Milestones list
- Creator address
- Royalty details

---

### ✅ 3. Integration with `NFTStorefrontV2`

- Enables resale of NFTs
- Handles auto-payout of royalties
- Storefront is owned by fan, not platform

---

## 💸 Revenue & Economic Model

- Creator receives: `saleAmount - royaltyCut - commission (optional)`
- Fan receives: resale profit + royalties from future resales
- Platform could take commission (optional `saleCut`)

---

## 🔁 Royalty Design

- Supports **creator royalties** natively
- Optionally supports **fan backer royalties** (split via `saleCuts`)
- Uses `MetadataViews.Royalties` standard to ensure compatibility with all marketplaces on Flow

---

## 🎯 Features at a Glance

| Feature                             | Status          |
| ----------------------------------- | --------------- |
| Campaign creation                   | ✅ Core feature |
| Milestone tracking                  | ✅ Core feature |
| NFT minting w/ metadata & royalties | ✅ Core feature |
| NFT resale on marketplaces          | ✅ Core feature |
| Perk unlocks for holders            | ✅ Optional     |
| Fan royalties on resale             | ✅ Optional     |
| Flow + USDC support                 | 🔜 Future       |

---

## 🔨 Tech Stack

- 📦 Smart Contracts: Cadence (Flow)
- 💼 NFT standard: `NonFungibleToken + MetadataViews`
- 🛍 Marketplace integration: `NFTStorefrontV2`
- 💰 Token support: `FungibleToken`, FLOW (optionally USDC)
- 🔧 Dev tools: Flow CLI, Cadence Playground, Flow Emulator
