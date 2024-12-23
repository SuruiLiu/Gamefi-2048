import { useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/index.module.css';
import Board from '@/components/board';
import Score from '@/components/score';
import Sidebar from '@/components/sidebar';
import Marketplace from '@/components/marketplace';
import Profile from '@/components/profile';

type Tab = 'game' | 'marketplace' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('game');

  const renderContent = () => {
    switch (activeTab) {
      case 'game':
        return (
          <div className={styles.gameContainer}>
            <div className={styles.gameHeader}>
              <h1>2048</h1>
              <Score />
            </div>
            <main className={styles.gameMain}>
              <Board onTabChange={setActiveTab} />
            </main>
          </div>
        );
      case 'marketplace':
        return <Marketplace />;
      case 'profile':
        return <Profile />;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>2048 Game</title>
        <meta name="description" content="2048 game with marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
}
