"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFundedWallet = exports.ensureFund = exports.fundFromMasterWallet = exports.getDetailedBalances = void 0;
const algosdk = __importStar(require("algosdk"));
const clients_1 = require("./clients");
const config_1 = require("./config");
const getDetailedBalances = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const r = yield clients_1.algodClient.accountInformation(address).do();
    const balance = algosdk.microalgosToAlgos(Number(r.amountWithoutPendingRewards));
    const minBalance = algosdk.microalgosToAlgos(Number(r.minBalance));
    const deltaBalance = balance - minBalance;
    return {
        balance,
        minBalance,
        deltaBalance,
    };
});
exports.getDetailedBalances = getDetailedBalances;
const fundFromMasterWallet = (reciever, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const master = algosdk.mnemonicToSecretKey(config_1.MASTER_WALLET_MNEMONIC);
    const suggestedParams = yield clients_1.algodClient.getTransactionParams().do();
    const xferTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: master.addr,
        receiver: reciever,
        suggestedParams,
        amount: algosdk.algosToMicroalgos(amount),
    });
    const signedXferTxn = xferTxn.signTxn(master.sk);
    try {
        yield clients_1.algodClient.sendRawTransaction(signedXferTxn).do();
        const result = yield algosdk.waitForConfirmation(clients_1.algodClient, xferTxn.txID().toString(), 3);
        var confirmedRound = result.confirmedRound;
        return xferTxn.txID();
    }
    catch (e) {
        return null;
    }
});
exports.fundFromMasterWallet = fundFromMasterWallet;
const ensureFund = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const { deltaBalance } = yield (0, exports.getDetailedBalances)(address);
    if (deltaBalance < config_1.MIN_DELTA_AMOUNT) {
        if (!(yield (0, exports.fundFromMasterWallet)(address, config_1.FUND_AMOUNT))) {
            throw new Error("Failed to Fund To Cover Delta Amount");
        }
    }
});
exports.ensureFund = ensureFund;
const createFundedWallet = () => __awaiter(void 0, void 0, void 0, function* () {
    const keypair = algosdk.generateAccount();
    yield (0, exports.fundFromMasterWallet)(keypair.addr.toString(), 1.1);
    return keypair;
});
exports.createFundedWallet = createFundedWallet;
