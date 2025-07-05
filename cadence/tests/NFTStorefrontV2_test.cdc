import Test

access(all) fun testDeployStorefront() {
    Test.expect(
        Test.deployContract(
            name: "NFTStorefrontV2",
            path: "../contracts/NFTStorefrontV2.cdc",
            arguments: []
        ),
        Test.beNil()
    )
} 