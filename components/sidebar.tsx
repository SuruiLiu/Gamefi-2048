import { useState, useEffect } from 'react';
import styles from '@/styles/sidebar.module.css';
import { getSigner, getGameTokenContract } from '@/utils/ethers';
import AdminMintModal from './AdminMintModal';
import toast from 'react-hot-toast';

// 为 window.ethereum 添加类型声明
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

interface SidebarProps {
  currentTab: 'game' | 'marketplace' | 'profile';
  onTabChange: (tab: 'game' | 'marketplace' | 'profile') => void;
}

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const [address, setAddress] = useState<string>('');
  const [canClaim, setCanClaim] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [balance, setBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      void checkConnection();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (address) {
      void checkIsOwner();
      void updateBalance();
      void checkCanClaim();
    }
  }, [address]);

  const checkConnection = async () => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask is not installed');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error('检查连接状态失败:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAddress(accounts[0]);
    } else {
      setAddress('');
      setBalance('0');
      setCanClaim(false);
      setIsOwner(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAddress(accounts[0]);
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Please connect your wallet to continue');
      } else {
        toast.error('Wallet connection failure');
      }
    }
  };

  const checkIsOwner = async () => {
    try {
      const signer = await getSigner();
      const contract = await getGameTokenContract(signer);
      if (!contract) return;

      const ownerAddress = await contract.owner();
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error('检查所有者状态失败:', error);
    }
  };

  const checkCanClaim = async () => {
    try {
      const signer = await getSigner();
      const contract = await getGameTokenContract(signer);
      if (!contract) return;

      const hasClaimedToday = await contract.hasClaimedToday(address);
      if (hasClaimedToday) {
        setCanClaim(false);
      }
    } catch (error) {
      console.error('检查空投状态失败:', error);
    }
  };

  const handleClaim = async () => {
    if (!canClaim) return;
    setIsLoading(true);
    try {
      const signer = await getSigner();
      const contract = await getGameTokenContract(signer);
      if (!contract) {
        toast.error('Contract initialization failed');
        return;
      }

      const tx = await contract.checkAndAirdrop(address);
      const loadingToast = toast.loading('Claiming...');
      await tx.wait();
      toast.dismiss(loadingToast);

      toast.success('Claim success!');
      setCanClaim(false);
      void updateBalance();
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelling transaction');
      } else {
        toast.error('Claim failure: ' + (error.message || 'Undefined error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async () => {
    try {
      const signer = await getSigner();
      const contract = await getGameTokenContract(signer);
      if (!contract) return;

      const balanceWei = await contract.balanceOf(address);
      setBalance(balanceWei.toString());
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabsContainer}>
        <div
          className={`${styles.tab} ${currentTab === 'game' ? styles.active : ''}`}
          onClick={() => onTabChange('game')}
        >
          Game
        </div>
        <div
          className={`${styles.tab} ${currentTab === 'marketplace' ? styles.active : ''}`}
          onClick={() => onTabChange('marketplace')}
        >
          Marketplace
        </div>
        <div
          className={`${styles.tab} ${currentTab === 'profile' ? styles.active : ''}`}
          onClick={() => onTabChange('profile')}
        >
          My
        </div>
      </div>

      <div className={styles.walletContainer}>
        {address ? (
          <>
            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={isLoading}
                className={styles.airdropButton}
              >
                {isLoading ? 'Claiming...' : 'GetAirdrop'}
              </button>
            )}
            {/* {isOwner && (
              <button
                onClick={() => setIsMintModalOpen(true)}
                className={styles.airdropButton}
              >
                Mint
              </button>
            )} */}
            <button className={styles.connectButton}>
              <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
            </button>
          </>
        ) : (
          <button onClick={connectWallet} className={styles.connectButton}>
            Connect Wallet
          </button>
        )}
      </div>

      <AdminMintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        onSuccess={() => {
          void updateBalance();
        }}
      />
    </div>
  );
} 