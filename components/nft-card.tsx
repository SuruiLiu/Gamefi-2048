import styles from '@/styles/nft-card.module.css';
import { useEffect, useState } from 'react';

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

interface NFTCardProps {
  metadata: NFTMetadata;
}

export default function NFTCard({ metadata }: NFTCardProps) {
  // 直接使用传入的metadata对象
  const { name, image, attributes } = metadata;

  const highestScore = attributes.find((attr: any) => attr.trait_type === 'Highest Score')?.value || 'N/A';
  const player = attributes.find((attr: any) => attr.trait_type === 'Player')?.value || 'N/A';
  const timestamp = attributes.find((attr: any) => attr.trait_type === 'Timestamp')?.value || 'N/A';
  const rarity = attributes.find((attr: any) => attr.trait_type === 'Rarity')?.value || 'N/A';

  // 将IPFS的CID转换为可访问的URL格式
  const imageUrl = `https://ipfs.io/ipfs/${image.replace('ipfs://', '')}`;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {image && <img src={imageUrl} alt={name || 'NFT'} className={styles.image} />}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{name || 'Unnamed NFT'}</h3>
        <div className={styles.attributes}>
          <div className={styles.attribute}>
            <span className={styles.label}>Highest Score: </span>
            <span className={styles.value}>{highestScore}</span>
          </div>
          <div className={styles.attribute}>
            <span className={styles.label}>Timestamp: </span>
            <span className={styles.value}>{timestamp}</span>
          </div>
          <div className={styles.attribute}>
            <span className={styles.label}>Rarity: </span>
            <span className={styles.value}>{rarity}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 