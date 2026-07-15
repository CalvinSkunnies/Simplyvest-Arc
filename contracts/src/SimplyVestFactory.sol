// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SimplyVest} from "./SimplyVest.sol";

contract SimplyVestFactory {
    mapping(address => address) private _userContracts;
    address[] private _allContracts;

    event UserContractDeployed(address indexed user, address indexed contract_);

    function deploy() external returns (address) {
        require(_userContracts[msg.sender] == address(0), "Already deployed");
        SimplyVest sv = new SimplyVest();
        address addr = address(sv);
        _userContracts[msg.sender] = addr;
        _allContracts.push(addr);
        emit UserContractDeployed(msg.sender, addr);
        return addr;
    }

    function getUserContract(address user) external view returns (address) {
        return _userContracts[user];
    }

    function getContractCount() external view returns (uint256) {
        return _allContracts.length;
    }

    function getContractAt(uint256 index) external view returns (address) {
        return _allContracts[index];
    }
}
