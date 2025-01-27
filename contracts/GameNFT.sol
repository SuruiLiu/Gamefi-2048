// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import "../lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract GameNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIds;
    uint256 public mintPrice = 5 * 10 ** 18; // 初始设置为5个游戏代币

    IERC20 public gameToken;

    // 游戏相关的属性
    struct GameStats {
        uint256 highestTile; // 最高方块数（如2048、4096等）
        address onwer; // 游戏完成者
        string timestamp; // 成就名称
    }

    // 记录每个NFT的属性
    struct NFTAttributes {
        GameStats stats;
        string rarity; // 基于游戏表现确定稀有度
    }

    // 稀有度阈值
    uint256 private constant LEGENDARY_THRESHOLD = 20000; // 20000分以上
    uint256 private constant EPIC_THRESHOLD = 9000; // 9000分以上
    uint256 private constant RARE_THRESHOLD = 4000; // 4000分以上

    // 用户拥有的NFT追踪
    mapping(address => uint256[]) private _userTokens;
    mapping(uint256 => NFTAttributes) public tokenAttributes;

    constructor(
        address _gameToken
    ) ERC721("2048 Game NFT", "2048NFT") Ownable(msg.sender) {
        gameToken = IERC20(_gameToken);
    }

    // 根据游戏表现计算稀有度
    function calculateRarity(
        GameStats memory stats
    ) internal pure returns (string memory) {
        uint256 score = stats.highestTile;
        if (score >= LEGENDARY_THRESHOLD) return "Legendary";
        if (score >= EPIC_THRESHOLD) return "Epic";
        if (score >= RARE_THRESHOLD) return "Rare";
        return "Common";
    }

    // 生成NFT的SVG图像
    function generateSVG(
        NFTAttributes memory attributes
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">',
                    "<style>",
                    ".title { font: bold 24px sans-serif; fill: #333; }",
                    ".stats { font: 16px sans-serif; fill: #666; }",
                    ".address { font: 14px monospace; fill: #444; }",
                    ".timestamp { font: italic 16px sans-serif; fill: #888; }",
                    ".rarity { font: bold 28px sans-serif; }",
                    "</style>",
                    '<rect width="100%" height="100%" fill="#f8f8f8"/>',
                    // 标题
                    '<text x="50%" y="60" class="title" text-anchor="middle">',
                    "2048 Game Achievement",
                    "</text>",
                    // 最高方块
                    '<text x="50%" y="120" class="stats" text-anchor="middle">',
                    "Highest Tile: ",
                    Strings.toString(attributes.stats.highestTile),
                    "</text>",
                    // 时间戳
                    '<text x="50%" y="240" class="timestamp" text-anchor="middle">',
                    attributes.stats.timestamp,
                    "</text>",
                    // 稀有度
                    '<text x="50%" y="300" class="rarity" text-anchor="middle" ',
                    'fill="',
                    getRarityColor(attributes.rarity),
                    '">',
                    attributes.rarity,
                    "</text>",
                    "</svg>"
                )
            );
    }

    // 获取稀有度对应的颜色
    function getRarityColor(
        string memory rarity
    ) internal pure returns (string memory) {
        if (keccak256(bytes(rarity)) == keccak256(bytes("Legendary")))
            return "#FFD700";
        if (keccak256(bytes(rarity)) == keccak256(bytes("Epic")))
            return "#A335EE";
        if (keccak256(bytes(rarity)) == keccak256(bytes("Rare")))
            return "#0070DD";
        return "#666666"; // Common
    }

    // 生成NFT的metadata
    function generateTokenURI(
        uint256 tokenId
    ) internal view returns (string memory) {
        NFTAttributes memory attributes = tokenAttributes[tokenId];
        string memory svgBase64 = Base64.encode(bytes(generateSVG(attributes)));

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"2048 Game NFT #',
                                tokenId.toString(),
                                '","description":"A 2048 game achievement NFT","image":"data:image/svg+xml;base64,',
                                svgBase64,
                                '","attributes":[',
                                '{"trait_type":"Highest Tile","value":',
                                Strings.toString(attributes.stats.highestTile),
                                "},",
                                '{"trait_type":"Player","value":"',
                                attributes.stats.onwer,
                                '"},',
                                '{"trait_type":"Timestamp","value":"',
                                attributes.stats.timestamp,
                                '"},',
                                '{"trait_type":"Rarity","value":"',
                                attributes.rarity,
                                '"}]}'
                            )
                        )
                    )
                )
            );
    }

    // 铸造NFT
    function mint(
        uint256 highestTile,
        string memory timestamp
    ) public returns (uint256) {
        // 检查代币余额和授权
        require(
            gameToken.balanceOf(msg.sender) >= mintPrice,
            "Insufficient game tokens"
        );
        require(
            gameToken.allowance(msg.sender, address(this)) >= mintPrice,
            "Token allowance too low"
        );

        // 转移代币
        gameToken.transferFrom(msg.sender, address(this), mintPrice);

        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;

        // 创建游戏统计
        GameStats memory stats = GameStats({
            highestTile: highestTile,
            onwer: msg.sender,
            timestamp: timestamp
        });

        // 创建NFT属性
        NFTAttributes memory attributes = NFTAttributes({
            stats: stats,
            rarity: calculateRarity(stats)
        });

        tokenAttributes[newTokenId] = attributes;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, generateTokenURI(newTokenId));

        return newTokenId;
    }

    // 提取合约中的代币
    function withdrawGameTokens(uint256 amount) public onlyOwner {
        gameToken.transfer(owner(), amount);
    }

    // 获取NFT详细信息
    function getNFTDetails(
        uint256 tokenId
    )
        public
        view
        returns (
            uint256 highestTile,
            address player,
            string memory timestamp,
            string memory rarity
        )
    {
        NFTAttributes memory attributes = tokenAttributes[tokenId];
        return (
            attributes.stats.highestTile,
            attributes.stats.onwer,
            attributes.stats.timestamp,
            attributes.rarity
        );
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);

        // 如果是铸造操作
        if (from == address(0)) {
            _userTokens[to].push(tokenId);
        }
        // 如果是转移操作
        else if (to != address(0)) {
            // 从原所有者的列表中移除
            _removeTokenFromUser(from, tokenId);
            // 添加到新所有者的列表中
            _userTokens[to].push(tokenId);
        }
        // 如果是销毁操作
        else {
            _removeTokenFromUser(from, tokenId);
        }

        return from;
    }

    // 内部函数：从用户的token列表中移除指定token
    function _removeTokenFromUser(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = _userTokens[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                // 将最后一个元素移到要删除的位置
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    // 获取用户拥有的所有NFT
    function getUserTokens(
        address user
    ) external view returns (uint256[] memory) {
        return _userTokens[user];
    }

    // 获取用户NFT数量
    function getUserTokenCount(address user) external view returns (uint256) {
        return _userTokens[user].length;
    }
}
