import "dotenv/config"
import { BridgeNetworks, EvmConnect, GlitterBridgeSDK, GlitterEnvironment } from "@glitter-finance/sdk-core";
import { ethers } from "ethers";

describe("EvmConnect", () => {
    let glitterSdk: GlitterBridgeSDK;
    let evmConnect: EvmConnect
    let wallet: ethers.Wallet;
    const defaultEvmNetwork = BridgeNetworks.Avalanche
    const defaultToken = "USDC"

    beforeAll(() => {
        glitterSdk = new GlitterBridgeSDK();
        glitterSdk.setEnvironment(GlitterEnvironment.testnet)
        glitterSdk = glitterSdk.connect([defaultEvmNetwork]);
        evmConnect = glitterSdk.avalanche!
        wallet = evmConnect.generateWallet
        wallet = wallet.connect(evmConnect.provider)
    });

    it("Should provide ethers provider", async () => {
        const provider = evmConnect.provider
        expect(provider).toBeTruthy()
    });

    it("Should provide supported token", async () => {
        const token = evmConnect.getToken(defaultToken)

        expect(token).toBeTruthy()
        expect(token?.decimals).toBeGreaterThan(0)
        if (token?.minTransfer) {
            expect(token.minTransfer).toBeGreaterThan(0)
        }
        expect(token?.name).toBeTruthy()
        expect(token?.symbol).toBeTruthy()
        expect(token?.symbol).toEqual(defaultToken)
    });

    it("Provides address of Bridge components", async () => {
        const bridgeContractAddress = evmConnect.getAddress("bridge")
        expect(bridgeContractAddress).toBeTruthy()
        const depositAddress = evmConnect.getAddress("depositWallet")
        expect(depositAddress).toBeTruthy()
        const recipientAddress = evmConnect.getAddress("releaseWallet")
        expect(recipientAddress).toBeTruthy()
        const tokenAddress = evmConnect.getAddress("tokens", defaultToken)
        expect(tokenAddress).toBeTruthy()
        expect(() => evmConnect.getAddress("tokens", "SHIBA")).toThrowError()
    });

    it("Provides balance of a supported token", async () => {
        const balance = await evmConnect.getTokenBalanceOnNetwork(
            defaultToken,
            wallet.address
        )
        expect(balance.toString()).toEqual("0")
    });

    it("Provides allowed amount to be used for bridging", async () => {
        const balance = await evmConnect.bridgeAllowance(
            defaultToken,
            wallet
        )
        expect(balance.toString()).toEqual("0")
    });

    it("Is able to parse Deposit and transfer event", async () => {
        const depositTxHash = "0xf06ccc91a00b0d9a09ac6f144f640e65af35fb3ddff0ebf6b6005cd86a329d34"
        const events = await evmConnect.parseLogs(depositTxHash)
        const deposit = events.find(x => x.__type === "BridgeDeposit")

        expect(events.length).toEqual(2)
        expect(deposit).toBeTruthy()
    });

    it("Is able to parse Release and transfer event", async () => {
        const releaseTxHash = "0xf34b3360eb0fabd469aebba6d75413c37b365c54bef48f7be5d2d304cb78466a"
        const events = await evmConnect.parseLogs(releaseTxHash)
        const release = events.find(x => x.__type === "BridgeRelease")

        expect(events.length).toEqual(2)
        expect(release).toBeTruthy()
    });

    it.skip("is able to perform a deposit on the v2 bridge", async function () {
        const sk = process.env.TEST_ACCOUNT!
        const networks: { [key in BridgeNetworks]?: string } = {
            [BridgeNetworks.Arbitrum]: process.env.ARBITRUM_RPC_URL!,
            [BridgeNetworks.Avalanche]: process.env.AVALANCHE_RPC_URL!,
            [BridgeNetworks.Binance]: process.env.BSC_RPC_URL!,
            [BridgeNetworks.Ethereum]: process.env.ETHEREUM_RPC_URL!,
            [BridgeNetworks.Zkevm]: process.env.ZKEVM_RPC_URL!,
            [BridgeNetworks.Polygon]: process.env.POLYGON_RPC_URL!,
            [BridgeNetworks.Optimism]: process.env.OPTIMISM_RPC_URL!,
        }
        for (const [network, url] of Object.entries(networks) as [BridgeNetworks, string][]) {
            let sdk = new GlitterBridgeSDK();
            sdk.setEnvironment(GlitterEnvironment.testnet)
            sdk = sdk.connect([network]);
            evmConnect = sdk[network]
            const symbol = network == BridgeNetworks.Ethereum ? "GTT" : "xGTT"
            const provider = new ethers.providers.JsonRpcProvider(url)
            const signer = new ethers.Wallet(sk).connect(provider)
            for (const targetNetwork of Object.keys(networks) as BridgeNetworks[]) {
                if (targetNetwork == network) continue
                const { wait } = await evmConnect.bridge(
                    "0x413Ead99932e1fF7fe986234389Cfb2f26CE8acB",
                    targetNetwork,
                    symbol,
                    "99",
                    signer,
                    true
                )
                const { transactionHash } = await wait()
                console.log(`successful deposited ${symbol} from ${network} to ${targetNetwork}: ${transactionHash}`)
            }
        }
    }, 1800000) // 30 minutes timeout value, it's a long test
});
