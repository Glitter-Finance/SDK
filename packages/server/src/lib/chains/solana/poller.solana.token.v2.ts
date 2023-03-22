import {
    ConfirmedSignatureInfo,
    ParsedTransactionWithMeta,
    TransactionSignature,
    VersionedTransactionResponse,
} from "@solana/web3.js";
import { PartialBridgeTxn } from "glitter-sdk-core/dist";
import { GlitterSDKServer } from "../../glitterSDKServer";

export class SolanaV2Parser {
    public static async process(
        sdkServer: GlitterSDKServer,
        txn: ParsedTransactionWithMeta
    ): Promise<PartialBridgeTxn> {
        throw new Error("Method not implemented.");
    }
}
