import { GlitterBridgeConfig, GlitterEnvironment } from "../types";
import { BridgeNetworks } from "../lib/common";

export const config: GlitterBridgeConfig = {
    name: GlitterEnvironment.testnet,
    algorand: {
        serverUrl: "https://testnet-api.algonode.cloud",
        indexerUrl: "https://testnet-idx.algonode.cloud",
        indexerPort: "",
        nativeTokenSymbol: "ALGO",
        bridgeProgramId: 98624397,
        bridgeAccounts: {
            asaOwner: "A3OSGEZJVBXWNXHZREDBB5Y77HSUKA2VS7Y3BWHWRBDOWZ5N4CWXPVOHZE",
            algoOwner: "5TFPIJ5AJLFL5IBOO2H7QXYLDNJNSQYTZJOKISGLT67JF6OYZS42TRHRJ4",
            bridgeOwner: "HUPQIOAF3JZWHW553PGBKWXYSODFYUG5MF6V246TIBW66WVGOAEB7R6XAE",
            feeReceiver: "A2GPNMIWXZDD3O3MP5UFQL6TKAZPBJEDZYHMFFITIAJZXLQH37SJZUWSZQ",
            multiSig1: "JPDV3CKFABIXDVH36E7ZBVJ2NC2EQJIBEHCKYTWVC4RDDOHHOPSBWH3QFY",
            multiSig2: "DFFTYAB6MWMRTZGHL2GAP7TMK7OUGHDD2AACSO7LXSZ7SY2VLO3OEOJBQU",
            usdcReceiver: "JJWJKLUIMX3THW3CT6ZQMBRPBQ34MUFNS7PFV4YU7CCLS2KPUBOS7XFJDY",
            usdcDeposit: "BPINJM3HKNDA2XU3FUARSRTXDZXYSK5AQXITGDED4T6RRLQPZX7SRRKXHI",
            bridge: "XJQ25THCV734QIUZARPZGG3NPRFZXTIIU77JSJBT23TJMGL3FXJWVR57OQ",
            asaVault: "U4A3YARBVMT7PORTC3OWXNC75BMGF6TCHFOQY4ZSIIECC5RW25SVKNKV3U",
            algoVault: "R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ",
            tokenBridgeProgramID: "98624397",
            tokenBridgeV2ProgramID: "205483806",
        },
        assets: [
            {
                symbol: "ALGO",
                wrappedSymbol: "xALGO",
                decimals: 6,
                minTransfer: 5,
                feeDivisor: 200,
                name: "Algorand Coin",
                isNative: true,
            },
            {
                symbol: "USDC",
                assetId: 10458941,
                decimals: 6,
                minTransfer: 5,
                feeDivisor: 200,
                name: "USD Coin",
            },
            {
                symbol: "xSOL",
                wrappedSymbol: "SOL",
                assetId: 97628726,
                decimals: 9,
                minTransfer: 0.05,
                feeDivisor: 200,
                name: "Wrapped SOL",
            },
        ],
    },
    solana: {
        name: "Solana",
        server: "https://api.testnet.solana.com",
        accounts: {
            bridgeProgram: "GLittnj1E7PtSF5thj6nYgjtMvobyBuZZMuoemXpnv3G",
            vestingProgram: "EMkD74T2spV3A71qfY5PNqVNrNrpbFcdwMF2TerRMr9n",
            owner: "hY5PXHYm58H5KtJW4GrtegxXnpMruoX3LLP6CufHoHj",
            usdcReceiver: "Av47VxT8GpGXHYc3aG7fKddgZjCuZEb5yF3BCaXyE7wu",
            usdcReceiverTokenAccount: "HrrpuLCq2ewozVZU5sFrWL6oRvFe8KH1VMhVQLCcWpdy",
            usdcDeposit: "8Cb6eKCiowqsfYoLeaQf9voTHv1nV6rKjBvMQwLEGoDJ",
            usdcDepositTokenAccount: "CWmY521qXB29Hwp3WBzyX1huApRdQu4kjrcxZpa2St7d",
            memoProgram: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
            solVault: "",
            tokenBridgeV2Address: "HnoxGTCXd8Mvc9ucCXWWkCpibAcgSSYaVWuNVNbQc9hH",
        },
        tokens: [
            {
                symbol: "SOL",
                address: "11111111111111111111111111111111",
                decimals: 9,
                minTransfer: 0.05,
                feeDivisor: 200,
                name: "Solana",
            },
            {
                symbol: "xALGO",
                address: "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms",
                decimals: 6,
                minTransfer: 5,
                feeDivisor: 200,
                name: "Wrapped ALGO",
            },
            {
                symbol: "USDC",
                address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                decimals: 6,
                minTransfer: 1,
                feeDivisor: 200,
                name: "USD Coin",
            },
        ],
    },
    evm: {
        [BridgeNetworks.Avalanche]: {
            bridge: "0x07c48413bEA695Ef37a75Be8A09ec84A4c8a6bc1",
            rpcUrl: "https://rpc.ankr.com/avalanche_fuji",
            tokens: [
                {
                    address: "0x5425890298aed601595a70AB815c96711a31Bc65",
                    symbol: "USDC",
                    decimals: 6,
                    name: "USD Coin",
                    minTransfer: 3
                },
            ],
            depositWallet: "0x2f34c32e1380306bc3f359d836d6c937cbe90337",
            releaseWallet: "0x6D57268BE8EBa2dF18f07267cfF4e114933da429",
            tokenBridge: "0xb36a5accccac48e3ae3207ece4d1cdfd693dd77f",
            chainId: 43113,
            circleTreasury: "",
        },
        [BridgeNetworks.Ethereum]: {
            bridge: "0xc918b9719A0e04Df45842eec88FC84480266b568",
            rpcUrl: "https://rpc.ankr.com/eth_goerli",
            tokens: [
                {
                    address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
                    symbol: "USDC",
                    decimals: 6,
                    name: "USD Coin",
                    minTransfer: 10
                },
            ],
            depositWallet: "0x6f5990a1b679190bcd0670f5006f14621f88805d",
            releaseWallet: "0x7c10Ee260F6d408aC0c9f297A16808ca407e469E",
            tokenBridge: "0x821a8cdf89ba4040453d92c5f664ef54dd9c422c",
            chainId: 5,
            circleTreasury: "",
        },
        [BridgeNetworks.Polygon]: {
            bridge: "0xA870B28c23F2358971dC1FF93bC2a2Ec908A6D33",
            rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
            tokens: [
                {
                    address: "0x0fa8781a83e46826621b3bc094ea2a0212e71b23",
                    symbol: "USDC",
                    decimals: 6,
                    name: "USD Coin",
                    minTransfer: 1
                },
            ],
            depositWallet: "0x8eb550b1958e716c4051469425d56e79282afa2f",
            releaseWallet: "0xEAFA843b04A5847ec463358FC499347435354D3D",
            tokenBridge: "0x56a1a68bf2d65673a121765a7884420b9568cac3",
            chainId: 80001,
            circleTreasury: "",
        },
        [BridgeNetworks.Arbitrum]: {
            bridge: "",
            rpcUrl: "",
            tokens: [],
            depositWallet: "",
            releaseWallet: "",
            tokenBridge: "0x56a1a68bf2d65673a121765a7884420b9568cac3",
            chainId: 421613,
            circleTreasury: "",
        },
        [BridgeNetworks.Binance]: {
            bridge: "",
            rpcUrl: "",
            tokens: [],
            depositWallet: "",
            releaseWallet: "",
            tokenBridge: "0x1893448b44fc9fa253afbb5566a656d8c8c36ed7",
            chainId: 97,
            circleTreasury: "",
        },
        [BridgeNetworks.Zkevm]: {
            bridge: "",
            rpcUrl: "",
            tokens: [],
            depositWallet: "",
            releaseWallet: "",
            tokenBridge: "0xf83a807849965419c5c9e36b12d5a5da03c34307",
            chainId: 1442,
            circleTreasury: "",
        },
        [BridgeNetworks.Optimism]: {
            bridge: "",
            rpcUrl: "",
            tokens: [],
            depositWallet: "",
            releaseWallet: "",
            tokenBridge: "0x35134b6a44cebc82bb47a79edf2ad5d5d5ce1205",
            chainId: 10,
            circleTreasury: "",
        }
    },
    tron: {
        tokens: [
            {
                address: "TFGBSrddCjLJAwuryZ9DUxtEmKv13BPjnh",
                name: "USD Coin",
                symbol: "USDC",
                decimals: 6,
                minTransfer: 1
            },
        ],
        fullNode: "https://api.shasta.trongrid.io",
        solidityNode: "https://api.shasta.trongrid.io",
        eventServer: "https://api.shasta.trongrid.io",
        addresses: {
            bridge: "TG5L1sypor6QsvEWdF5zVQR48Fd4B73P3E",
            depositWallet: "TXpEeQDe6UenfjkhG9Y3HPMjuXQGukpJq8",
            releaseWallet: "TEWifyy5yrm7zWbWBs5RVbLyZm4JPiawpf",
        },
    },
    confirmationsV2: {
        [BridgeNetworks.Arbitrum]: 300,
        [BridgeNetworks.Avalanche]: 1,
        [BridgeNetworks.Ethereum]: 12,
        [BridgeNetworks.Polygon]: 372,
        [BridgeNetworks.Binance]: 15,
        [BridgeNetworks.Zkevm]: 80,
        [BridgeNetworks.Optimism]: 80,

        //Not Supported
        [BridgeNetworks.algorand]: 0,
        [BridgeNetworks.solana]: 0,
        [BridgeNetworks.TRON]: 0,
    },
    confirmationsCircle: {
        [BridgeNetworks.algorand]: 1,
        [BridgeNetworks.solana]: 1,
        [BridgeNetworks.Avalanche]: 1,
        [BridgeNetworks.Ethereum]: 12,
        [BridgeNetworks.Polygon]: 372,
        [BridgeNetworks.TRON]: 19,

        //Not Supported
        [BridgeNetworks.Binance]: 0,
        [BridgeNetworks.Arbitrum]: 0,
        [BridgeNetworks.Optimism]: 0,
        [BridgeNetworks.Zkevm]: 0,
    },
    gasTokens: {
        [BridgeNetworks.algorand]: "ALGO",
        [BridgeNetworks.solana]: "SOL",
        [BridgeNetworks.Arbitrum]: "ETH",
        [BridgeNetworks.Avalanche]: "AVAX",
        [BridgeNetworks.Ethereum]: "ETH",
        [BridgeNetworks.Polygon]: "MATIC",
        [BridgeNetworks.Binance]: "BNB",
        [BridgeNetworks.Zkevm]: "ETH",
        [BridgeNetworks.Optimism]: "ETH",
        [BridgeNetworks.TRON]: "TRX",
    }
};
