import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import GameProvider from '@/context/game-context';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { disconnect } from '@/utils/ethers';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // 页面加载时检查是否需要断开连接
    const handleLoad = () => {
      // 清除之前的连接状态
      disconnect();
    };

    // 页面关闭或刷新时断开连接
    const handleBeforeUnload = () => {
      disconnect();
    };

    // 添加事件监听器
    window.addEventListener('load', handleLoad);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 组件卸载时清理
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      disconnect();
    };
  }, []);

  return (
    <GameProvider>
      <Component {...pageProps} />
      <Toaster />
    </GameProvider>
  );
}
