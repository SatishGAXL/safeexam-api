import express, { Request, Response } from "express";
import { createFundedWallet, ensureFund } from "./utils";
import algosdk, { OnApplicationComplete } from "algosdk";
import { initDB } from "./db";
import { algodClient } from "./clients";
import cors from "cors";

// Initialize Express application and set port
const app = express();
const port = 3000;

// Configure middleware
app.use(express.json());  // Parse JSON request bodies
app.use(cors());  // Enable Cross-Origin Resource Sharing

// Initialize database connection
let db: any;
initDB().then((database) => {
  db = database;
});

// Basic health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

/**
 * Creates a new funded wallet on the Algorand blockchain
 * Stores the wallet credentials in the database
 * Returns only the public address to the client for security
 */
app.post("/create-wallet", async (req: Request, res: Response) => {
  try {
    const wallet = await createFundedWallet();

    // Store wallet information in the database
    await db.run("INSERT INTO wallets (address, mnemonic) VALUES (?, ?)", [
      wallet.addr.toString(),
      algosdk.secretKeyToMnemonic(wallet.sk),
    ]);

    res.send({ address: wallet.addr.toString() });
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

/**
 * Utility function to encode strings for Algorand transaction arguments
 * Prepends the string length as a 2-byte integer before the encoded string data
 * @param str - The string to encode
 * @returns Uint8Array containing the encoded string with length prefix
 */
const encodeString = (str: string) => {
  const encoded = new TextEncoder().encode(str);
  const length = encoded.length;
  const lengthArray = new Uint8Array(algosdk.bigIntToBytes(length, 2));
  const uint8Array = new Uint8Array([...lengthArray, ...encoded]);
  return uint8Array;
};

/**
 * Endpoint to write quiz/exam answers and metadata to the Algorand blockchain
 * Accepts quiz data including:
 * - Student and exam identification
 * - Location and timing information
 * - Answer data and suspicious activity flags
 * - Wallet address for transaction signing
 * 
 * The function:
 * 1. Validates the wallet address
 * 2. Retrieves the wallet credentials
 * 3. Ensures the wallet has sufficient funds
 * 4. Creates and submits an application call transaction
 * 5. Returns the transaction ID and explorer URL
 */
app.post("/write-answer", async (req: Request, res: Response) => {
  let {
    booklet,
    center_name,
    city,
    end_time,
    exam_title,
    que_ans,
    start_time,
    student_id,
    suspicious_activity_detected,
    address,
  } = req.body;

  try {
    // Retrieve wallet credentials from database
    const result = await db.get(
      "SELECT mnemonic FROM wallets WHERE address = ?",
      [address]
    );
    if (!result) {
      res.status(404).send("Wallet not found");
      return;
    }
    const mnemonic = result.mnemonic;
    const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);

    // Set default values for missing fields
    if (!booklet) booklet = "N/A";
    if (!center_name) center_name = "N/A";
    if (!city) city = "N/A";
    if (!end_time) end_time = "N/A";
    if (!exam_title) exam_title = "N/A";
    if (!que_ans) que_ans = "N/A";
    if (!start_time) start_time = "N/A";
    if (!student_id) student_id = "N/A";
    if (!suspicious_activity_detected) suspicious_activity_detected = "N/A";

    // Validate wallet address
    if (recoveredAccount.addr.toString() !== address) {
      res.status(400).send("Invalid Address or Mnemonic");
      return;
    }

    // Ensure wallet has sufficient funds
    await ensureFund(recoveredAccount.addr.toString());

    // Define ABI method for the smart contract call
    const quizDataMethod = new algosdk.ABIMethod({
      name: "quiz_data",
      args: [
        { type: "string", name: "param1" },
        { type: "string", name: "param2" },
        { type: "string", name: "param3" },
        { type: "string", name: "param4" },
        { type: "string", name: "param5" },
        { type: "string", name: "param6" },
        { type: "string", name: "param7" },
        { type: "string", name: "param8" },
        { type: "string", name: "param9" },
        { type: "string", name: "param10" },
      ],
      returns: { type: "void" },
    });

    // Prepare and send transaction
    const txParams = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: recoveredAccount.addr,
      appIndex: 732329095,  // Target application ID on Algorand
      onComplete: OnApplicationComplete.NoOpOC,
      suggestedParams: txParams,
      appArgs: [
        quizDataMethod.getSelector(),
        encodeString(recoveredAccount.addr.toString()),
        encodeString(student_id),
        encodeString(exam_title),
        encodeString(city),
        encodeString(center_name),
        encodeString(booklet),
        encodeString(start_time),
        encodeString(que_ans),
        encodeString(suspicious_activity_detected),
        encodeString(end_time),
      ],
    });

    // Sign and submit transaction
    const signedTxn = txn.signTxn(recoveredAccount.sk);
    await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation and return result
    const TxnResult = await algosdk.waitForConfirmation(
      algodClient,
      txn.txID(),
      3
    );

    res.send({
      txId: txn.txID(),
      url: `https://lora.algokit.io/testnet/transaction/${txn.txID()}`,
    });
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});