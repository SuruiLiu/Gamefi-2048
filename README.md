# 2048 Game with NFT Marketplace

[English](README.md) | [中文](README_CN.md)

A blockchain-based 2048 game that integrates NFT minting and marketplace functionality, allowing players to mint their game achievements as NFTs and trade them in the marketplace. Now supports multiple networks including Sepolia, Telos Testnet, and Avalanche Fuji, with unique NFT designs stored on IPFS.

## Features

- 🎮 Classic 2048 gameplay
- 🎨 Game achievement NFT minting system with unique designs
- 💰 NFT marketplace for trading
- 🌐 Multi-network support: Sepolia, Telos Testnet, Avalanche Fuji
- 🖼️ NFT images stored on IPFS
- 🎁 Daily token airdrop rewards
- 📱 Responsive design for mobile devices
- 🔗 Ethereum-based smart contracts

## Tech Stack

- Frontend:
  - Next.js
  - React
  - TypeScript
  - CSS Modules
  - Ethers.js

- Smart Contracts:
  - Solidity
  - ERC20 Token
  - ERC721 NFT
  - Marketplace Contract

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/SuruiLiu/Gamefi-2048.git
cd Gamefi-2048
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Project Structure

```
Gamefi-2048/
├── components/      # React components
├── contracts/       # Smart contract files
├── styles/         # CSS style files
├── utils/          # Utility functions
├── pages/          # Next.js pages
└── public/         # Static assets
```

## How to Play

1. Connect your MetaMask wallet
2. Use arrow keys or swipe to move tiles
3. Merge tiles with the same number
4. Mint NFT when reaching target score
5. Trade your NFTs in the marketplace

## Contract Addresses

> Note: All contracts are deployed on Sepolia testnet. Please make sure you have some Sepolia ETH in your wallet to receive daily airdrops and interact with the contracts.

- GameToken: `0x5d768b72b6a41cB84B021A169E0B77a7b6b06f49`
- GameNFT: `0x37eAD756497bBc8e69a16DC260FaB698309b0067`
- Marketplace: `0x3045e820CcF4059cE1747F033e8D6246F43850dB`

### Telos Testnet
- GameToken: `0x09421D4e8594D3B19ABFc9c1C44096fa3BaAB6e1`
- GameNFT: `0x459287afB0daf7e7FDCcA4bda08C8a5bd0BfE230`
- Marketplace: `0x60cda54041199A7Fa74738053F6D78527A9120c6`

### Avalanche Fuji
- GameToken: `0x4A3Ec63705BB4BCcBaFcabfD8D7B6e9986082489`
- GameNFT: `0x63F6082C3B8193d43EE146d790DF30925442B645`
- Marketplace: `0x459287afB0daf7e7FDCcA4bda08C8a5bd0BfE230`

### NFT Images
- Legendary: `https://ipfs.io/ipfs/bafybeicc4xossvnz3acndhqw4zcs4xa2xgiyotpvb3ptishm75qtyeszwq`
- Epic: `https://ipfs.io/ipfs/bafybeifh6ifdof7mee7rqkw355tnxh2qrlu2nudze7dhbbxeqcvpuele7q`
- Rare: `https://ipfs.io/ipfs/bafybeiaf3fy7r2evvqlhqqpbwla3lsurie2h6cwanalp7fzpxn3cq7pwgy`
- Common: `https://ipfs.io/ipfs/bafybeighwgusfefm23avzsxpaqbkacrqmywfunx3lx3nywmf23uwxvb45i`

You can get Sepolia testnet ETH from these faucets:
- [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

## Contributing

We welcome all forms of contributions, including but not limited to:

- Bug reports and feature requests
- Documentation improvements
- Bug fixes
- New features
- Performance optimizations

### Contribution Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- Write code in TypeScript
- Maintain consistent formatting (using Prettier)
- Ensure all tests pass
- Add necessary comments and documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, feel free to reach out through:

- Opening an Issue
- Submitting a Pull Request
- Sending an email to [lsruirui@163.com]

## Acknowledgments

- Thanks to all contributors
- Thanks to [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- Inspired by the original 2048 game