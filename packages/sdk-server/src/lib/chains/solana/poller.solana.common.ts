import { ParsedTransactionWithMeta, TokenBalance } from "@solana/web3.js";
import { GlitterSDKServer } from "../../../glitterSDKServer";
import { BridgeNetworks, BridgeTokens } from "@glitter-finance/sdk-core/dist";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export type SolanaTransfer = {
  amount: number;
  transferTo: string;
  transferFrom: string;
};

/**
 * Solana Poller Common class.
 */
export class SolanaPollerCommon {

    //Get solana address with amount
    /**
     * Gets the Solana address with the corresponding amount from the transaction.
     *
     * @param {GlitterSDKServer} sdkServer - The Glitter SDK server instance.
     * @param {ParsedTransactionWithMeta} txn - The parsed transaction with metadata.
     * @param {string | null} token - The token address or null if not available.
     * @param {boolean} isDeposit - Indicates whether the transaction is a deposit or not.
     * @returns {[string, number]} An array containing the Solana address and the corresponding amount.
     */
    public static getSolanaAddressWithAmount(
        sdkServer: GlitterSDKServer,
        txn: ParsedTransactionWithMeta,
        token: string | null,
        isDeposit: boolean
    ): [string, number] {
       
        //Parse All Addresses in Transaction
        let max_address = "";
        let max_delta = 0;

        if (token) {

            //Get mint address
            //const mintAddress = sdkServer.sdk?.solana?.getMintAddress(token) || "";
            const mintAddress = BridgeTokens.getToken(BridgeNetworks.solana, token)?.address || "";

            if (mintAddress === "") {
                console.log("Mint Address not found for token: " + token);
                return ["", 0];
            }

            //Parser all post balances
            for (let i = 0; i < (txn?.meta?.postTokenBalances?.length || 0); i++) {
                //Check mint address
                const postBalanceObj = txn?.meta?.postTokenBalances?.[i];
                if (postBalanceObj?.mint.toLocaleLowerCase() !== mintAddress.toLocaleLowerCase()) {
                    console.log(`Pre ${postBalanceObj?.mint} !== ${mintAddress}`);
                    continue;
                }

                const address = postBalanceObj?.owner || "";
                const preBalance = this.getPreBalance(txn, postBalanceObj);
                const postBalance = postBalanceObj?.uiTokenAmount.uiAmount;
                const delta = Number(Number(postBalance || 0) - Number(preBalance || 0));

                if (isDeposit && delta < 0) {
                    if (delta < max_delta) {
                        max_delta = delta;
                        max_address = address;
                    }
                } else if (!isDeposit && delta > 0) {
                    if (delta > max_delta) {
                        max_delta = delta;
                        max_address = address;
                    }
                }
            }
        } else {
            for (let i = 0; i < txn?.transaction?.message?.accountKeys.length; i++) {
                //Get Address
                const address = txn?.transaction?.message?.accountKeys[i]?.pubkey.toString();
                if (!address) continue;

                let delta = Number(0);
                let preBalance: number | null | undefined = 0;
                let postBalance: number | null | undefined = 0;

                //Check Sol delta
                preBalance = txn?.meta?.preBalances[i];
                postBalance = txn?.meta?.postBalances[i];
                delta = Number(postBalance || 0) - Number(preBalance || 0);

                if (isDeposit && delta < 0) {
                    //Check if max delta
                    if (delta < max_delta) {
                        max_delta = delta;
                        max_address = address;
                    }
                } else if (!isDeposit && delta > 0) {
                    //Check if max delta
                    if (delta > max_delta) {
                        max_delta = delta;
                        max_address = address;
                    }
                }
            }
        }

        return [max_address, max_delta];
    }

    public static async getSolanaFromTo(
        txn: ParsedTransactionWithMeta,
        token: string | null,
    ): Promise<Map<number, SolanaTransfer>|undefined> {

        const transfers = new Map<number, SolanaTransfer>();

        if (token) {

            //Get mint address
            const tokenData = BridgeTokens.getToken(BridgeNetworks.solana, token);
            const decimals = tokenData?.decimals || 18;
            const mintAddress = tokenData?.address || "";

            if (mintAddress === "") {
                console.log("Mint Address not found for token: " + token);
                return undefined;
            }

            //Parser all post balances
            for (let i = 0; i < (txn?.meta?.postTokenBalances?.length || 0); i++) {
                //Check mint address
                const postBalanceObj = txn?.meta?.postTokenBalances?.[i];
                if (postBalanceObj?.mint.toLocaleLowerCase() !== mintAddress.toLocaleLowerCase()) {
                    console.log(`Pre ${postBalanceObj?.mint} !== ${mintAddress}`);
                    continue;
                }

                const owner = postBalanceObj?.owner || "";
                const preBalance = this.getPreBalance(txn, postBalanceObj);
                const postBalance = postBalanceObj?.uiTokenAmount.uiAmount;
                const delta = Number((Number(Number(postBalance || 0) - Number(preBalance || 0))).toFixed(decimals));

                const address = txn.transaction.message.accountKeys[postBalanceObj.accountIndex].pubkey;
            
                //const tokenAccount = await getAssociatedTokenAddress(new PublicKey(mintAddress), new PublicKey(owner));

                const absDelta = Math.abs(delta);
                if (!transfers.has(absDelta)) {
                 
                    const transfer: SolanaTransfer = {
                        amount: absDelta,
                        transferFrom: "",
                        transferTo: "",
                    };
                    transfers.set(absDelta, transfer);
                  
                }
                const transfer = transfers.get(absDelta);
                if (!transfer) continue;
                if (delta < 0) {
                    transfer.transferFrom = address.toBase58();
                } else {
                    transfer.transferTo = address.toBase58();
                }
            }
        } else {
            for (let i = 0; i < txn?.transaction?.message?.accountKeys.length; i++) {
                //Get Address
                const address = txn?.transaction?.message?.accountKeys[i]?.pubkey.toString();
                if (!address) continue;

                let delta = Number(0);
                let preBalance: number | null | undefined = 0;
                let postBalance: number | null | undefined = 0;

                //Check Sol delta
                preBalance = txn?.meta?.preBalances[i];
                postBalance = txn?.meta?.postBalances[i];
                delta = Number(postBalance || 0) - Number(preBalance || 0);

                const absDelta = Math.abs(delta);
                if (!transfers.has(absDelta)) {
                 
                    const transfer: SolanaTransfer = {
                        amount: absDelta,
                        transferFrom: "",
                        transferTo: "",
                    };
                    transfers.set(absDelta, transfer);
                  
                }
                const transfer = transfers.get(absDelta);
                if (!transfer) continue;
                if (delta < 0) {
                    transfer.transferFrom = address;
                } else {
                    transfer.transferTo = address;
                }
            }
        }

        return transfers;

    }
    //Match a prebalance to a post balance object
    /**
     * Gets the pre-balance from the transaction and post-balance.
     *
     * @param {ParsedTransactionWithMeta} txn - The parsed transaction with metadata.
     * @param {TokenBalance | undefined} postBalance - The post-balance information or undefined if not available.
     * @returns {any} The pre-balance information.
     */
    public static getPreBalance(txn: ParsedTransactionWithMeta, postBalance: TokenBalance | undefined) {
        if (!postBalance) {
            return 0;
        }

        for (let i = 0; i < (txn?.meta?.preTokenBalances?.length || 0); i++) {

            if (txn?.meta?.preTokenBalances?.[i].accountIndex != postBalance?.accountIndex) {
                continue;
            }           
            return txn?.meta?.preTokenBalances?.[i].uiTokenAmount.uiAmount;
        }
    }
}
