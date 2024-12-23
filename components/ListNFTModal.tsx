import { useState, useEffect } from 'react';
import styles from '@/styles/modal.module.css';
import { getProvider, getSigner, getGameNFTContract, getMarketplaceContract } from '@/utils/ethers';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface NFTOption {
  id: string;
  name: string;
  isListed: boolean;
}

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ListNFTModal({ isOpen, onClose, onSuccess }: ListNFTModalProps) {
  const [selectedNFT, setSelectedNFT] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<NFTOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      void fetchUserNFTs();
    } else {
      setOwnedNFTs([]);
      setSelectedNFT('');
      setPrice('');
    }
  }, [isOpen]);

  const fetchUserNFTs = async () => {
    try {
      const provider = getProvider();
      const signer = await getSigner();
      const address = await signer.getAddress();

      const nftContract = await getGameNFTContract(provider);
      const marketplaceContract = await getMarketplaceContract(provider);

      if (!nftContract || !marketplaceContract) {
        toast.error('合约初始化失败');
        return;
      }

      const tokenIds = await nftContract.getUserTokens(address);

      const nftPromises = tokenIds.map(async (tokenId: bigint) => {
        try {
          const isListed = await marketplaceContract.isNFTListed(tokenId);

          if (isListed) {
            return null;
          }

          const tokenURI = await nftContract.tokenURI(tokenId);

          try {
            const base64Data = tokenURI.replace('data:application/json;base64,', '');
            const decodedData = atob(base64Data);
            const metadata = JSON.parse(decodedData);

            return {
              id: tokenId.toString(),
              name: metadata.name || `NFT #${tokenId.toString()}`,
              isListed: false
            };
          } catch (parseError) {
            return {
              id: tokenId.toString(),
              name: `NFT #${tokenId.toString()}`,
              isListed: false
            };
          }
        } catch (error) {
          return null;
        }
      });

      const nfts = await Promise.all(nftPromises);
      const availableNFTs = nfts.filter((nft): nft is NFTOption => nft !== null);
      setOwnedNFTs(availableNFTs);
    } catch (error) {
      toast.error('获取NFT失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT || !price) {
      toast.error('请填写完整信息');
      return;
    }

    setIsLoading(true);
    try {
      const signer = await getSigner();
      const nftContract = await getGameNFTContract(signer);
      const marketplaceContract = await getMarketplaceContract(signer);

      if (!nftContract || !marketplaceContract) {
        toast.error('合约初始化失败');
        return;
      }

      // 检查是否已授权
      const approvedAddress = await nftContract.getApproved(selectedNFT);
      const approvedAddressStr = typeof approvedAddress === 'string'
        ? approvedAddress.toLowerCase()
        : approvedAddress.toString().toLowerCase();
      const marketplaceAddressStr = marketplaceContract.target.toString().toLowerCase();

      if (approvedAddressStr !== marketplaceAddressStr) {
        const approveTx = await nftContract.approve(marketplaceContract.target, selectedNFT);
        const loadingToast = toast.loading('授权中...');
        await approveTx.wait();
        toast.dismiss(loadingToast);
        toast.success('授权成功！');
      }

      const priceInWei = ethers.parseUnits(price, 18);
      const listTx = await marketplaceContract.listNFT(selectedNFT, priceInWei);
      const loadingToast = toast.loading('上架中...');
      await listTx.wait();
      toast.dismiss(loadingToast);

      toast.success('上架成功！');
      await fetchUserNFTs();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('上架失败:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('用户取消交易');
      } else {
        toast.error('上架失败: ' + (error.message || '未知错误'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>List NFT</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Select NFT:</label>
            <select
              value={selectedNFT}
              onChange={(e) => setSelectedNFT(e.target.value)}
              required
            >
              <option value="">Select NFT</option>
              {ownedNFTs.map((nft) => (
                <option key={nft.id} value={nft.id}>
                  {nft.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Price (STD):</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Enter price"
            />
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'List NFT'}
          </button>
        </form>
      </div>
    </div>
  );
} 