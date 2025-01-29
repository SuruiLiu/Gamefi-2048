import { useState } from 'react';
import styles from '@/styles/mint-modal.module.css';
import { getGameNFTContract, getSigner } from '@/utils/ethers';
import toast from 'react-hot-toast';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MintModal({ isOpen, onClose, onSuccess }: MintModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    try {
      setIsLoading(true);
      const signer = await getSigner();
      const contract = await getGameNFTContract(signer);
      
      if (!contract) {
        toast.error('Contract initialization failed');
        return;
      }

      // 获取当前时间戳
      const timestamp = Math.floor(Date.now() / 1000);
      const highestTile = 2048; // 示例值

      const tx = await contract.mint(highestTile, timestamp);
      const loadingToast = toast.loading('Minting...');
      await tx.wait();
      toast.dismiss(loadingToast);
      
      toast.success('NFT mint success！');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelling transaction');
      } else {
        toast.error('Mint fail: ' + (error.message || 'Undefined error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Mint NFT</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          <p>
          Are you sure to Mint NFT? This will cost your game tokens。
          </p>
          <div className={styles.buttonContainer}>
            <button
              onClick={handleMint}
              disabled={isLoading}
              className={styles.mintButton}
            >
              {isLoading ? 'Minting...' : 'Confirmed minting'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 