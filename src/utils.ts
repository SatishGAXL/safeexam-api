import * as algosdk from "algosdk";
import { algodClient } from "./clients";
import {
  FUND_AMOUNT,
  MASTER_WALLET_MNEMONIC,
  MIN_DELTA_AMOUNT,
} from "./config";

/**
 * Retrieves detailed balance information for an Algorand account
 * @param address The Algorand address to check
 * @returns Object containing:
 *          - balance: Total balance in Algos
 *          - minBalance: Minimum required balance in Algos
 *          - deltaBalance: Available balance above minimum (balance - minBalance)
 */
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

/**
 * Transfers funds from a master wallet to a specified receiver address
 * @param receiver The Algorand address to receive funds
 * @param amount Amount of Algos to transfer
 * @returns Transaction ID if successful, null if transaction fails
 */
export const fundFromMasterWallet = async (
  receiver: string,
  amount: number
): Promise<string | null> => {
  const master = algosdk.mnemonicToSecretKey(MASTER_WALLET_MNEMONIC);
  const suggestedParams = await algodClient.getTransactionParams().do();
  const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: master.addr,
    receiver: receiver,
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

/**
 * Ensures an account has sufficient funds above its minimum balance requirement
 * If the available balance (deltaBalance) is below MIN_DELTA_AMOUNT,
 * this function will attempt to fund the account with FUND_AMOUNT
 * @param address The Algorand address to check and potentially fund
 * @throws Error if funding fails when needed
 */
export const ensureFund = async (address: string) => {
  const { deltaBalance } = await getDetailedBalances(address);
  if (deltaBalance < MIN_DELTA_AMOUNT) {
    if (!(await fundFromMasterWallet(address, FUND_AMOUNT))) {
      throw new Error("Failed to Fund To Cover Delta Amount");
    }
  }
};

/**
 * Creates a new Algorand account and funds it with an initial balance
 * @returns New keypair (account) with initial funding of 1.1 Algos
 */
export const createFundedWallet = async () => {
  const keypair = algosdk.generateAccount();
  await fundFromMasterWallet(keypair.addr.toString(), 1.1);
  return keypair;
};