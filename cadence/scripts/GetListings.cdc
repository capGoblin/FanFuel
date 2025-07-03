import NFTStorefrontV2 from "NFTStorefrontV2"

/// Returns listing IDs in the storefront – stub always returns an empty array.
access(all) fun main(account: Address): [UInt64] {
    let storefrontCap = getAccount(account)
        .capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath)
    if storefrontCap == nil { return [] }
    return []
} 