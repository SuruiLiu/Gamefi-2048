import { useEffect, useState } from 'react';
import styles from '@/styles/marketplace.module.css';
import MarketplaceCard from './marketplace-card';
import ListNFTModal from './ListNFTModal';
import { getProvider, getGameNFTContract, getMarketplaceContract } from '../utils/ethers';
import toast from 'react-hot-toast';

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

interface ListedNFT {
  metadata: NFTMetadata;
  price: string;
  seller: string;
}

type ListingType = 'selling' | 'my-listings';

export default function Marketplace() {
  const [listedNFTs, setListedNFTs] = useState<ListedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeListingType, setActiveListingType] = useState<ListingType>('selling');
  const [searchRarity, setSearchRarity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  // 监听showModal状态变化
  useEffect(() => {
    console.log('Marketplace - showModal状态变化:', showModal);
  }, [showModal]);

  // 获取当前用户地址
  useEffect(() => {
    const updateAddress = async () => {
      try {
        const provider = getProvider();
        const accounts = await provider.send('eth_accounts', []);
        setCurrentAddress(accounts[0] || null);
      } catch (error) {
        console.error('Error getting address:', error);
        setCurrentAddress(null);
      }
    };

    updateAddress();
    // 监听账户变化
    window.ethereum?.on('accountsChanged', updateAddress);

    return () => {
      window.ethereum?.removeListener('accountsChanged', updateAddress);
    };
  }, []);

  // 解析base64编码的JSON数据
  const parseTokenURI = (tokenURI: string) => {
    try {
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      const jsonString = atob(base64Data);
      const cleanJsonString = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      return JSON.parse(cleanJsonString);
    } catch (error) {
      console.error('Error parsing tokenURI:', error);
      return null;
    }
  };

  // 获取所有上架的NFT
  const fetchListedNFTs = async () => {
    try {
      const provider = getProvider();
      const marketplaceContract = await getMarketplaceContract(provider);
      const nftContract = await getGameNFTContract(provider);
      
      if (!marketplaceContract || !nftContract) {
        console.error('Failed to create contracts');
        setListedNFTs([]);
        return;
      }

      // 获取所有上架的NFT
      const [tokenIds, sellers, prices] = await marketplaceContract.getAllListedNFTs();
      
      if (!tokenIds || !sellers || !prices || tokenIds.length === 0) {
        setListedNFTs([]);
        return;
      }
      
      // 获取每个NFT的元数据
      const nftPromises = tokenIds.map(async (tokenId: bigint, index: number) => {
        try {
          const tokenURI = await nftContract.tokenURI(tokenId);
          if (!tokenURI) {
            console.error(`No tokenURI for token ${tokenId}`);
            return null;
          }
          
          const metadata = parseTokenURI(tokenURI);
          if (metadata && typeof metadata === 'object') {
            return {
              metadata: {
                ...metadata,
                id: tokenId.toString()
              },
              price: prices[index].toString(),
              seller: sellers[index]
            };
          }
        } catch (error) {
          console.error(`Error fetching metadata for token ${tokenId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(nftPromises);
      const validNFTs = results.filter((nft): nft is ListedNFT => 
        nft !== null && 
        nft.metadata && 
        typeof nft.metadata.id === 'string' && 
        typeof nft.metadata.name === 'string' && 
        typeof nft.metadata.image === 'string' && 
        Array.isArray(nft.metadata.attributes) &&
        typeof nft.price === 'string' &&
        typeof nft.seller === 'string'
      );
      setListedNFTs(validNFTs);
    } catch (error) {
      console.error('Error fetching listed NFTs:', error);
      toast.error('获取NFT列表失败');
      setListedNFTs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListedNFTs();
  }, []);

  // 过滤NFT列表
  const filteredNFTs = listedNFTs.filter(nft => {
    // 首先按照稀有度过滤
    if (searchRarity) {
      const rarityAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Rarity');
      if (!rarityAttr?.value.toString().toLowerCase().includes(searchRarity.toLowerCase())) {
        return false;
      }
    }

    // 然后按照列表类型过滤
    if (activeListingType === 'my-listings') {
      return nft.seller.toLowerCase() === currentAddress?.toLowerCase();
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <button
          className={`${styles.listingButton} ${activeListingType === 'selling' ? styles.active : ''}`}
          onClick={() => setActiveListingType('selling')}
        >
          正在售卖
        </button>
        <button
          className={`${styles.listingButton} ${activeListingType === 'my-listings' ? styles.active : ''}`}
          onClick={() => setActiveListingType('my-listings')}
        >
          我的售卖
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search by rarity..."
              value={searchRarity}
              onChange={(e) => setSearchRarity(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            className={styles.addButton}
            onClick={() => {
              if (!currentAddress) {
                toast.error('请先连接钱包');
                return;
              }
              setShowModal(true);
            }}
          >
            <span>+</span>
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading NFTs...</div>
        ) : (
          <div className={styles.grid}>
            {filteredNFTs.map(nft => (
              <MarketplaceCard
                key={nft.metadata.id}
                metadata={nft.metadata}
                price={nft.price}
                seller={nft.seller}
                type={activeListingType === 'my-listings' ? 'withdraw' : 'buy'}
                onSuccess={() => {
                  console.log('Marketplace - NFT操作成功，刷新列表');
                  fetchListedNFTs();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ListNFTModal 
        isOpen={showModal}
        onClose={() => {
          console.log('Marketplace - 关闭模态框');
          setShowModal(false);
        }}
        onSuccess={() => {
          console.log('Marketplace - 上架成功，刷新列表');
          fetchListedNFTs();
        }}
      />
    </div>
  );
} 