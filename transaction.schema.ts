import mongoose from "mongoose";

const transactionDataSchema = new mongoose.Schema({
  to: String,
  value: String,
  data: String,
});

const transactionSchema = new mongoose.Schema({
  txnHash: {
    type: String,
    unique: true,
  },
  safeAddress: {
    type: String,
  },
  txnData: {
    type: transactionDataSchema,
  },
});

export const transactionModel = mongoose.model(
  "transactions",
  transactionSchema
);
