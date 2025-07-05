import Test

access(all) fun testDeployMilestoneNFT() {
    Test.expect(
        Test.deployContract(
            name: "MilestoneNFT",
            path: "../contracts/MilestoneNFT.cdc",
            arguments: []
        ),
        Test.beNil()
    )
} 