// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SimplyVestFactory} from "../src/SimplyVestFactory.sol";

contract DeployFactory is Script {
    function run() external {
        uint256 deployerKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerKey != 0) {
            vm.startBroadcast(deployerKey);
        } else {
            vm.startBroadcast();
        }

        SimplyVestFactory factory = new SimplyVestFactory();
        console.log("SimplyVestFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
