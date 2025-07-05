/// Transaction to remove a contract from an account
/// Use this to remove the old CampaignManager contract before deploying the updated version
///
transaction(contractName: String) {
    
    prepare(signer: auth(Storage, Contracts) &Account) {
        // Remove the contract
        signer.contracts.remove(name: contractName)
        
        log("Contract removed successfully: ".concat(contractName))
    }
} 