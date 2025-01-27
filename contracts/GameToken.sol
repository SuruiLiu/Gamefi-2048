// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    uint256 public constant DAILY_REWARD = 10 * 10 ** 18; // 每日奖励10代币

    // 记录用户最后领取时间
    mapping(address => uint256) public lastRewardTime;

    constructor() ERC20("SPOTD Token", "STD") Ownable(msg.sender) {}

    // 检查用户今天是否已领取
    function hasClaimedToday(address user) public view returns (bool) {
        return (lastRewardTime[user] / 86400) == (block.timestamp / 86400);
    }

    // 检查并发放每日代币
    function checkAndAirdrop(address user) public returns (bool) {
        if (!hasClaimedToday(user)) {
            lastRewardTime[user] = block.timestamp;
            _mint(user, DAILY_REWARD);
            return true;
        }
        return false;
    }

    // 管理员单独发放代币
    function airdropToUser(address user, uint256 amount) public onlyOwner {
        _mint(user, amount);
    }

    // 管理员铸造函数(用于特殊奖励等)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 销毁代币
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
