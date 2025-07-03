Below is a concise “phase-2” roadmap that takes FanFuel from the current
emulator prototype to an end-to-end dApp running on Flow **testnet** with a
simple web UI. I’ve broken it into bite-sized work-items you can tackle (and
demo) one after another.

────────────────────────────────────────
0. Prerequisites Recap (already done)
────────────────────────────────────────
• Contracts in project – `CampaignManager`, `MilestoneNFT` (metadata + royalties), **stub** `NFTStorefrontV2`.
• Cadence transactions / scripts – collection setup, campaign creation,
contribute & mint, listing & purchase stubs.
• Flow CLI + emulator workflow proven locally.

────────────────────────────────────────

1. Contract Layer – finish production readiness
   ────────────────────────────────────────
   1-A  Replace **stub** `NFTStorefrontV2` with the real contract
   • Copy the open-source Cadence file into
   `cadence/contracts/NFTStorefrontV2.cdc`.
   • Keep the same storage/public paths so existing txs compile.
   • Update any transactions to use real API
   (`Listing`s, events, etc.).
   • Extend `GetListings.cdc` to read actual listings.

1-B  Harden `CampaignManager`
    • Route incoming FLOW to the creator vault instead of`destroy`.
    • Add`withdrawFunds()` for creators once milestones reach goal.
    • Optional: milestone-progress events.

1-C  Unit-tests in `/cadence/tests`
    • Use`flow test` to assert minting, royalties, listings.

────────────────────────────────────────
2. Deploy to **testnet**
────────────────────────────────────────
2-A  Create two Flow testnet accounts (creator, fan) and add them to
`flow.json` under `"accounts"`.

2-B  In `flow.json`
    • Add testnet aliases for every contract
      (`CampaignManager`, `MilestoneNFT`, `NFTStorefrontV2`).
    • Add a`deployments.testnet` section pointing to your creator
      account.

2-C  Command

```
flow project deploy --network testnet
```

Record the on-chain addresses (FCL will read them automatically).

────────────────────────────────────────
3.  Front-end scaffold
────────────────────────────────────────
Tech pick: React + Vite or Next.js + TypeScript + Tailwind.

3-A  FCL setup

```ts
import {config} from "@onflow/fcl";
import flowJSON from "../flow.json";

config({
  "flow.network": "testnet",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "accessNode.api": "https://rest-testnet.onflow.org"
}).load({flowJSON});
```

3-B  Wallet login component
  • `fcl.authenticate()`, `fcl.currentUser().subscribe()`
  • Display address & FLOW balance.

3-C  Creator dashboard pages

1. New Campaign form → signs `CreateCampaign.cdc`.
2. List of my campaigns (call `GetCampaigns.cdc`).
3. Withdraw button when fully funded.

3-D  Fan pages

1. Explore campaigns – show title, description, NFT price.
2. Contribute modal – withdraw FLOW & run
   `ContributeAndMint.cdc`.
3. “My NFTs” gallery – run `GetNFTCollection.cdc` +
   `GetNFTMetadata.cdc`.

3-E  Marketplace stub view

1. “Create Listing” – choose owned NFT, set price, runs
   `CreateListing.cdc`.
2. “Listings” table – call `GetListings.cdc` and
   subscribe to `ListingAvailable` events (FCL event stream).
3. “Buy” – signs `PurchaseListing.cdc`.

────────────────────────────────────────
4. Quality-of-Life & DevOps
────────────────────────────────────────
• .env file for API endpoints & FCL config.
• GitHub Actions to run `flow test` on every PR.
• Static deploy (Vercel / Netlify) – remember to expose
  the `flow.json` and `.env` variables.

────────────────────────────────────────
5. Demo Script (live on testnet)
────────────────────────────────────────

1. Creator logs in → “Create Campaign”.
2. Fan logs in → “Contribute” (exact price auto-filled).
3. Fan sees NFT appear in “My NFTs” gallery (metadata & royalty
   visible).
4. Fan lists NFT; listing shows in Marketplace table.
5. Second browser session buys NFT; `ListingCompleted` event fires;royalty payments auto-distributed (proves on-chain royalty logic).
6. Creator withdraws funds when goal reached.

───────────
That’s the full blueprint from current emulator proof-of-concept to a
public demo on Flow **testnet** with working UI, wallet auth, royalties and
market-ready secondary sales. Start with step 1-A (swap in the real
NFTStorefrontV2) and move down the list—we can iterate on each chunk as
you implement it.
