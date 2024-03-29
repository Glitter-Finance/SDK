import { BridgeNetworks } from "../networks";
import { Token2ChainConfig, Token2Config, Token2ConfigList, } from "./types";

/**
 * Class representing the BridgeV2 tokens.
 */
export class BridgeV2Tokens {

    private static _tokenConfig : Token2ConfigList|undefined = undefined;
    public static isLoaded = false;

    /**
     * Loads the token configuration for BridgeV2.
     *
     * @static
     * @function loadConfig
     * @param {Token2ConfigList} config - The token configuration for BridgeV2.
     * @returns {void}
     */
    public static loadConfig(config: Token2ConfigList) {
        this._tokenConfig = config;
        this.isLoaded = true;
    }  

    /**
     * Retrieves the token configuration for the specified native symbol or network and local symbol.
     *
     * @static
     * @function getTokenConfig
     * @param {string} nativeSymbol - The native symbol of the token.
     * @returns {Token2Config | undefined} - The token configuration for the specified native symbol, or undefined if not found.
     * @param {BridgeNetworks} network - The network of the token.
     * @param {string} localSymbol - The local symbol of the token.
     * @returns {Token2Config | undefined} - The token configuration for the specified network and local symbol, or undefined if not found.
     * @param {string | BridgeNetworks} nativeSymbolOrNetwork - The native symbol or network of the token.
     * @param {string} localSymbolOrUndefined - The local symbol of the token, or undefined if not applicable.
     * @returns {Token2Config | undefined} - The token configuration for the specified native symbol or network and local symbol, or undefined if not found.
     */ 
    public static getTokenConfig(nativeSymbol: string): Token2Config | undefined;
    public static getTokenConfig(network: BridgeNetworks, localSymbol: string): Token2Config | undefined;
    public static getTokenConfig(nativeSymbolOrNetwork: string | BridgeNetworks, localSymbolOrUndefined?: string): Token2Config | undefined {
        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;

        //Get Token Config
        if (localSymbolOrUndefined !== undefined) {
            
            //Passed in network:
            for (const token of this._tokenConfig?.tokens ?? []) {
                for (const chain of token.chains ?? []) {
                    if (chain.chain.toLowerCase() === (nativeSymbolOrNetwork as BridgeNetworks).toString().toLowerCase() && chain.symbol.toLowerCase() == localSymbolOrUndefined.toLowerCase()) {
                        return token;
                    }
                }
            }         

        } 

        //Check if Passed in native symbol:
        const token = this._tokenConfig.tokens?.find((x) => x.asset_symbol.toLowerCase() === nativeSymbolOrNetwork.toLowerCase());
        return token;        
    
    }    

    /**
     * Retrieves the child chain token configuration for the specified token and network.
     *
     * @static
     * @function getTokenConfigChild
     * @param {Token2Config} tokenConfig - The token configuration.
     * @param {BridgeNetworks} network - The network for which to retrieve the child chain token configuration.
     * @returns {Token2ChainConfig | undefined} - The child chain token configuration for the specified token and network, or undefined if not found.
     */
    public static getTokenConfigChild(tokenConfig: Token2Config, network: BridgeNetworks): Token2ChainConfig | undefined {
            
        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;
    
        //Get the token
        const chainToken = tokenConfig.chains?.find((x) => x.chain.toLowerCase() === network.toLowerCase());
        return chainToken;
    }

    /**
     * Retrieves the token configuration for the specified local symbol of a child chain token.
     *
     * @static
     * @function getTokenConfigFromChildSymbol
     * @param {string} localSymbol - The local symbol of the child chain token.
     * @returns {Token2Config | undefined} - The token configuration for the specified local symbol, or undefined if not found.
     */
    public static getTokenConfigFromChildSymbol(localSymbol: string): Token2Config | undefined {

        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;

        for (const token of this._tokenConfig?.tokens ?? []) {
            for (const chain of token.chains ?? []) {
                if (chain.symbol?.toLowerCase() == localSymbol.toLowerCase()) {
                    return token;
                }
            }
        }

        return undefined;
    }
 
    //Get Chain Configs
    public static getChainConfig(network: BridgeNetworks, localSymbol: string): Token2ChainConfig | undefined {
        
        //Get the token
        const token = this.getTokenConfig(network, localSymbol);
        if (!token) return undefined;
       
        //get chain version
        const chainToken = token.chains?.find((x) => x.chain.toLowerCase() === network.toLowerCase());
        return chainToken;
    }
    public static getChainConfigByVault(network: BridgeNetworks, vaultAddress: string): Token2ChainConfig | undefined {
    
        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;

        for (const token of this._tokenConfig?.tokens ?? []) {
            for (const chain of token.chains ?? []) {
                if (chain.chain.toLowerCase() === network.toLowerCase() && chain.vault_address?.toLowerCase() == vaultAddress.toLowerCase()) {
                    return chain;
                }
            }
        }
      
    }
    public static getChainConfigByAddress(network: BridgeNetworks, address: string): Token2ChainConfig | undefined {
       
        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;

        for (const token of this._tokenConfig?.tokens ?? []) {
            for (const chain of token.chains ?? []) {
                if (chain.chain.toLowerCase() === network.toLowerCase() && chain.address?.toLowerCase() === address.toLowerCase()) {
                    return chain;
                }
            }
        }
    }
    public static getChainConfigByAssetID(network: BridgeNetworks, assetId: number): Token2ChainConfig | undefined {
       
        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;

        for (const token of this._tokenConfig?.tokens ?? []) {
            for (const chain of token.chains ?? []) {
                if (chain.chain.toLowerCase() === network.toLowerCase() && chain.asset_id === assetId) {
                    return chain;
                }
            }
        }
    }
    public static getChainConfigParent(chainConfig:Token2ChainConfig): Token2Config | undefined {

        //Fail safe
        if (!this._tokenConfig || !this._tokenConfig.tokens) return undefined;
       
        //Get the token where the chain config is a child
        const parentToken = this._tokenConfig.tokens?.find((x) => x.chains?.find((y) => y === chainConfig));

        return parentToken;
    }

    //Check Chain Configs
    public static areDerivatives(tokenChainConfig_A: Token2ChainConfig, tokenChainConfig_B: Token2ChainConfig): boolean {
        //get config_A parent
        const tokenConfig_A = this.getChainConfigParent(tokenChainConfig_A);
        if (!tokenConfig_A) return false;

        //get config_B parent
        const tokenConfig_B = this.getChainConfigParent(tokenChainConfig_B);
        if (!tokenConfig_B) return false;

        //Check if the parents are the same
        return (tokenConfig_A === tokenConfig_B);
    }

    //Return Full Token List
    public static getTokenList(): Token2Config[] | undefined {
        return this._tokenConfig?.tokens;
    }
   
}
