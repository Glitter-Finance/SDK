import { BridgeTokens, BridgeNetworks, BridgeType, ChainStatus, DepositNote, PartialBridgeTxn, Routing, RoutingHelper, TransactionType } from "@glitter-finance/sdk-core/dist";
import { getHashedTransactionId } from "@glitter-finance/sdk-core";
import { AlgorandStandardAssetConfig } from "@glitter-finance/sdk-core/dist/lib/common/tokens";
import algosdk from "algosdk";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";
import IndexerClient from "algosdk/dist/types/client/v2/indexer/indexer";
import { GlitterSDKServer } from "../../../glitterSDKServer";
import { BigNumber } from "bignumber.js";

/**
 * AlgorandCircleParser is a utility class for parsing data related to Algorand Circle.
 */
export class AlgorandCircleParser {

    static circleTreasury = "ZG54ZBZ5LVWV3MTGOPDSKCBL5LEQTAPUTN5OQQZUMTAYV3JIICA7G3RJZE";

    /**
     * Processes a transaction using the Algorand Circle parser.
     * 
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {string} txnID - The transaction ID to be processed.
     * @param {AlgodClient | undefined} client - The AlgodClient for making Algorand API requests (optional).
     * @param {IndexerClient | undefined} indexer - The IndexerClient for making Algorand Indexer API requests (optional).
     * @returns {Promise<PartialBridgeTxn>} A Promise that resolves to the processed partial bridge transaction.
     */
    public static async process(
        sdkServer: GlitterSDKServer,
        txnID: string,
        client: AlgodClient | undefined,
        indexer: IndexerClient | undefined
    ): Promise<PartialBridgeTxn> {
     
        //Get Algorand Transaction data
        const txnHashed = getHashedTransactionId(BridgeNetworks.algorand, txnID);
        let partialTxn: PartialBridgeTxn = {
            txnID: txnID,
            txnIDHashed: txnHashed,
            bridgeType: BridgeType.Circle,
            txnType: TransactionType.Unknown,
            network: "algorand",
            chainStatus: ChainStatus.Completed,
            protocol: "Glitter Finance"
        }
       
        //Fail Safe
        const BASE_LOG = `NewAlgorandTxn: ${txnID}`;
        if (!client) throw new Error(BASE_LOG + " Algorand client not initialized");  
        if (!indexer) throw new Error(BASE_LOG + " Algorand indexer not initialized");        
        const txnData = await indexer.lookupTransactionByID(txnID).do();
        if (!txnData) throw new Error(BASE_LOG + " Algorand transaction not found");
        
        //Get transaction
        const txn = txnData["transaction"];

        //Get Sender/Reveiver
        const sender = txn.sender;
        const receiver = txn["payment-transaction"]? txn["payment-transaction"].receiver : txn["asset-transfer-transaction"].receiver;
      
        //calculate gas
        const gasCost = txn.fee;
        partialTxn.gasPaid = new BigNumber(gasCost);

        //Timestamp
        const transactionTimestamp = txn["round-time"];
        partialTxn.txnTimestamp = new Date((transactionTimestamp || 0) * 1000); //*1000 is to convert to milliseconds
        partialTxn.block = txn["confirmed-round"];

        //Get Routing
        let routing: Routing | null = null;
        if (txn.note) routing= this.parseDepositNote(txn.note);

        //Check deposit vs release
        const depositAddress = sdkServer.sdk?.algorand?.getAddress("usdcDeposit");
        const releaseAddress = sdkServer.sdk?.algorand?.getAddress("usdcReceiver");        
        if (sender && sender === depositAddress || receiver && receiver === depositAddress) {
            partialTxn.address = depositAddress;
            partialTxn = await this.handleDeposit(sdkServer, txnID, txn, routing, partialTxn);
        }else if (sender && sender === releaseAddress || receiver && receiver === releaseAddress) {
            partialTxn.address = releaseAddress;
            partialTxn = await this.handleRelease(sdkServer, txnID, txn, routing, partialTxn);
        } else {
            throw new Error(BASE_LOG + " Address not found");
        }

        return partialTxn;
    }

    /**
     * Handles a deposit transaction.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {string} txnID - The ID of the transaction.
     * @param {any} txn - The transaction object.
     * @param {Routing | null} routing - The routing information.
     * @param {PartialBridgeTxn} partialTxn - The partial transaction object.
     * @returns {Promise<PartialBridgeTxn>} A Promise that resolves to the updated partial transaction object.
     */
    static async handleDeposit(
        sdkServer: GlitterSDKServer,
        txnID: string,
        txn: any,
        routing: Routing | null,
        partialTxn: PartialBridgeTxn): Promise<PartialBridgeTxn> {
        const decimals = 6;

        //Set type
        
        partialTxn.tokenSymbol = "USDC";
        partialTxn.baseSymbol = "USDC";

        //Check Asset Send
        if (!txn["asset-transfer-transaction"]) {
            //Check if this is the circle account
            if (partialTxn.address == "ZG54ZBZ5LVWV3MTGOPDSKCBL5LEQTAPUTN5OQQZUMTAYV3JIICA7G3RJZE") {
                partialTxn.txnType = TransactionType.GasDeposit;
                partialTxn.units = new BigNumber(txn["payment-transaction"].amount);
                partialTxn.address = txn.sender;
            } else {
                partialTxn.txnType = TransactionType.Transfer;
                partialTxn.units = new BigNumber(txn["payment-transaction"].amount);
                partialTxn.address = txn.sender;
            }
            return partialTxn;
        }
        const units = txn["asset-transfer-transaction"].amount;
        const assetID = txn["asset-transfer-transaction"]["asset-id"];

        //Check if asset is USDC
        const usdcAsset = BridgeTokens.getToken(BridgeNetworks.algorand, "usdc") as AlgorandStandardAssetConfig;
        const usdcAssetID = usdcAsset.assetId;
        if (assetID !== usdcAssetID) throw new Error(`Transaction ${txnID} is not a USDC transaction`);
        
        const sender = txn.sender;
        const receiver = txn["asset-transfer-transaction"]? txn["asset-transfer-transaction"].receiver: txn["payment-transaction"].receiver;
        if (sender == sdkServer.sdk?.algorand?.getAddress("usdcDeposit")) {

            //This is a transfer or refund
            if (!routing) {
                partialTxn.txnType = TransactionType.Transfer;
            } else {
                partialTxn.txnType = TransactionType.Refund;
            }
            partialTxn.address = txn["asset-transfer-transaction"].receiver;

        } else {
        //this is a deposit
            partialTxn.address = txn.sender;
            partialTxn.txnType = TransactionType.Deposit;
        }

        if (receiver == this.circleTreasury){
            partialTxn.txnType = TransactionType.TransferStart;            
        }

        partialTxn.units = units;
        partialTxn.amount = RoutingHelper.ReadableValue_FromBaseUnits(units, decimals);

        partialTxn.routing = routing;
        return Promise.resolve(partialTxn);
    }

    /**
     * Handles a release transaction.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {string} txnID - The ID of the transaction.
     * @param {any} txn - The transaction object.
     * @param {Routing | null} routing - The routing information.
     * @param {PartialBridgeTxn} partialTxn - The partial transaction object.
     * @returns {Promise<PartialBridgeTxn>} A Promise that resolves to the updated partial transaction object.
     */
    static async handleRelease(
        sdkServer: GlitterSDKServer,
        txnID: string,
        txn: any,
        routing: Routing | null,
        partialTxn: PartialBridgeTxn): Promise<PartialBridgeTxn> {
        const decimals = 6;

        //Set type
        partialTxn.tokenSymbol = "USDC";
        partialTxn.baseSymbol = "USDC";

        //Get Address
        //Check Asset Send
        if (!txn["asset-transfer-transaction"]) {

            //Check if this is the circle account
            if (partialTxn.address == "ZG54ZBZ5LVWV3MTGOPDSKCBL5LEQTAPUTN5OQQZUMTAYV3JIICA7G3RJZE") {
                partialTxn.txnType = TransactionType.GasDeposit;
                partialTxn.units = new BigNumber(txn["payment-transaction"].amount);
                partialTxn.address = txn.sender;
            } else {
                partialTxn.txnType = TransactionType.Transfer;
                partialTxn.units = new BigNumber(txn["payment-transaction"].amount);
                partialTxn.address = txn.sender;
            }
            return partialTxn;
        }
        const units = txn["asset-transfer-transaction"].amount;
        const assetID = txn["asset-transfer-transaction"]["asset-id"];

        //Check if asset is USDC
        const usdcAsset = BridgeTokens.getToken(BridgeNetworks.algorand, "usdc") as AlgorandStandardAssetConfig;
        const usdcAssetID = usdcAsset.assetId;
        if (assetID !== usdcAssetID) throw new Error(`Transaction ${txnID} is not a USDC transaction`);

        const sender = txn.sender;
        const receiver = txn["asset-transfer-transaction"].receiver;
        if (receiver == sdkServer.sdk?.algorand?.getAddress("usdcReceiver")) {
        //This is a transfer
            partialTxn.address = receiver;
            partialTxn.txnType = TransactionType.Transfer;
        } else {
        //this is a release
            partialTxn.address = receiver;
            if (receiver == sdkServer.sdk?.algorand?.getAddress("feeReceiver")) {
                partialTxn.txnType = TransactionType.FeeTransfer;
            } else {
                partialTxn.txnType = TransactionType.Release;
            }

        }

        if (sender == this.circleTreasury){
            partialTxn.txnType = TransactionType.TransferEnd;            
        }

        partialTxn.units = units;
        partialTxn.amount = RoutingHelper.ReadableValue_FromBaseUnits(units, decimals);

        partialTxn.routing = routing;
        return Promise.resolve(partialTxn);
    }

    /**
     * Parses a deposit note and returns the routing information.
     *
     * @param {any} note - The deposit note to parse.
     * @returns {Routing} The routing information extracted from the deposit note.
     */
    static parseDepositNote(note: any): Routing {
        let depositNote: DepositNote | undefined = undefined;

        try {
            depositNote = JSON.parse(decodeURIComponent(atob(note)));

            if (depositNote && !depositNote.system) {
                depositNote = undefined
            }
        } catch (error) {
            //console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        }

        try {
            if (!depositNote) {
                depositNote = (algosdk.decodeObj(Buffer.from(note, "base64")) as any)
            }
        } catch (error) {
            //console.error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
        }

        if (!depositNote) throw new Error("[AlgorandDepositHandler] Unable to parse transaction: ")
        if (!depositNote.system){
            throw new Error(
                "[AlgorandDepositHandler] Unable to parse transaction: ");
        } else if (typeof depositNote.system == 'string'){
            depositNote.system = JSON.parse(depositNote.system);
        }

        const routingData: Routing = depositNote.system as any;
        return routingData;
    }
}