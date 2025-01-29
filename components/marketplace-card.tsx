import { useState } from 'react';
import styles from '@/styles/marketplace-card.module.css';
import { ethers } from 'ethers';
import { getMarketplaceContract, getSigner, getGameTokenContract } from '@/utils/ethers';
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

interface MarketplaceCardProps {
  metadata: NFTMetadata;
  price: string;
  seller: string;
  type?: 'buy' | 'withdraw';
  onSuccess?: () => void;
}

export default function MarketplaceCard({ metadata, price, seller, type = 'buy', onSuccess }: MarketplaceCardProps) {
  if (!metadata || !price || !seller) {
    return null;
  }

  // 从attributes中获取特定属性
  const getAttribute = (traitType: string) => {
    if (!metadata.attributes) {
      return '';
    }
    const attr = metadata.attributes.find(a => a.trait_type === traitType);
    return attr ? attr.value : '';
  };

  // 格式化价格显示
  const formatPrice = (price: string) => {
    try {
      return ethers.formatUnits(price, 18);
    } catch {
      return '0';
    }
  };

  // 处理购买NFT
  const handleBuy = async () => {
    if (!metadata.id) {
      toast.error('Invalid NFT ID');
      return;
    }

    try {
      const signer = await getSigner();
      const marketplaceContract = await getMarketplaceContract(signer);
      const tokenContract = await getGameTokenContract(signer);
      
      if (!marketplaceContract || !tokenContract) {
        toast.error('Contract initialization failed');
        return;
      }

      // 检查代币授权
      const currentAllowance = await tokenContract.allowance(
        await signer.getAddress(),
        marketplaceContract.target
      );
      
      if (currentAllowance < BigInt(price)) {
        // 如果授权额度不足，先进行授权
        const approveTx = await tokenContract.approve(marketplaceContract.target, price);
        const approveToast = toast.loading('Approving...');
        await approveTx.wait();
        toast.dismiss(approveToast);
        toast.success('Approve success！');
      }

      // 购买NFT
      const buyTx = await marketplaceContract.buyNFT(metadata.id);
      const loadingToast = toast.loading('Purchasing...');
      await buyTx.wait();
      toast.dismiss(loadingToast);
      toast.success('Purchase success！');
      
      onSuccess?.();
    } catch (error: any) {
      console.error('购买失败:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelling transaction');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Not sufficient Token');
      } else {
        toast.error('Purchase failure: ' + (error.message || 'Undefined error'));
      }
    }
  };

  // 处理撤回NFT
  const handleWithdraw = async () => {
    if (!metadata.id) {
      toast.error('Invalid NFT ID');
      return;
    }

    try {
      const signer = await getSigner();
      const marketplaceContract = await getMarketplaceContract(signer);
      
      if (!marketplaceContract) {
        toast.error('Contract initialization failed');
        return;
      }

      const unlistTx = await marketplaceContract.unlistNFT(metadata.id);
      const loadingToast = toast.loading('Being withdrawn...');
      await unlistTx.wait();
      toast.dismiss(loadingToast);
      toast.success('Successful withdrawal!');
      
      onSuccess?.();
    } catch (error: any) {
      console.error('撤回失败:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelling transaction');
      } else {
        toast.error('Failure to withdraw: ' + (error.message || 'Undefined error'));
      }
    }
  };
  const { name, image, attributes } = metadata;

  const imageUrl = `https://ipfs.io/ipfs/${image.replace('ipfs://', '')}`;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {image && <img src={imageUrl} alt={name || 'NFT'} className={styles.image} />}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{metadata.name || 'Unnamed NFT'}</h3>
        <div className={styles.details}>
          <div className={styles.price}>
            <span>{formatPrice(price)} STD</span>
          </div>
          <div className={styles.seller}>
            Seller: {seller.slice(0, 6)}...{seller.slice(-4)}
          </div>
        </div>
        {type === 'buy' ? (
          <button
            className={styles.buyButton}
            onClick={handleBuy}
          >
            Buy Now
          </button>
        ) : (
          <button
            className={`${styles.buyButton} ${styles.withdrawButton}`}
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
} 