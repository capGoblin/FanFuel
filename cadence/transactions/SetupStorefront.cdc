import NFTStorefrontV2 from "NFTStorefrontV2"

/// Stores a Storefront resource in the signer's account if one doesn't already exist.
transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        if acct.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefrontV2.createStorefront()
            acct.storage.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)

            acct.capabilities.publish(
                acct.capabilities.storage.issue<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontStoragePath),
                at: NFTStorefrontV2.StorefrontPublicPath
            )
        }
    }

    execute {
        log("Storefront set up or already exists")
    }
} 