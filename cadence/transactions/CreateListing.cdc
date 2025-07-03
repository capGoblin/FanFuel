import NFTStorefrontV2 from "NFTStorefrontV2"
import MilestoneNFT from "MilestoneNFT"
import NonFungibleToken from "NonFungibleToken"
import FungibleToken from "FungibleToken"
import FlowToken from "FlowToken"

/// Lists a MilestoneNFT in the signer's Storefront at the specified price.
transaction(nftID: UInt64, salePrice: UFix64) {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        let storefront = acct.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath)
            ?? panic("Missing storefront – run SetupStorefront first")

        let providerCap = acct.capabilities.get<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(MilestoneNFT.CollectionPublicPath)

        let receiverCap = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        storefront.createListing(
            nftProviderCapability: providerCap,
            nftType: Type<@MilestoneNFT.NFT>(),
            nftID: nftID,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: [
                NFTStorefrontV2.SaleCut(
                    receiver: receiverCap,
                    amount: salePrice
                )
            ],
            marketplacesCapability: nil,
            customID: nil,
            commissionAmount: 0.0,
            expiry: UInt64(getCurrentBlock().height + 10000)
        )
    }

    execute {
        log("Listing created")
    }
} 