import { useState } from 'react';
import styles from '@/styles/modal.module.css';
import { getGameTokenContract, getSigner } from '@/utils/ethers';
import toast from 'react-hot-toast';

interface AdminMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminMintModal({ isOpen, onClose, onSuccess }: AdminMintModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleMint = async () => {
    if (!address || !amount) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      setIsLoading(true);
      const signer = await getSigner();
      const contract = await getGameTokenContract(signer);
      
      if (!contract) {
        toast.error('合约初始化失败');
        return;
      }

      const tx = await contract.airdropToUser(address, amount);
      const loadingToast = toast.loading('发放中...');
      await tx.wait();
      toast.dismiss(loadingToast);
      
      toast.success('代币发放成功！');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error minting token:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('用户取消交易');
      } else {
        toast.error('发放失败: ' + (error.message || '未知错误'));
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
          <h2>发放代币</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>接收地址:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入钱包地址"
            />
          </div>
          <div className={styles.formGroup}>
            <label>代币数量:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入代币数量"
              min="0"
            />
          </div>
          <div className={styles.buttonContainer}>
            <button
              onClick={handleMint}
              disabled={isLoading}
              className={styles.mintButton}
            >
              {isLoading ? '发放中...' : '确认发放'}
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