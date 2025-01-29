import { useState, useContext } from 'react';
import styles from "@/styles/splash.module.css";
import { toast } from 'react-hot-toast';
import { getProvider, getSigner, getGameNFTContract, getGameTokenContract, checkAndSwitchNetwork } from '../utils/ethers';
import { GameContext } from "@/context/game-context";

interface SplashProps {
  heading: string;
  type: "ended" | "lost";
  maxScore?: number;
  gameEndTime?: string;
  onTabChange?: (tab: 'game' | 'marketplace' | 'profile') => void;
  onReplay?: () => void;
}

export default function Splash({ heading, type, maxScore, gameEndTime, onTabChange, onReplay }: SplashProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { startGame } = useContext(GameContext);

  const handleMintNFT = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask first');
      return;
    }

    try {
      const provider = getProvider();
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length === 0) {
        toast.error('Please connect your wallet first');
        return;
      }

      setIsLoading(true);
      
      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) {
        toast.error('Switch to the correct network');
        return;
      }

      const signer = await getSigner();
      const nftContract = await getGameNFTContract(signer);
      const tokenContract = await getGameTokenContract(signer);

      if (!nftContract || !tokenContract) {
        toast.error('Contract initialization failed');
        return;
      }
      
      // 获取NFT价格
      const mintPrice = await nftContract.mintPrice();
      
      // 授权GameToken
      const approveTx = await tokenContract.approve(
        nftContract.target,  // NFT合约地址
        mintPrice  // 授权金额
      );
      
      const approveToast = toast.loading('Approving GameToken...');
      await approveTx.wait();
      console.log('Approve success！')
      toast.dismiss(approveToast);
      toast.success('Approve success！');

      const score = BigInt(maxScore || 0);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      console.log(score,timestamp);
      
      const tx = await nftContract.mint(
        score,  // 游戏得分
        timestamp,    // 时间戳
      );

      const mintingToast = toast.loading('Minting NFT...');
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      toast.dismiss(mintingToast);
      toast.success('NFT Minted Successfully!');
      
      // 铸造成功后切换到Profile页面
      if (onTabChange) {
        onTabChange('profile');
      }

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('User cancelling transaction');
      } else {
        toast.error('Mint fail: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splash}>
      <div className={styles.content}>
        <h2>{type === "lost" ? "Game Over!" : "Game end!"}</h2>
        {type === "ended" && (
          <>
            <p className={styles.score}>Game score: {maxScore}</p>
            <p className={styles.time}>End Game: {gameEndTime}</p>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.mintButton}
                onClick={handleMintNFT}
                disabled={isLoading}
              >
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </button>
              <button 
                className={styles.replayButton}
                onClick={onReplay || startGame}
              >
                Replay
              </button>
            </div>
          </>
        )}
        {type === "lost" && <p>{heading}</p>}
      </div>
    </div>
  );
}
