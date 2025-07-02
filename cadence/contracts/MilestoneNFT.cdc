import NonFungibleToken from "NonFungibleToken"

/// MilestoneNFT - Simplified NFT for testing
access(all) contract MilestoneNFT: NonFungibleToken {

    // Total supply of NFTs in existence
    access(all) var totalSupply: UInt64

    // Events
    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)

    // Paths
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath

    // NFT Resource
    access(all) resource NFT: NonFungibleToken.NFT {
        access(all) let id: UInt64

        init(id: UInt64) {
            self.id = id
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
        }

        access(all) view fun getViews(): [Type] {
            return []
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return nil
        }
    }

    // Collection Resource
    access(all) resource Collection: NonFungibleToken.Collection {
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}

        init() {
            self.ownedNFTs <- {}
        }

        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let nft <- token as! @MilestoneNFT.NFT
            let id: UInt64 = nft.id
            let oldToken <- self.ownedNFTs[id] <- nft
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return (&self.ownedNFTs[id] as &{NonFungibleToken.NFT}?)
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[Type<@MilestoneNFT.NFT>()] = true
            return supportedTypes
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@MilestoneNFT.NFT>()
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- MilestoneNFT.createEmptyCollection(nftType: Type<@MilestoneNFT.NFT>())
        }
    }

    // Public function to create empty collection
    access(all) fun createEmptyCollection(nftType: Type): @{NonFungibleToken.Collection} {
        let collection <- create Collection()
        return <-collection
    }

    // Required contract view functions
    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return []
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        return nil
    }

    // Public minting function
    access(all) fun mintNFT(recipient: &{NonFungibleToken.Receiver}): UInt64 {
        let newID: UInt64 = self.totalSupply
        let nft <- create NFT(id: newID)
        self.totalSupply = self.totalSupply + 1
        recipient.deposit(token: <-nft)
        return newID
    }

    init() {
        self.totalSupply = 0
        self.CollectionStoragePath = /storage/MilestoneNFTCollection
        self.CollectionPublicPath = /public/MilestoneNFTCollection

        emit ContractInitialized()
    }
} 