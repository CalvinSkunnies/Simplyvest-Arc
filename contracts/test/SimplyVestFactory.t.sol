// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SimplyVestFactory} from "../src/SimplyVestFactory.sol";
import {SimplyVest} from "../src/SimplyVest.sol";

contract SimplyVestFactoryTest is Test {
    SimplyVestFactory public factory;
    address public user = address(0x1234);

    function setUp() external {
        factory = new SimplyVestFactory();
    }

    function test_Deploy() external {
        address addr = factory.deploy();
        assertTrue(addr != address(0));
        assertEq(factory.getUserContract(address(this)), addr);
        assertEq(factory.getContractCount(), 1);
        assertEq(factory.getContractAt(0), addr);
    }

    function test_DeployFromUser() external {
        vm.prank(user);
        address addr = factory.deploy();
        assertEq(factory.getUserContract(user), addr);
        assertEq(factory.getContractCount(), 1);
    }

    function test_RevertWhen_AlreadyDeployed() external {
        factory.deploy();
        vm.expectRevert("Already deployed");
        factory.deploy();
    }

    function test_GetUserContract_ReturnsZeroForUnknown() external {
        assertEq(factory.getUserContract(user), address(0));
    }

    function test_MultipleUsers() external {
        address userA = address(0xA);
        address userB = address(0xB);

        vm.prank(userA);
        address addrA = factory.deploy();

        vm.prank(userB);
        address addrB = factory.deploy();

        assertEq(factory.getUserContract(userA), addrA);
        assertEq(factory.getUserContract(userB), addrB);
        assertTrue(addrA != addrB);
        assertEq(factory.getContractCount(), 2);
    }

    function test_DeployedContractIsSimplyVest() external {
        address addr = factory.deploy();
        SimplyVest vest = SimplyVest(addr);
        assertEq(vest.MIN_DURATION(), 60);
    }
}
