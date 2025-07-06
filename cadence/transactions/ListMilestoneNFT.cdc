import NFTStorefrontV2 from "NFTStorefrontV2"
import MilestoneNFT      from "MilestoneNFT"
import FlowToken         from "FlowToken"
import NonFungibleToken  from "NonFungibleToken"
import FungibleToken     from "FungibleToken"
import MetadataViews     from "MetadataViews"

/// Lists a specific MilestoneNFT owned by the signer for sale on their StorefrontV2.
///
/// Parameters
/// - `nftID`     : The NFT ID to list.
/// - `salePrice` : Listing price in FLOW.
transaction(nftID: UInt64, salePrice: UFix64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // 1️⃣ Borrow storefront with CreateListing entitlement
        let storefrontRef = signer.storage.borrow<auth(NFTStorefrontV2.CreateListing) & NFTStorefrontV2.Storefront>(
            from: NFTStorefrontV2.StorefrontStoragePath
        ) ?? panic("Storefront not found – run SetupStorefront first")

        // 2️⃣ Capability allowing storefront to withdraw the NFT
        let providerCap = signer.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
            MilestoneNFT.CollectionStoragePath
        )

        // 3️⃣ FlowToken receiver capability (seller)
        let sellerCap = signer.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)

        // 4️⃣ Read royalty metadata from the NFT to pay creator on resale
        let collectionRef = signer.storage.borrow<&MilestoneNFT.Collection>(from: MilestoneNFT.CollectionStoragePath)
            ?? panic("Could not borrow NFT collection")

        // Use MetadataViews to resolve royalties
        let resolver = collectionRef.borrowViewResolver(id: nftID)
            ?? panic("Could not borrow view resolver for NFT")

        let royaltyView = resolver.resolveView(Type<MetadataViews.Royalties>())
            as? MetadataViews.Royalties
            ?? panic("NFT does not expose royalties view")

        let royalties = royaltyView.getRoyalties()
        assert(royalties.length == 1, message: "Expected single royalty entry")

        let creatorRoyalty = royalties[0]
        let creatorCut = salePrice * creatorRoyalty.cut
        let sellerCut = salePrice - creatorCut

        let saleCuts: [NFTStorefrontV2.SaleCut] = [
            NFTStorefrontV2.SaleCut(receiver: creatorRoyalty.receiver, amount: creatorCut),
            NFTStorefrontV2.SaleCut(receiver: sellerCap,               amount: sellerCut)
        ]

        // 5️⃣ Expiry (seconds since epoch + buffer) cast to UInt64
        let expiryTimestamp: UInt64 = UInt64(getCurrentBlock().timestamp) + 600

        storefrontRef.createListing(
            nftProviderCapability: providerCap,
            nftType:               Type<@MilestoneNFT.NFT>(),
            nftID:                 nftID,
            salePaymentVaultType:  Type<@FlowToken.Vault>(),
            saleCuts:              saleCuts,
            marketplacesCapability:nil,
            customID:              nil,
            commissionAmount:      0.0,
            expiry:                expiryTimestamp
        )

        log("✅ Listed MilestoneNFT #".concat(nftID.toString()).concat(" for ").concat(salePrice.toString()).concat(" FLOW"))
    }
} 