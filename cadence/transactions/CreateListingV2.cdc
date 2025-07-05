import NFTStorefrontV2  from 0x2d55b98eb200daef
import MilestoneNFT     from 0xf6b21946a45d6228
import NonFungibleToken from 0x631e88ae7f1d7c20
import FungibleToken    from 0x9a0766d93b6608b7
import FlowToken        from 0x7e60df042a9c0868

// Lists a MilestoneNFT in the owner's StorefrontV2 for the given sale price (FLOW).
// Requires the signer to own the NFT and have a Storefront resource stored at
// /storage/NFTStorefrontV2.
//
// Params:
//  - nftID:      ID of the NFT to list
//  - salePrice:  listing price in FLOW
transaction(nftID: UInt64, price: UFix64) {

    prepare(acct: auth(Storage, Capabilities) &Account) {
        let storefrontRef = acct.storage.borrow<auth(NFTStorefrontV2.Storefront.CreateListing) &NFTStorefrontV2.Storefront>(
            from: NFTStorefrontV2.StorefrontStoragePath
        ) ?? panic("Missing storefront")

        let providerCap = acct.capabilities
            .storage
            .issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                MilestoneNFT.CollectionStoragePath
            )

        // 3️⃣ FlowToken receiver capability for sale proceeds
        let receiverCap = acct.capabilities
            .get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // 4️⃣ Create the listing
        storefrontRef.createListing(
            nftProviderCapability: providerCap,
            nftType:               Type<@MilestoneNFT.NFT>(),
            nftID:                 nftID,
            salePaymentVaultType:  Type<@FlowToken.Vault>(),
            saleCuts: [
                NFTStorefrontV2.SaleCut(
                    receiver: receiverCap,
                    amount:   price
                )
            ],
            marketplacesCapability: nil,
            customID:               nil,
            commissionAmount:       0.0,
            expiry:                 UInt64(getCurrentBlock().height + 10000)
        )
    }

    execute {
        log("✅ Listing created on StorefrontV2")
    }
} 