import { config } from "dotenv";

// Load environment variables from .env file
config({ path: `.env` });

// Ensure required master wallet mnemonic is set
if (!process.env.MASTER_WALLET_MNEMONIC) {
  throw new Error("MASTER_WALLET_MNEMONIC is not set in .env file");
}

// Export core wallet configuration values
export const MASTER_WALLET_MNEMONIC = process.env.MASTER_WALLET_MNEMONIC;
export const MIN_DELTA_AMOUNT = Number(process.env.MIN_DELTA_AMOUNT);
export const FUND_AMOUNT = Number(process.env.FUND_AMOUNT);

/**
 * Configuration settings for both testnet and mainnet Algorand networks
 * Each network has settings for both algod (node) and indexer services
 * Default values are provided for convenience using algonode.cloud endpoints
 * 
 * Environment variables that can be set:
 * Testnet:
 * - ALGOD_TESTNET_TOKEN: API token for testnet node
 * - ALGOD_TESTNET_RPC: RPC endpoint for testnet node
 * - ALGOD_TESTNET_PORT: Port for testnet node
 * - INDEXER_TESTNET_TOKEN: API token for testnet indexer
 * - INDEXER_TESTNET_RPC: RPC endpoint for testnet indexer
 * - INDEXER_TESTNET_PORT: Port for testnet indexer
 * 
 * Mainnet:
 * - ALGOD_MAINNET_TOKEN: API token for mainnet node
 * - ALGOD_MAINNET_RPC: RPC endpoint for mainnet node
 * - ALGOD_MAINNET_PORT: Port for mainnet node
 * - INDEXER_MAINNET_TOKEN: API token for mainnet indexer
 * - INDEXER_MAINNET_RPC: RPC endpoint for mainnet indexer
 * - INDEXER_MAINNET_PORT: Port for mainnet indexer
 */
export const BLOCKCHAIN_NETWORK_CONFIGS = {
  testnet: {
    algod: {
      token: process.env.ALGOD_TESTNET_TOKEN || "a".repeat(64),
      rpc:
        process.env.ALGOD_TESTNET_RPC || "https://testnet-api.algonode.cloud",
      port: Number(process.env.ALGOD_TESTNET_PORT) || 443,
    },
    indexer: {
      token: process.env.INDEXER_TESTNET_TOKEN || "a".repeat(64),
      rpc:
        process.env.INDEXER_TESTNET_RPC || "https://testnet-idx.algonode.cloud",
      port: Number(process.env.INDEXER_TESTNET_PORT) || 443,
    },
  },
  mainnet: {
    algod: {
      token: process.env.ALGOD_MAINNET_TOKEN || "a".repeat(64),
      rpc:
        process.env.ALGOD_MAINNET_RPC || "https://mainnet-api.algonode.cloud",
      port: Number(process.env.ALGOD_MAINNET_PORT) || 443,
    },
    indexer: {
      token: process.env.INDEXER_MAINNET_TOKEN || "a".repeat(64),
      rpc:
        process.env.INDEXER_MAINNET_RPC || "https://mainnet-idx.algonode.cloud",
      port: Number(process.env.INDEXER_MAINNET_PORT) || 443,
    },
  },
};

// Set current network (defaults to testnet if not specified)
export const CURRENT_NETWORK = process.env.CURRENT_NETWORK || "testnet";