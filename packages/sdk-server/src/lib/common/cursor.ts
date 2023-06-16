import { BridgeNetworks, BridgeType, ChainStatus, PartialBridgeTxn, TransactionType } from "@glitter-finance/sdk-core";

export type Cursor = {
    //What to watch
    network: BridgeNetworks;
    bridgeType: BridgeType;
    address: string | number;

    //Bounds
    beginning?: CursorPosition;
    end?: CursorPosition;
    limit?: number;

    //Filter
    filter?: CursorFilter;

    //Batching
    batch?: CursorBatch;
    lastBatchTxns?: Set<string>;

};
export type CursorPosition = {
    txn?: string;
    block?: string | number;
    time?: string;
};
export type CursorBatch = {
    position?: string | number;
    block?: string | number;
    txns: Set<string>;
    complete: boolean;    
    nextAPIToken?: string;
};
export type CursorFilter = {
    txnType?: TransactionType;
    chainStatus?: ChainStatus;
}

export function NewCursor(network: BridgeNetworks, bridgeType: BridgeType, address: string|number, limit: number): Cursor {
    return {
        network: network,
        bridgeType: bridgeType,
        address: address,
        beginning: undefined,
        end: undefined,
        limit: limit,
        batch: undefined,
    };
}

export function CompleteBatch(cursor: Cursor, maxBlock?:number): Cursor {
    //Set end transaction
    cursor.end = {
        txn: cursor.beginning?.txn,
        block: cursor.beginning?.block,
        time: cursor.beginning?.time,
    };
    if (maxBlock) cursor.end.block = maxBlock;

    //Reset beginning
    cursor.beginning = undefined;

    //Reset batch
    cursor.lastBatchTxns = cursor.batch?.txns;
    cursor.batch = undefined;

    //Return cursor
    return cursor;
}
export function CursorFilter(cursor: Cursor, txn:PartialBridgeTxn): PartialBridgeTxn|undefined {
    if (!cursor.filter) return txn;
    if (cursor.filter.txnType && cursor.filter.txnType != txn.txnType) return undefined;
    if (cursor.filter.chainStatus && cursor.filter.chainStatus != txn.chainStatus) return undefined;
    return txn;
}
//Update Cursor
export async function UpdateCursor(
    cursor: Cursor,
    txnIDs: string[],
    maxBlock?: number,
    nextAPIToken?: string
): Promise<Cursor> {

    //Check if we have maxxed out the limit
    if (txnIDs && txnIDs.length == cursor.limit) {

        //Check if Batch Exists
        if (!cursor.batch) {

            //Need to create new batch
            cursor.batch = {
                txns: new Set<string>(txnIDs),
                position: txnIDs[txnIDs.length - 1],
                complete: false,
                block: maxBlock,
                nextAPIToken: nextAPIToken,
            };

            //Need to set start position for when batch is complete
            cursor.beginning = {
                txn: txnIDs[0],
            };

        } else {

            //Update Batch
            txnIDs.forEach(txnID => cursor.batch?.txns.add(txnID));
            cursor.batch.position = txnIDs[txnIDs.length - 1];

            if (maxBlock) cursor.batch.block = maxBlock;
            if (nextAPIToken) cursor.batch.nextAPIToken = nextAPIToken;

        }
    } else if (!txnIDs || txnIDs.length == 0) {

        //No more transactions to fetch
        if (cursor.batch) {
            cursor = CompleteBatch(cursor, maxBlock);
        } else {
            //No change to cursor
        }

    } else {

        //We have less than the limit
        if (cursor.batch) {
            txnIDs.forEach(txnID => cursor.batch?.txns.add(txnID));
            cursor = CompleteBatch(cursor, maxBlock);
        } else {

            //Need to update the end position
            cursor.end = {
                txn: txnIDs[txnIDs.length - 1],
                block: cursor.beginning?.block,
                time: cursor.beginning?.time,
            };

            //Reset beginning
            cursor.beginning = undefined;
            cursor.lastBatchTxns = new Set<string>(txnIDs);

        }

    }

    return cursor;
}
