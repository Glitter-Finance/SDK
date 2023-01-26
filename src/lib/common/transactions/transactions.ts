import { Routing } from "../routing/routing"

export enum TransactionType{
    Unknown = "Unknown",
    Deposit = "Deposit",
    Release = "Release",
    Refund =  "Refund",
    Transfer = "Transfer",
    Finalize = "Finalize",
}
export enum ChainStatus{
    Unknown = "Unknown",
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed",
    Cancelled = "Cancelled",
}

export type PartialBridgeTxn ={
    txnID:string, 
    txnTimestamp?:Date,
    txnType:TransactionType, 
    chainStatus?:ChainStatus|null,
    network?:string|null,
    tokenSymbol?:string|null,
    address?:string|null,
    units?:bigint|null,
    amount?:number|null,
    routing?:Routing |null    
};

