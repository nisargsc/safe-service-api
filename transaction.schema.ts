import mongoose from "mongoose";

const transactionDataSchema = new mongoose.Schema({
  nonce: {
    type: Number,
    required: true,
    unique: true,
  },
  to: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  operation: {
    type: Number, // Can only be 0 or 1
  },
  safeTxGas: {
    type: Number,
  },
  baseGase: {
    type: Number,
  },
  gasPrice: {
    type: Number,
  },
  gasToken: {
    type: String,
  },
  refundReceiver: {
    type: String,
  },
});

// TODO: Add signatures here
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
