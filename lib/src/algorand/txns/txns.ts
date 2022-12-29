import { revoke } from '@solana/spl-token';
import * as algosdk from 'algosdk';
import { Transaction } from "algosdk";
//@ts-ignore
import AlgodClient from 'algosdk/dist/types/src/client/v2/algod/algod';
import {
    BridgeToken,
    BridgeTokens,
    Routing,
    RoutingString,
    SetRoutingUnits
} from "glitter-bridge-common";

import {getUsdcRecieverAddress, getUSDCAssetID} from '../algoConnectionpublic';

export class AlgorandTxns {
    private _client: algosdk.Algodv2;
    private _algoToken: BridgeToken | undefined;

    //constructor
    public constructor(algoClient: any,) {
        this._client = algoClient;
    }
    public get AlgoToken(): BridgeToken | undefined {
        if (!this._algoToken) {
            this._algoToken = BridgeTokens.get("algorand", "algo");
        }
        return this._algoToken;
    }

    //Txn Definitions
    async sendAlgoTransaction(routing: Routing): Promise<Transaction> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                //Get Default Parameters
                const params = await this._client.getTransactionParams().do();
                params.fee = 1000;
                params.flatFee = true;

                //Get Routing Units
                if (!routing.units) {
                    SetRoutingUnits(routing, this.AlgoToken);
                }

                //Encode Note
                console.log(RoutingString(routing));
                const note = algosdk.encodeObj({
                    routing: RoutingString(routing),
                    date: `${new Date()}`,
                });

                const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    suggestedParams: params,
                    from: routing.from.address,
                    to: routing.to.address,
                    amount: Number(routing.units),
                    note: note,
                    closeRemainderTo: undefined,
                    rekeyTo: undefined,
                });

                resolve(txn);

            } catch (error) {
                reject(error);
            }
        });

    }
  
    async initAlgorandUSDCTokenBridge(
        routing:Routing,
        token:BridgeToken | undefined,
        cluster:string
    ) :Promise<algosdk.Transaction[]> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async(resolve,reject) => {
            try{    
        //Get Default Parameters
        const params = await this._client.getTransactionParams().do();
        params.fee = 1000;
        params.flatFee = true;
        const assetID = getUSDCAssetID(cluster);
       
        //Get Routing Units
        if (!routing.units) SetRoutingUnits(routing, token);
        //Encode Note
        console.log(RoutingString(routing));
        const note = algosdk.encodeObj({
            routing: RoutingString(routing),
            date: `${new Date()}`,
        });
        const UsdcRecieverAddress = getUsdcRecieverAddress(cluster);
        
        const Deposittxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            suggestedParams: params,
            assetIndex: Number(assetID),
            from: routing.from.address,
            to: UsdcRecieverAddress,
            amount: Number(routing.units),
            note: note,
            closeRemainderTo: undefined,
            revocationTarget: undefined,
            rekeyTo: undefined,
        });
        let txnsArray = [Deposittxn];
        const groupID = algosdk.computeGroupID(txnsArray);
        for (let i = 0; i < 1; i++) txnsArray[i].group = groupID;

        resolve(txnsArray);
            }catch(err){
                reject(err)
            }
        })
    }

    async sendTokensTransaction(routing: Routing,
        token: BridgeToken): Promise<Transaction> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Get Default Parameters
                const params = await this._client.getTransactionParams().do();
                params.fee = 1000;
                params.flatFee = true;

                const assetID = token.address;

                //Get Routing Units
                if (!routing.units) SetRoutingUnits(routing, token);

                //Encode Note
                console.log(RoutingString(routing));
                const note = algosdk.encodeObj({
                    routing: RoutingString(routing),
                    date: `${new Date()}`,
                });

                console.log(`Sending ${routing.units} ${token.symbol} from ${routing.from.address} to ${routing.to.address}`);

                const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    suggestedParams: params,
                    assetIndex: Number(assetID),
                    from: routing.from.address,
                    to: routing.to.address,
                    amount: Number(routing.units),
                    note: note,
                    closeRemainderTo: undefined,
                    revocationTarget: undefined,
                    rekeyTo: undefined,
                });

                resolve(txn);

            } catch (error) {
                reject(error);
            }
        });

    }

    async optinTransaction(address: string,
        token_asset_id: number): Promise<Transaction> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                //Get Default Transaction Params
                const suggestedParams = await this._client.getTransactionParams().do();

                //Setup Transaction
                const transactionOptions = {
                    from: address,
                    assetIndex: token_asset_id,
                    to: address,
                    amount: 0,
                    note: undefined,
                    closeRemainderTo: undefined,
                    revocationTarget: undefined,
                    rekeyTo: undefined,
                    suggestedParams,
                };
                const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(transactionOptions)
                resolve(txn);
            } catch (error) {
                reject(error);
            }
        });

    }

    async closeOutAccountTransaction(address_closing: string,
        address_receiving: string): Promise<Transaction> {
        return new Promise(async (resolve, reject) => {
            try {
                //Get Default Parameters
                const params = await this._client.getTransactionParams().do();
                params.fee = 1000;
                params.flatFee = true;

                //Encode Note
                const note = algosdk.encodeObj({
                    date: `${new Date()}`,
                });

                const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                    suggestedParams: params,
                    from: address_closing,
                    to: address_receiving,
                    amount: Number(0),
                    note: note,
                    closeRemainderTo: address_receiving,
                    rekeyTo: undefined,
                });

                resolve(txn);
            } catch (error) {
                reject(error);
            }
        });
    }
    async closeOutTokenTransaction(address_closing: string,
        address_receiving: string,
        token_asset_id: number): Promise<Transaction> {
        return new Promise(async (resolve, reject) => {
            try {
                //Get Default Transaction Params
                const suggestedParams = await this._client.getTransactionParams().do();

                //Setup Transaction
                const transactionOptions = {
                    from: address_closing,
                    assetIndex: token_asset_id,
                    to: address_receiving,
                    amount: 0,
                    note: undefined,
                    closeRemainderTo: address_receiving,
                    revocationTarget: undefined,
                    rekeyTo: undefined,
                    suggestedParams,
                };
                const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(transactionOptions)
                resolve(txn);
            } catch (error) {
                reject(error);
            }
        });
    }
}
