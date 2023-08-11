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

app.post("/propose-txn", async (req: Request, resp: Response) => {
  console.log("Serving /propose-txn ...");
  const safeAddress = req.body.safeAddress;
  const txnData = req.body.safeTxnData;
  console.log("Getting txnHash with on-chain call...");
  const txnHash = await getTxnHash(safeAddress, txnData);
  const respJson = {
    safeAddress,
    txnHash,
    txnData,
  };
  console.log("Creating entry in db...");
  await transactionModel.create(respJson);
  resp.json(respJson);
});

app.get("/get-txn", async (req: Request, resp: Response) => {
  console.log("Serving /get-txn ...");
  const safeAddress = req.query.safeAddress;
  const txnHash = req.query.txnHash;
  if (safeAddress && txnHash) {
    console.log("Finding txn from db...");
    const txn = await transactionModel.findOne({ txnHash, safeAddress });

    const respJson = {
      safeAddress,
      txnHash,
      txnData: txn?.txnData,
    };
    resp.json(respJson);
  } else {
    const respJson = {
      msg: "Can not find the txn: need both safeAddress and txnHash",
    };
    resp.json(respJson);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App server listening on PORT ${port}`);
});
