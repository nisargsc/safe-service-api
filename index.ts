import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { transactionModel } from "./transaction.schema";
import { getTxnHash } from "./ethUtils";

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
    const respJson = {
      safeAddress,
      txnHash,
      txnData,
    };
    console.log("Creating entry in db...");
    await transactionModel.create(respJson);
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
    const txn = await transactionModel.findOne({
      filter: { txnHash, safeAddress },
      projection: { _id: 0 },
    });

    const respJson = {
      safeAddress,
      txnHash,
      txnData: txn?.txnData,
    };
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
  const safeAddress = req.body.safeAddress;
  const txnData = req.body.txnData;
  const ownerAddress = req.body.ownerAddress;
  const sign = req.body.sign;

  if (safeAddress && sign && txnData && ownerAddress) {
    console.log("Getting txn hash from data...");
    const txnHash = await getTxnHash(safeAddress, txnData);
    console.log("Finding txn from db...");
    const txn = await transactionModel.findOne({ txnHash, safeAddress });

    // TODO: Update and add the signatures here
    await txn?.updateOne({ txnHash, safeAddress });

    const respJson = {
      safeAddress,
      txnHash,
      txnData: txnData,
    };
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
