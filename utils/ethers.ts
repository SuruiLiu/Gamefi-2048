import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts-abi/config';
import { GAME_TOKEN_ABI } from '../contracts-abi/abis/GameToken';
import { GAME_NFT_ABI } from '../contracts-abi/abis/GameNFT';
import { MARKETPLACE_ABI } from '../contracts-abi/abis/Marketplace';

// Sepolia 网络 ID
export const SEPOLIA_CHAIN_ID = 11155111;

// 检查钱包是否已连接
export const isWalletConnected = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

// 获取provider
export const getProvider = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Please install MetaMask!');
  }
  return new BrowserProvider(window.ethereum);
};

// 获取signer
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// 获取GameToken合约实例
export const getGameTokenContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.GAME_TOKEN) {
      throw new Error('GameToken contract address is not configured');
    }
    return new Contract(
      CONTRACT_ADDRESSES.GAME_TOKEN,
      GAME_TOKEN_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating GameToken contract:', error);
    return null;
  }
};

// 获取GameNFT合约实例
export const getGameNFTContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.GAME_NFT) {
      throw new Error('GameNFT contract address is not configured');
    }
    console.log('Creating GameNFT contract with address:', CONTRACT_ADDRESSES.GAME_NFT);
    return new Contract(
      CONTRACT_ADDRESSES.GAME_NFT,
      GAME_NFT_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating GameNFT contract:', error);
    return null;
  }
};

// 获取Marketplace合约实例
export const getMarketplaceContract = async (providerOrSigner: any) => {
  try {
    if (!CONTRACT_ADDRESSES.MARKETPLACE) {
      throw new Error('Marketplace contract address is not configured');
    }
    return new Contract(
      CONTRACT_ADDRESSES.MARKETPLACE,
      MARKETPLACE_ABI,
      providerOrSigner
    );
  } catch (error) {
    console.error('Error creating Marketplace contract:', error);
    return null;
  }
};

// 检查并切换网络
export const checkAndSwitchNetwork = async () => {
  try {
    if (!window.ethereum) return false;

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId) !== SEPOLIA_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                  chainName: 'Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error('Error adding network:', addError);
            return false;
          }
        }
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// 检查连接状态
export const checkConnection = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.send('eth_accounts', []);
    return accounts.length > 0;
  } catch {
    return false;
  }
};

// 断开连接
export const disconnect = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // 清除本地存储的连接状态
      localStorage.removeItem('walletConnected');

      // 如果使用的是 MetaMask，直接清除连接状态
      if (window.ethereum.isMetaMask) {
        // 不再调用任何会触发连接请求的方法
        // MetaMask 实际上没有提供真正的 "断开连接" API
        // 我们只需要在应用层面清除状态即可
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }
}; 