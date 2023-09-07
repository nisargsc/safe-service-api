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
    type: String,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  operation: {
    type: Number, // Can only be 0 or 1, need to enforce that check later
  },
  safeTxGas: {
    type: String,
  },
  baseGas: {
    type: String,
  },
  gasPrice: {
    type: String,
  },
  gasToken: {
    type: String,
  },
  refundReceiver: {
    type: String,
  },
});

const transactionSchema = new mongoose.Schema({
  safeAddress: {
    type: String,
  },
  txnHash: {
    type: String,
    unique: true,
  },
  txnData: {
    type: transactionDataSchema,
  },
  signatures: [
    {
      signer: {
        type: String,
      },
      data: {
        type: String,
      },
    },
  ],
  signCombo: {
    type: String,
  },
});

export const transactionModel = mongoose.model(
  "transactions",
  transactionSchema
);
