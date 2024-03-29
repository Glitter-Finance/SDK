import { BridgeNetworks, BridgeType, PartialBridgeTxn } from "@glitter-finance/sdk-core";
import { GlitterSDKServer } from "../../../glitterSDKServer";
import { Cursor, CursorFilter, NewCursor, UpdateCursor } from "../../common/cursor";
import { GlitterPoller, PollerResult } from "../../common/poller.Interface";
import { ServerError } from "../../common/serverErrors";
import { AlgorandCircleParser } from "./poller.algorand.circle";
//import { AlgorandTokenV2Parser } from "./poller.algorand.token.v2";
import { AlgorandTokenV1Parser } from "./poller.algorand.token.v1";

/**
 * Glitter Algorand Poller class.
 * Implements the GlitterPoller interface.
 */
export class GlitterAlgorandPoller implements GlitterPoller {

    //Network
    public network: BridgeNetworks = BridgeNetworks.algorand;

    //Cursors
    /**
     * Cursors object for tracking transaction cursors.
     * The keys represent BridgeTypes and the values are arrays of Cursor objects.
     *
     * @type {Record<BridgeType, Cursor[]>}
     */
    public cursors: Record<BridgeType, Cursor[]>;

    /**
     * Get the tokenV1Cursor.
     *
     * @type {Cursor | undefined}
     * @readonly
     */
    public get tokenV1Cursor(): Cursor | undefined {
        return this.cursors?.[BridgeType.TokenV1]?.[0];
    }
    /**
     * Get the tokenV2Cursor.
     *
     * @type {Cursor | undefined}
     * @readonly
     */
    public get tokenV2Cursor(): Cursor | undefined {
        return this.cursors?.[BridgeType.TokenV2]?.[0];
    }
    /**
     * Get the usdcCursors.
     *
     * @type {Cursor | undefined}
     * @readonly
     */
    public get usdcCursors(): Cursor[] | undefined {
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

    /**
     * Initializes the GlitterAlgorandPoller.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @returns {void}
     */
    initialize(sdkServer: GlitterSDKServer): void {

        //Add Token Cursor
        const tokenAddress = parseInt(sdkServer.sdk?.algorand?.getAddress("tokenBridgeProgramID")?.toString() || "");
        if (tokenAddress)
            this.cursors[BridgeType.TokenV1].push(
                NewCursor(
                    BridgeNetworks.algorand,
                    BridgeType.TokenV1,
                    tokenAddress,
                    sdkServer.defaultLimit
                )
            );

        //Add Token V2 Cursor
        const tokenV2Address = parseInt(sdkServer.sdk?.algorand?.getAddress("tokenBridgeV2ProgramID")?.toString() || "");
        if (tokenV2Address)
            this.cursors[BridgeType.TokenV2].push(
                NewCursor(
                    BridgeNetworks.algorand,
                    BridgeType.TokenV2,
                    tokenV2Address,
                    sdkServer.defaultLimit
                )
            );

        //Add USDC Cursors
        const usdcAddresses = [
            sdkServer.sdk?.algorand?.getAddress("usdcDeposit"),
            sdkServer.sdk?.algorand?.getAddress("usdcReceiver"),
        ];
        usdcAddresses.forEach((address) => {
            if (address)
                this.cursors[BridgeType.Circle]?.push(
                    NewCursor(BridgeNetworks.algorand, BridgeType.Circle, address, sdkServer.defaultLimit)
                );
        });
    }

    /**
     * Polls for new transactions.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {Cursor} cursor - The cursor object indicating the starting point for polling.
     * @returns {Promise<PollerResult>} A promise that resolves to a PollerResult object.
     */
    async poll(sdkServer: GlitterSDKServer, cursor: Cursor): Promise<PollerResult> {
        const partialTxns: PartialBridgeTxn[] = [];
        try {

            //get indexer
            const indexer = sdkServer.sdk?.algorand?.clientIndexer;
            const client = sdkServer.sdk?.algorand?.client;

            if (!indexer) { throw ServerError.ClientNotSet(BridgeNetworks.algorand); }
            if (!client) { throw ServerError.ClientNotSet(BridgeNetworks.algorand); }

            //Get transactions
            const caller = indexer
                .searchForTransactions()

            if (cursor.batch?.nextAPIToken) caller.nextToken(cursor.batch?.nextAPIToken);
            if (cursor.limit) caller.limit(cursor.limit);
            if (cursor.end?.block) caller.minRound(Number(cursor.end.block));

            //Check appid or address
            if (typeof cursor.address === "number") {
                caller.applicationID(cursor.address);
            } else if (typeof cursor.address === "string") {
                caller.address(cursor.address);
            }

            //Get response
            const response = await caller.do();

            //Set next token
            const nextToken = response['next-token'];

            //Map Signatures
            const signatures: string[] = [];
            if (response && response.transactions) {
                signatures.push(...response.transactions.map((txn: any) => txn.id));
            }

            //Get partial transactions

            let maxBlock = cursor.end?.block as number || 0;
            for (const txnID of signatures) {

                //Check if transaction was previously processed
                if (cursor.batch?.txns?.has(txnID)) continue;
                if (cursor.lastBatchTxns?.has(txnID)) continue;

                //Process Transaction
                const partialTxn = await this.parseTxnID(sdkServer, txnID, cursor.bridgeType);
                if (!partialTxn) continue;

                //Run Through Filter
                if (CursorFilter(cursor, partialTxn)) partialTxns.push(partialTxn);

                //Update max block
                if (partialTxn?.block) maxBlock = Math.max(maxBlock, partialTxn.block);

            }

            //Ensure that max block is really max in the case of backward counting batches
            maxBlock = Math.max(maxBlock, cursor.batch?.block as number || 0);

            //update cursor        
            cursor = await UpdateCursor(cursor, signatures, maxBlock, nextToken);

        } catch (error) {
            console.log(error);
        }

        //Return Result
        return {
            cursor: cursor,
            txns: partialTxns,
        };
    }

    /**
     * Parses a transaction ID.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {string} txnID - The transaction ID to parse.
     * @param {BridgeType} type - The bridge type associated with the transaction.
     * @returns {Promise<PartialBridgeTxn | undefined>} A promise that resolves to a PartialBridgeTxn object or undefined.
     */
    async parseTxnID(sdkServer: GlitterSDKServer, txnID: string, type: BridgeType): Promise<PartialBridgeTxn | undefined> {
        try {
            //Ensure Transaction Exists
            if (!txnID) return;

            //get indexer
            const indexer = sdkServer.sdk?.algorand?.clientIndexer;
            const client = sdkServer.sdk?.algorand?.client;

            //Process Transaction
            switch (type) {
                case BridgeType.TokenV1:
                    return await AlgorandTokenV1Parser.process(sdkServer, txnID, client, indexer);
                case BridgeType.TokenV2:
                    return undefined; //await AlgorandTokenV2Parser.process(sdkServer, txnID, client, indexer);
                case BridgeType.Circle:
                    return await AlgorandCircleParser.process(sdkServer, txnID, client, indexer);
                default:
                    throw ServerError.InvalidBridgeType(
                        BridgeNetworks.algorand,
                        type
                    );
            }

        } catch (error) {
            console.error((error as Error).message)
        }

        return undefined;

    }

}
