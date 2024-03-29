import { BridgeNetworks, GlitterEnvironment, Sleep } from "@glitter-finance/sdk-core";
import { GlitterPoller } from "../../src/lib/common/poller.Interface";
import { GlitterSDKServer } from "../../src/lib/glitterSDKServer";
import * as assert from "assert";
import * as util from "util";
import { error } from "console";

describe("Solana Poller USDC Tests ", () => {
    //Initialize SDK
    let sdk: GlitterSDKServer;
    let poller: GlitterPoller | undefined;

    //Before All tests -> create new SDK
    beforeAll(async () => {
        //Initialize SDK
        sdk = new GlitterSDKServer(GlitterEnvironment.testnet);

        //Create Solana Poller
        sdk.createPollers([BridgeNetworks.solana]);

        //local references for ease of use
        poller = sdk.poller(BridgeNetworks.solana);
    });

    //Default Cursor Test
    it("Default Cursor Test", async () => {
        throw new error("Latest solana contracts not implemented yet");

        // if (!poller) throw Error("Poller is undefined");
        // const cursor = poller.tokenV2Cursor;
        // assert(cursor != undefined, "Cursor is undefined");

        // cursor.beginning = {
        //     txn: "2UdbvM1iZVPVhJyh5mj6UAYzBBvxLFtJLYdadMpwH4f47BxdPiUnseHeRcXoyK9G97NWE6MFtqPPPJRFb1TYKgsr",
        // }
        // cursor.end = {
        //     txn: "SjQ9H1jjHMKVofdWNGaPt7Gs4zVTXQt8UWPeNABiUKu1srugTd1g1B5WKrBWbBuxSmNzJsekGZuT9MFsXHKcoR5",
        // }
        // cursor.limit = 12;

        // const result = await poller.poll(sdk, cursor);
        // console.log(util.inspect(result, false, null, true /* enable colors */));
    });

    afterAll(async () => {
        console.log("Closing SDK");
    });
});
