import { BridgeNetworks, BridgeType, PartialBridgeTxn } from "@glitter-finance/sdk-core";
import { GlitterSDKServer } from "../../../glitterSDKServer";
import { Cursor, CursorFilter, NewCursor, UpdateCursor } from "../../common/cursor";
import { GlitterPoller, PollerResult } from "../../common/poller.Interface";
import { ServerError } from "../../common/serverErrors";

export class GlitterTronPoller implements GlitterPoller {
   
    //Network
    public network: BridgeNetworks = BridgeNetworks.TRON;
    
    //Cursors
    public cursors: Record<BridgeType, Cursor[]> ;
    public get tokenV1Cursor(): Cursor | undefined{
        return this.cursors?.[BridgeType.TokenV1]?.[0];
    }
    public get tokenV2Cursor(): Cursor | undefined{
        return this.cursors?.[BridgeType.TokenV2]?.[0];
    }
    public get usdcCursors(): Cursor[] | undefined{
        return this.cursors?.[BridgeType.Circle];
    }

    constructor() {
        this.cursors = {
            [BridgeType.TokenV1]: [],
            [BridgeType.TokenV2]: [],
            [BridgeType.Circle]: [],
            [BridgeType.Unknown]: []
        };
    }
    
    //Initialize
    initialize(sdkServer: GlitterSDKServer): void {

        //Add USDC Cursors
        const usdcAddresses = [
            sdkServer.sdk?.tron?.getAddress("depositWallet"),
            sdkServer.sdk?.tron?.getAddress("releaseWallet"),
        ];      

        usdcAddresses.forEach((address) => {
            if (address)
                this.cursors[BridgeType.Circle]?.push(
                    NewCursor(BridgeNetworks.TRON, BridgeType.Circle, address, sdkServer.defaultLimit)
                );
        });
    }

    //Poll
    async poll(sdkServer: GlitterSDKServer, cursor: Cursor): Promise<PollerResult> {
       
        return {
            cursor: cursor,
            txns: [],
        }
        // //get indexer
        // const indexer = sdkServer.sdk?.tron?.clientIndexer;
        // const client = sdkServer.sdk?.algorand?.client;

        // if (!indexer) { throw ServerError.ClientNotSet(BridgeNetworks.algorand) ;}
        // if (!client) { throw ServerError.ClientNotSet(BridgeNetworks.algorand); }

        // //Get transactions
        // const caller = indexer
        //     .searchForTransactions()

        // if (cursor.batch?.nextAPIToken) caller.nextToken(cursor.batch?.nextAPIToken);
        // if (cursor.limit) caller.limit(cursor.limit);
        // if (cursor.beginning?.block) caller.minRound(Number(cursor.beginning.block));

        // //Check appid or address
        // if (typeof cursor.address === "number") {
        //     caller.applicationID(cursor.address);
        // } else if (typeof cursor.address === "string") {
        //     caller.address(cursor.address);
        // }

        // //Get response
        // const response = await caller.do();

        // //Set next token
        // const nextToken = response['next-token'];

        // //Map Signatures
        // const signatures: string[] = [];
        // if (response && response.transactions) {
        //     signatures.push(...response.transactions.map((txn:any) => txn.id));
        // }

        // //Get partial transactions
        // const partialTxns: PartialBridgeTxn[] = [];
        // for (const txnID of signatures) {
        //     try {
        //         //Ensure Transaction Exists
        //         if (!txnID) continue;

        //Check if transaction was previously processed
        //if (cursor.batch?.txns?.has(txnID)) continue;
        //if (cursor.lastBatchTxns?.has(txnID)) continue;
    
        //         //Process Transaction
        //         let partialTxn: PartialBridgeTxn | undefined;
        //         switch (cursor.bridgeType) {
        //             case BridgeType.TokenV1:
        //                 partialTxn = await AlgorandTokenV1Parser.process(sdkServer, txnID, client, indexer);
        //                 break;
        //             case BridgeType.TokenV2:
        //                 partialTxn = await AlgorandTokenV2Parser.process(sdkServer, txnID, client, indexer, cursor);
        //                 break;
        //             case BridgeType.USDC:
        //                 partialTxn = await AlgorandUSDCParser.process(sdkServer, txnID, client, indexer, cursor);
        //                 break;
        //             default:
        //                 throw ServerError.InvalidBridgeType(
        //                     BridgeNetworks.algorand,
        //                     cursor.bridgeType
        //                 );
        //         }
        //         if (CursorFilter(cursor, partialTxn)) partialTxns.push(partialTxn);                
        //     } catch (error) {
        //         console.error((error as Error).message)
        //     }
        // }

        // //update cursor
        // cursor = await UpdateCursor(cursor, signatures, undefined, nextToken);

        // //Return Result
        // return {
        //     cursor: cursor,
        //     txns: partialTxns,
        // };
    }
}
