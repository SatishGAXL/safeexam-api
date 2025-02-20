import * as algosdk from "algosdk";
import { CURRENT_NETWORK, BLOCKCHAIN_NETWORK_CONFIGS } from "./config";

/**
* Type definition ensuring network name matches available configurations
* Valid values are 'testnet' or 'mainnet'
*/
type Network = keyof typeof BLOCKCHAIN_NETWORK_CONFIGS;

// Get network configuration based on CURRENT_NETWORK setting
const networkConfig = BLOCKCHAIN_NETWORK_CONFIGS[CURRENT_NETWORK as Network];
if (!networkConfig) {
 throw new Error(`Unknown network: ${CURRENT_NETWORK}`);
}

/**
* Initialize Algorand node client (algod) with network configuration
* Used for interacting with the blockchain, sending transactions,
* querying account info, etc.
*/
const algodClient = new algosdk.Algodv2(
 networkConfig.algod.token,
 networkConfig.algod.rpc,
 networkConfig.algod.port
);

/**
* Initialize Algorand indexer client with network configuration
* Used for searching historical blockchain data, transactions,
* and account activity
*/
const indexerClient = new algosdk.Indexer(
 networkConfig.indexer.token,
 networkConfig.indexer.rpc,
 networkConfig.indexer.port
);

export { algodClient, indexerClient };