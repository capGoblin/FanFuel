import NFTStorefrontV2 from "NFTStorefrontV2"
import FlowToken from "FlowToken"
import FungibleToken from "FungibleToken"

/// Purchases a listing from a seller's storefront. Stub implementation works with our stub contract.
transaction(seller: Address, listingID: UInt64, price: UFix64) {
    prepare(buyer: auth(Storage, Capabilities) &Account) {
        // Borrow storefront
        let storefront = getAccount(seller)
            .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
            .borrow()
            ?? panic("Seller has no storefront")

        // Withdraw payment from buyer's FlowToken vault
        let vaultRef = buyer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault with withdraw capability")
        let mainVault <- vaultRef.withdraw(amount: price)

        // Call stub purchaseListing
        storefront.purchaseListing(listingID: listingID, payment: <-mainVault)
    }

    execute {
        log("Listing purchased (stub)")
    }
} 