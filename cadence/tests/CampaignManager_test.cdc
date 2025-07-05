import Test

// Basic smoke-test: deploy MilestoneNFT first, then CampaignManager (which depends on it)
access(all) fun testDeployCampaignManager() {
    Test.createAccount()
    // Deploy dependency
    Test.expect(
        Test.deployContract(
            name: "MilestoneNFT",
            path: "../contracts/MilestoneNFT.cdc",
            arguments: []
        ),
        Test.beNil()
    )

    // Deploy CampaignManager – should compile & link against previously deployed MilestoneNFT
    Test.expect(
        Test.deployContract(
            name: "CampaignManager",
            path: "../contracts/CampaignManager.cdc",
            arguments: []
        ),
        Test.beNil()
    )
} 