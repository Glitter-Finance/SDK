import { BridgeNetworks } from "../lib";
import { ChainRPCConfigs } from "../types";

export const testnetAPI:ChainRPCConfigs = {
    chainAPIs: [
        {
            network: BridgeNetworks.solana,
            API_KEY:"",
            API_URL:"",
            RPC:"https://rpc.ankr.com/solana_devnet/16a70be27401891b383d43c3e3f1f453ed3daef7c55dc89f051ff1e2fd3c770c",
        },
        {
            network: BridgeNetworks.Ethereum,
            API_KEY:"KFB8N9P888F3X2JN8JFABT1A1YDBG5SSU4",
            API_URL:"https://api-goerli.etherscan.io/",
            RPC:"https://rpc.ankr.com/eth_goerli/16a70be27401891b383d43c3e3f1f453ed3daef7c55dc89f051ff1e2fd3c770c",
        },
        {
            network: BridgeNetworks.Avalanche,
            API_KEY:"FAPX56GH9C9XK5W4XIP2TM59DQJT2M7T52",
            API_URL:"https://api-testnet.snowtrace.io/",
            RPC:"https://attentive-lively-valley.avalanche-testnet.quiknode.pro/640f6c698344a27b8b315ec966593ab86fc5514c/ext/bc/C/rpc",
        },
        {
            network: BridgeNetworks.Polygon,
            API_KEY:"TY3395R9I3VJKEK5S6SAQS4BHIPAY3ZNWD",
            API_URL:"https://api-testnet.polygonscan.com/",
            RPC:"https://rpc.ankr.com/polygon_mumbai/16a70be27401891b383d43c3e3f1f453ed3daef7c55dc89f051ff1e2fd3c770c",
        },
        {
            network: BridgeNetworks.Arbitrum,
            API_KEY:"VITESYMDPTRBBE91V4X14WPQCBVM9CKZCN",
            API_URL:"https://api-goerli.arbiscan.io/",
            RPC:"https://dawn-sly-lake.arbitrum-goerli.quiknode.pro/488afb79342f8bf91acd9d98e7a6320e08111b30/",
        },
        {
            network: BridgeNetworks.Binance,
            API_KEY:"FW5PPWE5K47G7GCR4HARCF7RC5XBIRS1F8",
            API_URL:"https://api-testnet.bscscan.com/",
            RPC:"https://old-divine-lake.bsc-testnet.quiknode.pro/88530546859aad71123f340a7f0dadcc5d1544c8/",
        },
        {
            network: BridgeNetworks.Zkevm,
            API_KEY:"NMWQI2U7PGXAB4DNV4GUW51S78FP37AAJY",
            API_URL:"https://api-testnet-zkevm.polygonscan.com/",
            RPC:"https://fittest-soft-snowflake.zkevm-testnet.quiknode.pro/2fbed77506b88b6da76fc6c8bca309c4bf28ae59/",
        },
        {
            network: BridgeNetworks.Optimism,
            API_KEY:"J52F1UBFRCVCPZG6UJZU4QZ7AR5ZERFBS2",
            API_URL:"https://api-goerli-optimistic.etherscan.io/",
            RPC:"https://proud-quiet-aura.optimism-goerli.quiknode.pro/2be045c8068d8a56f0ab77e72b83bd6acfe07a59/",
        },
        {
            network: BridgeNetworks.TRON,
            API_KEY:"",
            API_URL:"",
            RPC:"https://api.shasta.trongrid.io",
        }
    ],
    CMC_API:""
}