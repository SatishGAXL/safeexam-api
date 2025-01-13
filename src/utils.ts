import * as algosdk from "algosdk";
import { algodClient } from "./clients";
import {
  FUND_AMOUNT,
  MASTER_WALLET_MNEMONIC,
  MIN_DELTA_AMOUNT,
} from "./config";

export const getDetailedBalances = async (address: string) => {
  const r = await algodClient.accountInformation(address).do();
  const balance = algosdk.microalgosToAlgos(
    Number(r.amountWithoutPendingRewards)
  );
  const minBalance = algosdk.microalgosToAlgos(Number(r.minBalance));
  const deltaBalance = balance - minBalance;
  return {
    balance,
    minBalance,
    deltaBalance,
  };
};

export const fundFromMasterWallet = async (
  reciever: string,
  amount: number
): Promise<string | null> => {
  const master = algosdk.mnemonicToSecretKey(MASTER_WALLET_MNEMONIC);
  const suggestedParams = await algodClient.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: master.addr,
    receiver: reciever,
    suggestedParams,
    amount: algosdk.algosToMicroalgos(amount),
  });
  const signedXferTxn = xferTxn.signTxn(master.sk);
  try {
    await algodClient.sendRawTransaction(signedXferTxn).do();
    const result = await algosdk.waitForConfirmation(
      algodClient,
      xferTxn.txID().toString(),
      3
    );
    var confirmedRound = result.confirmedRound;
    return xferTxn.txID();
  } catch (e: any) {
    return null;
  }
};

export const ensureFund = async (address: string) => {
  const { deltaBalance } = await getDetailedBalances(address);
  if (deltaBalance < MIN_DELTA_AMOUNT) {
    if (!(await fundFromMasterWallet(address, FUND_AMOUNT))) {
      throw new Error("Failed to Fund To Cover Delta Amount");
    }
  }
};

export const createFundedWallet = async () => {
  const keypair = algosdk.generateAccount();
  await fundFromMasterWallet(keypair.addr.toString(),1.1);
  return keypair;
};
