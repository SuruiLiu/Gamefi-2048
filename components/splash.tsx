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
}

export default function Splash({ heading, type, maxScore, gameEndTime, onTabChange }: SplashProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { startGame } = useContext(GameContext);

  const handleMintNFT = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('请先安装 MetaMask');
      return;
    }

    try {
      const provider = getProvider();
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length === 0) {
        toast.error('请先连接钱包');
        return;
      }

      setIsLoading(true);
      
      const networkSwitched = await checkAndSwitchNetwork();
      if (!networkSwitched) {
        toast.error('请切换到正确的网络');
        return;
      }

      const signer = await getSigner();
      const nftContract = await getGameNFTContract(signer);
      const tokenContract = await getGameTokenContract(signer);

      if (!nftContract || !tokenContract) {
        toast.error('合约初始化失败');
        return;
      }
      
      // 获取NFT价格
      const mintPrice = await nftContract.mintPrice();
      
      // 授权GameToken
      const approveTx = await tokenContract.approve(
        nftContract.target,  // NFT合约地址
        mintPrice  // 授权金额
      );
      
      const approveToast = toast.loading('正在授权 GameToken...');
      await approveTx.wait();
      toast.dismiss(approveToast);
      toast.success('授权成功！');

      const score = Number(maxScore) || 0;
      const timestamp = gameEndTime || new Date().toLocaleString();
      
      const tx = await nftContract.mint(
        score,  // 游戏得分
        timestamp    // 时间戳
      );

      const mintingToast = toast.loading('Minting NFT...');
      await tx.wait();
      toast.dismiss(mintingToast);
      toast.success('NFT Minted Successfully!');
      
      // 铸造成功后切换到Profile页面
      if (onTabChange) {
        onTabChange('profile');
      }

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('用户取消交易');
      } else {
        toast.error('Mint 失败: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splash}>
      <div className={styles.content}>
        <h2>{type === "lost" ? "Game Over!" : "游戏结束!"}</h2>
        {type === "ended" && (
          <>
            <p className={styles.score}>游戏得分: {maxScore}</p>
            <p className={styles.time}>结束时间: {gameEndTime}</p>
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
                onClick={startGame}
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
