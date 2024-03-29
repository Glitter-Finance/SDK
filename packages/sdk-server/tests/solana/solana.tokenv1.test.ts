import { BridgeNetworks, GlitterEnvironment } from "@glitter-finance/sdk-core";
import { GlitterSolanaPoller } from "../../src/lib/chains/solana/poller.solana";
import { GlitterPoller } from "../../src/lib/common/poller.Interface";
import { GlitterSDKServer } from "../../src/lib/glitterSDKServer";
import assert from "assert";
import * as util from "util";

describe("Solana Poller Token V1 Tests ", () => {
    //Initialize SDK
    let sdk: GlitterSDKServer;
    let poller: GlitterPoller | undefined;

    //Before All tests -> create new SDK
    beforeAll(async () => {
        //Initialize SDK
        sdk = new GlitterSDKServer(GlitterEnvironment.mainnet);

        //Create Solana Poller
        sdk.createPollers([BridgeNetworks.solana]);

        //local references for ease of use
        poller = sdk.poller(BridgeNetworks.solana);
    });

    //Default Cursor Test
    it("Default Cursor Test", async () => {
        if (!poller) throw Error("Poller is undefined");
        const cursor = poller.tokenV1Cursor;
        assert(cursor);

        const result = await poller.poll(sdk, cursor);
        console.log(util.inspect(result, false, null, true /* enable colors */));
    });

    afterAll(async () => {
        console.log("Closing SDK");
    });
});
