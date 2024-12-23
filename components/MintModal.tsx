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
        toast.error('合约初始化失败');
        return;
      }

      // 获取当前时间戳
      const timestamp = Math.floor(Date.now() / 1000);
      const highestTile = 2048; // 示例值

      const tx = await contract.mint(highestTile, timestamp);
      const loadingToast = toast.loading('铸造中...');
      await tx.wait();
      toast.dismiss(loadingToast);
      
      toast.success('NFT 铸造成功！');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('用户取消交易');
      } else {
        toast.error('铸造失败: ' + (error.message || '未知错误'));
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
          <h2>铸造 NFT</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          <p>
            确认要铸造 NFT 吗？这将消耗你的游戏代币。
          </p>
          <div className={styles.buttonContainer}>
            <button
              onClick={handleMint}
              disabled={isLoading}
              className={styles.mintButton}
            >
              {isLoading ? '铸造中...' : '确认铸造'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 