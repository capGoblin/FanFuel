"use client";

import { ReactNode } from "react";
import * as fcl from "@onflow/fcl";

// Configure FCL
fcl
  .config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("flow.network", "testnet")
  .put("app.detail.title", "FanFuel")
  .put("app.detail.icon", "https://i.imgur.com/r23Zhvu.png")
  .put("0xCampaignManager", "0xd024903f49a21299")
  .put("0xMilestoneNFT", "0xd024903f49a21299")
  .put("0xMetadataViews", "0x631e88ae7f1d7c20")
  .put("0xViewResolver", "0x631e88ae7f1d7c20")
  .put("0xNonFungibleToken", "0x631e88ae7f1d7c20")
  .put("0xFungibleToken", "0x9a0766d93b6608b7")
  .put("0xFlowToken", "0x7e60df042a9c0868");

interface FlowProviderProps {
  children: ReactNode;
}

export default function FlowProvider({ children }: FlowProviderProps) {
  return <>{children}</>;
}
