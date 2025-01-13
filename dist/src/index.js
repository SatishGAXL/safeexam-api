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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const algosdk_1 = __importStar(require("algosdk"));
const db_1 = require("./db");
const clients_1 = require("./clients");
const app = (0, express_1.default)();
const port = 3000;
// Middleware to parse JSON
app.use(express_1.default.json());
let db;
(0, db_1.initDB)().then((database) => {
    db = database;
});
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.post("/create-wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield (0, utils_1.createFundedWallet)();
        // Store wallet information in the database
        yield db.run("INSERT INTO wallets (address, mnemonic) VALUES (?, ?)", [
            wallet.addr.toString(),
            algosdk_1.default.secretKeyToMnemonic(wallet.sk),
        ]);
        res.send({ address: wallet.addr.toString() });
    }
    catch (e) {
        res.status(500).send(e.message);
    }
}));
const encodeString = (str) => {
    const encoded = new TextEncoder().encode(str);
    const length = encoded.length;
    const lengthArray = new Uint8Array(algosdk_1.default.bigIntToBytes(length, 2));
    const uint8Array = new Uint8Array([...lengthArray, ...encoded]);
    return uint8Array;
};
app.post("/write-answer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { booklet, center_name, city, end_time, exam_title, que_ans, start_time, student_id, suspicious_activity_detected, address, } = req.body;
    try {
        // Retrieve the mnemonic from the database
        const result = yield db.get("SELECT mnemonic FROM wallets WHERE address = ?", [address]);
        if (!result) {
            res.status(404).send("Wallet not found");
            return;
        }
        const mnemonic = result.mnemonic;
        const recoveredAccount = algosdk_1.default.mnemonicToSecretKey(mnemonic);
        if (!booklet) {
            booklet = "N/A";
        }
        if (!center_name) {
            center_name = "N/A";
        }
        if (!city) {
            city = "N/A";
        }
        if (!end_time) {
            end_time = "N/A";
        }
        if (!exam_title) {
            exam_title = "N/A";
        }
        if (!que_ans) {
            que_ans = "N/A";
        }
        if (!start_time) {
            start_time = "N/A";
        }
        if (!student_id) {
            student_id = "N/A";
        }
        if (!suspicious_activity_detected) {
            suspicious_activity_detected = "N/A";
        }
        if (recoveredAccount.addr.toString() !== address) {
            res.status(400).send("Invalid Address or Mnemonic");
            return;
        }
        yield (0, utils_1.ensureFund)(recoveredAccount.addr.toString());
        const quizDataMethod = new algosdk_1.default.ABIMethod({
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
        const txParams = yield clients_1.algodClient.getTransactionParams().do();
        const txn = algosdk_1.default.makeApplicationCallTxnFromObject({
            sender: recoveredAccount.addr,
            appIndex: 732329095,
            onComplete: algosdk_1.OnApplicationComplete.NoOpOC,
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
        const signedTxn = txn.signTxn(recoveredAccount.sk);
        yield clients_1.algodClient.sendRawTransaction(signedTxn).do();
        const TxnResult = yield algosdk_1.default.waitForConfirmation(clients_1.algodClient, txn.txID(), 3);
        res.send({
            txId: txn.txID(),
            url: `https://lora.algokit.io/testnet/transaction/${txn.txID()}`,
        });
    }
    catch (e) {
        res.status(500).send(e.message);
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
