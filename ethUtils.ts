import Safe, {
  ContractNetworksConfig,
  EthSafeSignature,
  EthersAdapter,
} from "@safe-global/protocol-kit";
import {
  SafeSignature,
  SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";

export const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL
);

export const ethAdapter = new EthersAdapter({
  ethers,
  signerOrProvider: provider,
});

export async function getSafeSdk(safeAddress: string) {
  const chainId = await ethAdapter.getChainId();
  const contractNetworks: ContractNetworksConfig = {
    [chainId]: {
      safeMasterCopyAddress: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
      safeProxyFactoryAddress: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      multiSendAddress: "0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761",
      multiSendCallOnlyAddress: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
      fallbackHandlerAddress: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
      signMessageLibAddress: "0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2",
      createCallAddress: "0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4",
      simulateTxAccessorAddress: "0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da",
    },
  };
  return Safe.create({
    safeAddress,
    contractNetworks,
    ethAdapter,
  });
}

export async function getTxnHash(
  safeAddress: string,
  txnData: SafeTransactionDataPartial
) {
  const safeSdk = await getSafeSdk(safeAddress);
  const txn = await safeSdk.createTransaction({ safeTransactionData: txnData });
  return safeSdk.getTransactionHash(txn);
}

export async function combineSigns(
  safeAddress: string,
  txnData: SafeTransactionDataPartial,
  signatures: EthSafeSignature[]
) {
  const safeSdk = await getSafeSdk(safeAddress);
  const txn = await safeSdk.createTransaction({ safeTransactionData: txnData });
  signatures.map((sign) => {
    txn.addSignature(sign);
  });
  const combo = txn.encodedSignatures();
  return combo;
}

module.exports = {
  provider,
  ethAdapter,
  getSafeSdk,
  getTxnHash,
  combineSigns
};
