import { useState, useEffect } from 'react';
import styles from '@/styles/profile.module.css';
import { getProvider, getGameTokenContract, getGameNFTContract, checkAndSwitchNetwork } from '@/utils/ethers';
import { ethers } from 'ethers';
import NFTCard from './nft-card';

interface NFTMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

export default function Profile() {
  const [balance, setBalance] = useState('0');
  const [address, setAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // 解析base64编码的JSON数据
  const parseTokenURI = (tokenURI: string) => {
    try {
      // 移除 "data:application/json;base64," 前缀
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      // 解码base64数据
      const jsonString = atob(base64Data);
      console.log('Decoded JSON string:', jsonString); // 调试用
      
      // 清理JSON字符串中的控制字符
      const cleanJsonString = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      
      // 解析JSON
      return JSON.parse(cleanJsonString);
    } catch (error) {
      console.error('Raw tokenURI:', tokenURI); // 调试用
      console.error('Error parsing tokenURI:', error);
      return null;
    }
  };

  // 获取余额
  const fetchBalance = async (userAddress: string) => {
    try {
      const provider = getProvider();
      const contract = await getGameTokenContract(provider);
      if (!contract) {
        console.error('Failed to create GameToken contract');
        return;
      }
      const balance = await contract.balanceOf(userAddress);
      setBalance(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // 获取用户的NFT数据
  const fetchUserNFTs = async (userAddress: string) => {
    try {
      const provider = getProvider();
      const nftContract = await getGameNFTContract(provider);
      
      if (!nftContract) {
        console.error('Failed to create GameNFT contract');
        return;
      }
      
      // 获取用户拥有的所有token ID
      const tokenIds = await nftContract.getUserTokens(userAddress);
      console.log('Token IDs:', tokenIds); // 调试用
      
      if (!tokenIds || tokenIds.length === 0) {
        setNfts([]);
        return;
      }
      
      // 获取每个NFT的元数据
      const nftMetadata = await Promise.all(
        tokenIds.map(async (tokenId: bigint) => {
          try {
            const tokenURI = await nftContract.tokenURI(tokenId);
            console.log(`TokenURI for ID ${tokenId}:`, tokenURI); // 调试用
            
            if (!tokenURI) {
              console.error(`No tokenURI for token ${tokenId}`);
              return null;
            }
            
            const metadata = parseTokenURI(tokenURI);
            if (metadata) {
              return {
                ...metadata,
                id: tokenId.toString()
              };
            }
          } catch (error) {
            console.error(`Error fetching metadata for token ${tokenId}:`, error);
          }
          return null;
        })
      );
      
      // 过滤掉null值并设置状态
      const validMetadata = nftMetadata.filter((metadata): metadata is NFTMetadata => metadata !== null);
      console.log('Valid metadata:', validMetadata); // 调试用
      setNfts(validMetadata);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setNfts([]);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = getProvider();
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            // 检查网络
            const networkSwitched = await checkAndSwitchNetwork();
            if (!networkSwitched) {
              console.error('网络切换失败');
              return;
            }

            // 初始化合约
            const tokenContract = await getGameTokenContract(provider);
            const nftContract = await getGameNFTContract(provider);
            
            if (!tokenContract || !nftContract) {
              console.error('合约初始化失败');
              return;
            }

            setAddress(accounts[0]);
            setIsConnected(true);
            setShowOverlay(false);
            setIsLoading(true);
            
            // 获取代币余额
            await fetchBalance(accounts[0]);
            // 获取NFT数据
            await fetchUserNFTs(accounts[0]);
            setIsLoading(false);
          } else {
            setIsConnected(false);
            setAddress('');
            setBalance('0');
            setNfts([]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setIsLoading(false);
        }
      }
    };

    checkWalletConnection();

    // 监听钱包连接状态变化
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        // 检查网络
        const networkSwitched = await checkAndSwitchNetwork();
        if (!networkSwitched) {
          console.error('网络切换失败');
          return;
        }

        // 初始化合约
        const provider = getProvider();
        const tokenContract = await getGameTokenContract(provider);
        const nftContract = await getGameNFTContract(provider);
        
        if (!tokenContract || !nftContract) {
          console.error('合约初始化失败');
          return;
        }

        setAddress(accounts[0]);
        setIsConnected(true);
        setShowOverlay(false);
        setIsLoading(true);
        await fetchBalance(accounts[0]);
        await fetchUserNFTs(accounts[0]);
        setIsLoading(false);
      } else {
        setAddress('');
        setIsConnected(false);
        setShowOverlay(true);
        setBalance('0');
        setNfts([]);
      }
    };

    // 监听余额变化
    const handleBalanceChange = async () => {
      if (isConnected && address) {
        await fetchBalance(address);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleBalanceChange);
      window.ethereum.on('message', handleBalanceChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleBalanceChange);
        window.ethereum.removeListener('message', handleBalanceChange);
      }
    };
  }, [address, isConnected]);

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Address:</span>
          <span className={styles.value}>
            {isConnected ? address : 'Not Connected'}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Token:</span>
          <span className={styles.value}>
            {isConnected ? `${balance} STD` : '0 STD'}
          </span>
        </div>
      </div>

      {!isConnected && showOverlay && (
        <div className={styles.overlay} onClick={() => setShowOverlay(false)}>
          <div className={styles.connectMessage}>
            请先连接钱包
          </div>
        </div>
      )}

      <div className={styles.nftSection}>
        <h2>My NFTs</h2>
        {isLoading ? (
          <div className={styles.loading}>Loading NFTs...</div>
        ) : (
          <div className={styles.grid}>
            {nfts.map(nft => (
              <NFTCard
                key={nft.id}
                metadata={nft}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 