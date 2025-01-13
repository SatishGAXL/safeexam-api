import * as algosdk from "algosdk";
import { CURRENT_NETWORK, BLOCKCHAIN_NETWORK_CONFIGS } from "./config";

type Network = keyof typeof BLOCKCHAIN_NETWORK_CONFIGS;
const networkConfig = BLOCKCHAIN_NETWORK_CONFIGS[CURRENT_NETWORK as Network];
if (!networkConfig) {
  throw new Error(`Unknown network: ${CURRENT_NETWORK}`);
}

const algodClient = new algosdk.Algodv2(
  networkConfig.algod.token,
  networkConfig.algod.rpc,
  networkConfig.algod.port
);

const indexerClient = new algosdk.Indexer(
  networkConfig.indexer.token,
  networkConfig.indexer.rpc,
  networkConfig.indexer.port
);

export { algodClient, indexerClient };