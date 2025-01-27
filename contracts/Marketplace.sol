// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./GameNFT.sol";

contract Marketplace is ReentrancyGuard {
    IERC20 public gameToken;
    IERC721 public nft;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // 记录所有在售的NFT tokenId
    uint256[] public activeListings;
    // 记录tokenId在activeListings数组中的索引
    mapping(uint256 => uint256) private listingIndex;
    mapping(uint256 => Listing) public listings;

    // 事件
    event NFTListed(uint256 indexed tokenId, address seller, uint256 price);
    event NFTSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    event NFTUnlisted(uint256 indexed tokenId);

    constructor(address _gameToken, address _nft) {
        gameToken = IERC20(_gameToken);
        nft = IERC721(_nft);
    }

    function listNFT(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(nft.getApproved(tokenId) == address(this), "Not approved");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");

        listings[tokenId] = Listing(msg.sender, price, true);

        // 添加到活跃列表
        listingIndex[tokenId] = activeListings.length;
        activeListings.push(tokenId);

        emit NFTListed(tokenId, msg.sender, price);
    }

    function buyNFT(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Not for sale");
        require(
            msg.sender != listing.seller,
            "Seller cannot buy their own NFT"
        );

        require(
            gameToken.balanceOf(msg.sender) >= listing.price,
            "Insufficient token balance"
        );
        require(
            gameToken.allowance(msg.sender, address(this)) >= listing.price,
            "Insufficient token allowance"
        );

        // 转移代币和NFT
        gameToken.transferFrom(msg.sender, listing.seller, listing.price);
        nft.transferFrom(listing.seller, msg.sender, tokenId);

        // 从活跃列表中移除
        _removeListing(tokenId);

        emit NFTSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function unlistNFT(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].active, "Not listed");

        // 从活跃列表中移除
        _removeListing(tokenId);

        emit NFTUnlisted(tokenId);
    }

    // 内部函数：从活跃列表中移除NFT
    function _removeListing(uint256 tokenId) internal {
        uint256 index = listingIndex[tokenId];
        uint256 lastTokenId = activeListings[activeListings.length - 1];

        // 如果要删除的不是最后一个元素，就将最后一个元素移到要删除的位置
        if (tokenId != lastTokenId) {
            activeListings[index] = lastTokenId;
            listingIndex[lastTokenId] = index;
        }

        activeListings.pop();
        delete listings[tokenId];
    }

    // 获取所有在售NFT列表
    function getAllListedNFTs()
        external
        view
        returns (
            uint256[] memory tokenIds,
            address[] memory sellers,
            uint256[] memory prices
        )
    {
        uint256 count = activeListings.length;
        tokenIds = new uint256[](count);
        sellers = new address[](count);
        prices = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = activeListings[i];
            Listing memory listing = listings[tokenId];
            tokenIds[i] = tokenId;
            sellers[i] = listing.seller;
            prices[i] = listing.price;
        }

        return (tokenIds, sellers, prices);
    }

    // 获取用户拥有的所有NFT
    function getUserNFTs(
        address user
    ) external view returns (uint256[] memory) {
        // 调用GameNFT合约的getUserTokens函数
        return GameNFT(address(nft)).getUserTokens(user);
    }

    // 获取NFT当前价格
    function getNFTPrice(uint256 tokenId) external view returns (uint256) {
        require(listings[tokenId].active, "Not listed");
        return listings[tokenId].price;
    }

    // 检查NFT是否在售
    function isNFTListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }

    // 获取在售NFT数量
    function getActiveListingsCount() external view returns (uint256) {
        return activeListings.length;
    }
}
