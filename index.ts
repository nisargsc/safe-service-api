import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { transactionModel } from "./transaction.schema";
import { combineSigns, getTxnHash } from "./ethUtils";
import {
  SafeSignature,
  SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import { EthSafeSignature } from "@safe-global/protocol-kit";

const app = express();
app.use(express.json());

const dbUri = process.env.DB_URI || "";
mongoose.connect(dbUri);

app.get("/", (req: Request, resp: Response) => {
  console.log("serving / ...");
  const respJson = {
    msg: "Hello from the server!!",
  };
  resp.json(respJson);
});

/*
request body
{
  safeAddress: "string address of safe",
  txnData: {
    to: "to addr",
    value: "value",
    data: "data"
  }
}
 */
app.post("/propose-txn", async (req: Request, resp: Response) => {
  console.log("Serving /propose-txn ...");
  const safeAddress = req.body.safeAddress;
  const txnData = req.body.txnData;
  if (safeAddress && txnData) {
    console.log("Getting txnHash with on-chain call...");
    const txnHash = await getTxnHash(safeAddress, txnData);
    console.log({ txnHash });
    const initTxn = {
      safeAddress,
      txnHash,
      txnData,
    };
    console.log("Creating entry in db...");
    await transactionModel.create(initTxn);

    const respJson = { txn: initTxn };
    resp.json(respJson).status(200);
  } else {
    const respJson = {
      msg: "Err: Need all the required params in request",
    };
    resp.json(respJson).status(400);
  }
});

// request params= ?safeAddress=<safe addr>,txnHash=<txnHash>
app.get("/get-txn", async (req: Request, resp: Response) => {
  console.log("Serving /get-txn ...");
  const safeAddress = req.query.safeAddress;
  const txnHash = req.query.txnHash;
  if (safeAddress && txnHash) {
    console.log("Finding txn from db...");
    const txn = await transactionModel
      .findOne({ txnHash, safeAddress })
      .select("-_id -__v -txnData._id");
    console.log(txn);

    const respJson = { txn };
    resp.json(respJson).status(200);
  } else {
    const respJson = {
      msg: "Err: Need all the required params in request",
    };
    resp.json(respJson).status(400);
  }
});

/*
request body
{
  safeAddress: "Address of safe",
  txnData: "txn data",
  ownerAddress: "owner that signed the txn",
  sign: "Signature of the owner"
}
 */
app.post("/add-sign", async (req: Request, resp: Response) => {
  console.log("Serving /add-sign ...");
  console.log({ req: req.body });
  const safeAddress = req.body.safeAddress;
  const txnData = req.body.txnData;
  const ownerAddress = req.body.ownerAddress;
  const sign = req.body.sign;

  if (safeAddress && sign && txnData && ownerAddress) {
    console.log("Getting txn hash from data...");
    const txnHash = await getTxnHash(safeAddress, txnData);
    console.log("Finding txn from db...");

    // Update in db
    const dbTxn = await transactionModel
      .findOneAndUpdate(
        {
          txnHash,
          safeAddress,
        },
        {
          $push: {
            signatures: {
              signer: ownerAddress,
              signature: sign,
            },
          },
        },
        {
          new: true,
        }
      )
      .select("-_id -__v -txnData._id");

    const respJson = { txn: dbTxn };
    resp.json(respJson).status(200);
  } else {
    const respJson = {
      msg: "Err: Need all the required params in request",
    };
    resp.json(respJson).status(400);
  }
});

// request params= ?safeAddress=<safe addr>,txnHash=<txnHash>,executor=<executor addr>
app.get("/checkzicute", async (req: Request, resp: Response) => {
  console.log("Serving /checkzicute ...");
  const safeAddress = req.query.safeAddress;
  const txnHash = req.query.txnHash;
  const executor = req.query.executor;
  if (safeAddress && txnHash && executor) {
    console.log("Finding txn from db...");
    const txn = await transactionModel
      .findOne({ txnHash, safeAddress })
      .select("-_id -__v -txnData._id");

    console.log("----------------------here---------------------------");
    let txnData: SafeTransactionDataPartial = {
      nonce: txn?.txnData?.nonce as number,
      to: txn?.txnData?.to as string,
      value: txn?.txnData?.value as string,
      data: txn?.txnData?.data as string,
      operation: txn?.txnData?.nonce as number,
      safeTxGas: txn?.txnData?.safeTxGas as string,
      baseGas: txn?.txnData?.baseGas as string,
      gasPrice: txn?.txnData?.gasPrice as string,
      gasToken: txn?.txnData?.gasToken as string,
      refundReceiver: txn?.txnData?.refundReceiver as string,
    };
    console.log({txnData})
    let signatures: EthSafeSignature[] = [];
    txn?.signatures.map((sign) => {
      signatures.push(
        new EthSafeSignature(sign.signer as string, sign.signature as string)
      );
      console.log(sign)
    });

    const combo = await combineSigns(
      safeAddress.toString(),
      txnData,
      signatures
    );
    console.log({ combo });
    console.log("----------------------here---------------------------");
    const respJson = { txn };
    resp.json(respJson).status(200);
  } else {
    const respJson = {
      msg: "Err: Need all the required params in request",
    };
    resp.json(respJson).status(400);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App server listening on PORT ${port}`);
});
