import styles from '@/styles/nft-card.module.css';

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
  if (!metadata) {
    return <div className={styles.card}>Loading...</div>;
  }

  const { name, image, attributes } = metadata;

  if (!attributes) {
    return (
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {image && <img src={image} alt={name || 'NFT'} className={styles.image} />}
        </div>
        <div className={styles.info}>
          <h3 className={styles.title}>{name || 'Unnamed NFT'}</h3>
        </div>
      </div>
    );
  }

  const highestTile = attributes.find(attr => attr.trait_type === 'Highest Tile')?.value || 'N/A';
  const timestamp = attributes.find(attr => attr.trait_type === 'Timestamp')?.value || 'N/A';

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {image && <img src={image} alt={name || 'NFT'} className={styles.image} />}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{name || 'Unnamed NFT'}</h3>
        <div className={styles.attributes}>
          <div className={styles.attribute}>
            <span className={styles.label}>Highest Score : </span>
            <span className={styles.value}>{highestTile}</span>
          </div>
          <div className={styles.attribute}>
            <span className={styles.label}></span>
            <span className={styles.value}>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 