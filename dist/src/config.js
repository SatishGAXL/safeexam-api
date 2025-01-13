"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_NETWORK = exports.BLOCKCHAIN_NETWORK_CONFIGS = exports.FUND_AMOUNT = exports.MIN_DELTA_AMOUNT = exports.MASTER_WALLET_MNEMONIC = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: `.env` });
if (!process.env.MASTER_WALLET_MNEMONIC) {
    throw new Error("MASTER_WALLET_MNEMONIC is not set in .env file");
}
exports.MASTER_WALLET_MNEMONIC = process.env.MASTER_WALLET_MNEMONIC;
exports.MIN_DELTA_AMOUNT = Number(process.env.MIN_DELTA_AMOUNT);
exports.FUND_AMOUNT = Number(process.env.FUND_AMOUNT);
exports.BLOCKCHAIN_NETWORK_CONFIGS = {
    testnet: {
        algod: {
            token: process.env.ALGOD_TESTNET_TOKEN || "a".repeat(64),
            rpc: process.env.ALGOD_TESTNET_RPC || "https://testnet-api.algonode.cloud",
            port: Number(process.env.ALGOD_TESTNET_PORT) || 443,
        },
        indexer: {
            token: process.env.INDEXER_TESTNET_TOKEN || "a".repeat(64),
            rpc: process.env.INDEXER_TESTNET_RPC || "https://testnet-idx.algonode.cloud",
            port: Number(process.env.INDEXER_TESTNET_PORT) || 443,
        },
    },
    mainnet: {
        algod: {
            token: process.env.ALGOD_MAINNET_TOKEN || "a".repeat(64),
            rpc: process.env.ALGOD_MAINNET_RPC || "https://mainnet-api.algonode.cloud",
            port: Number(process.env.ALGOD_MAINNET_PORT) || 443,
        },
        indexer: {
            token: process.env.INDEXER_MAINNET_TOKEN || "a".repeat(64),
            rpc: process.env.INDEXER_MAINNET_RPC || "https://mainnet-idx.algonode.cloud",
            port: Number(process.env.INDEXER_MAINNET_PORT) || 443,
        },
    },
};
exports.CURRENT_NETWORK = process.env.CURRENT_NETWORK || "testnet";
