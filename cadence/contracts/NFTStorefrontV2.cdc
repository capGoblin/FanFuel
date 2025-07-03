import FungibleToken from "FungibleToken"
import NonFungibleToken from "NonFungibleToken"
import FlowToken from "FlowToken"

access(all) contract NFTStorefrontV2 {
    access(all) let StorefrontStoragePath: StoragePath
    access(all) let StorefrontPublicPath: PublicPath

    access(all) resource interface StorefrontPublic {
        access(all) fun purchaseListing(listingID: UInt64, payment: @{FungibleToken.Vault})
    }

    access(all) resource interface StorefrontManager {}

    access(all) resource Storefront: StorefrontPublic, StorefrontManager {
        init() {}

        // Stub implementation of createListing so transactions compile on emulator.
        access(all) fun createListing(
            nftProviderCapability: Capability,
            nftType: Type,
            nftID: UInt64,
            salePaymentVaultType: Type,
            saleCuts: [SaleCut],
            marketplacesCapability: Capability?,
            customID: UInt64?,
            commissionAmount: UFix64,
            expiry: UInt64
        ) {
            log("Listing created (stub)")
        }

        // Stub purchaseListing – simply destroys the payment and logs
        access(all) fun purchaseListing(listingID: UInt64, payment: @{FungibleToken.Vault}) {
            destroy payment
            log("Listing purchased (stub)")
        }
    }

    access(all) fun createStorefront(): @Storefront {
        return <- create Storefront()
    }

    init() {
        self.StorefrontStoragePath = /storage/NFTStorefrontV2
        self.StorefrontPublicPath  = /public/NFTStorefrontV2
    }

    // Stub structs and interfaces to satisfy Cadence compiler

    access(all) struct SaleCut {
        access(all) let receiver: Capability<&{FungibleToken.Receiver}>
        access(all) let amount: UFix64
        init(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64) {
            self.receiver = receiver
            self.amount = amount
        }
    }

    access(all) struct ListingDetails {
        init() {}
    }

    access(all) resource interface ListingPublic {}

    access(all) resource Listing: ListingPublic {
        init() {}
    }
} 