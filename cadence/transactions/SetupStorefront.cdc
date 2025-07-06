import NFTStorefrontV2 from "NFTStorefrontV2"

/// Stores a Storefront resource in the signer's account if one doesn't already exist.
transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Return early if storefront already exists
        if signer.storage.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) != nil {
            log("Storefront already exists")
            return
        }

        // Create a new storefront resource
            let storefront <- NFTStorefrontV2.createStorefront()

        // Save it into account storage
        signer.storage.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)

        // Publish the public capability for other users to browse/purchase listings
        signer.capabilities.publish(
            signer.capabilities.storage.issue<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontStoragePath),
                at: NFTStorefrontV2.StorefrontPublicPath
            )

        log("Storefront created and linked")
    }
} 