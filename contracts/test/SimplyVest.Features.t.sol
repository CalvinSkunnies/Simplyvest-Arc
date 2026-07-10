// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SimplyVest} from "../src/SimplyVest.sol";
import {ISimplyVest} from "../src/interfaces/ISimplyVest.sol";
import {MockERC20} from "./MockERC20.sol";

contract SimplyVestFeaturesTest is Test {
    SimplyVest vest;
    MockERC20 token;

    address creator = address(0x1);
    address recipient = address(0x2);
    address milestoneAuth = address(0x3);
    address other = address(0x4);

    uint256 constant AMOUNT = 1000 ether;
    uint256 constant START = 1000;
    uint256 constant CLIFF = 2000;
    uint256 constant END = 3000;

    function setUp() public {
        vest = new SimplyVest();
        token = new MockERC20();
        token.mint(creator, AMOUNT * 10);
        vm.prank(creator);
        token.approve(address(vest), AMOUNT * 10);
    }

    // ── Helper ──

    function _createStream() internal returns (bytes32) {
        vm.warp(START - 1);
        vm.prank(creator);
        return vest.createStream(recipient, address(token), AMOUNT, START, CLIFF, END);
    }

    function _createMilestone() internal returns (bytes32) {
        vm.prank(creator);
        return vest.createMilestoneStream(recipient, address(token), AMOUNT, milestoneAuth);
    }

    // ── Batch Create Streams ──

    function test_BatchCreateStreams() public {
        vm.warp(START - 1);

        ISimplyVest.StreamInput[] memory inputs = new ISimplyVest.StreamInput[](3);
        inputs[0] = ISimplyVest.StreamInput(recipient, address(token), AMOUNT, START, CLIFF, END);
        inputs[1] = ISimplyVest.StreamInput(address(0x5), address(token), AMOUNT, START, CLIFF, END);
        inputs[2] = ISimplyVest.StreamInput(address(0x6), address(token), AMOUNT, START, CLIFF, END);

        vm.prank(creator);
        bytes32[] memory ids = vest.batchCreateStreams(inputs);

        assertEq(ids.length, 3);
        assertEq(vest.getStreamCount(), 3);
        for (uint256 i = 0; i < 3; i++) {
            ISimplyVest.Stream memory s = vest.getStream(ids[i]);
            assertEq(s.creator, creator);
            assertEq(s.amount, AMOUNT);
            assertFalse(s.cancelled);
        }
        assertEq(token.balanceOf(address(vest)), AMOUNT * 3);
    }

    function test_RevertWhen_BatchCreate_WithZeroAddress() public {
        vm.warp(START - 1);

        ISimplyVest.StreamInput[] memory inputs = new ISimplyVest.StreamInput[](1);
        inputs[0] = ISimplyVest.StreamInput(address(0), address(token), AMOUNT, START, CLIFF, END);

        vm.prank(creator);
        vm.expectRevert(ISimplyVest.InvalidRecipient.selector);
        vest.batchCreateStreams(inputs);
    }

    // ── Batch Create Milestone Streams ──

    function test_BatchCreateMilestoneStreams() public {
        ISimplyVest.MilestoneStreamInput[] memory inputs = new ISimplyVest.MilestoneStreamInput[](2);
        inputs[0] = ISimplyVest.MilestoneStreamInput(recipient, address(token), AMOUNT, milestoneAuth);
        inputs[1] = ISimplyVest.MilestoneStreamInput(address(0x5), address(token), AMOUNT, milestoneAuth);

        vm.prank(creator);
        bytes32[] memory ids = vest.batchCreateMilestoneStreams(inputs);

        assertEq(ids.length, 2);
        assertEq(vest.getMilestoneStreamCount(), 2);
        assertEq(token.balanceOf(address(vest)), AMOUNT * 2);
    }

    // ── Deposit More ──

    function test_DepositMore() public {
        bytes32 id = _createStream();
        uint256 depositAmount = 500 ether;

        token.mint(creator, depositAmount);
        vm.prank(creator);
        token.approve(address(vest), depositAmount);

        vm.prank(creator);
        vest.depositMore(id, depositAmount);

        ISimplyVest.Stream memory s = vest.getStream(id);
        assertEq(s.amount, AMOUNT + depositAmount);
        assertEq(token.balanceOf(address(vest)), AMOUNT + depositAmount);
    }

    function test_DepositMore_IncreasesClaimable() public {
        bytes32 id = _createStream();
        uint256 depositAmount = 500 ether;

        vm.warp(START + (END - START) / 2);
        uint256 claimableBefore = vest.getClaimable(id);

        token.mint(creator, depositAmount);
        vm.prank(creator);
        token.approve(address(vest), depositAmount);

        vm.prank(creator);
        vest.depositMore(id, depositAmount);

        uint256 claimableAfter = vest.getClaimable(id);
        assertGt(claimableAfter, claimableBefore);
    }

    function test_RevertWhen_NonCreatorDeposits() public {
        bytes32 id = _createStream();
        vm.prank(other);
        vm.expectRevert(ISimplyVest.Unauthorized.selector);
        vest.depositMore(id, 1 ether);
    }

    function test_RevertWhen_DepositZero() public {
        bytes32 id = _createStream();
        vm.prank(creator);
        vm.expectRevert(ISimplyVest.ZeroAmount.selector);
        vest.depositMore(id, 0);
    }

    function test_RevertWhen_DepositToCancelled() public {
        bytes32 id = _createStream();
        vm.prank(creator);
        vest.cancel(id);

        vm.prank(creator);
        vm.expectRevert(ISimplyVest.AlreadyCancelled.selector);
        vest.depositMore(id, 1 ether);
    }

    function test_RevertWhen_DepositToCompleted() public {
        bytes32 id = _createStream();
        vm.warp(END + 1);
        vm.prank(recipient);
        vest.withdraw(id, AMOUNT);

        vm.prank(creator);
        vm.expectRevert(ISimplyVest.StreamFinished.selector);
        vest.depositMore(id, 1 ether);
    }

    // ── Transfer Stream ──

    function test_TransferStream() public {
        bytes32 id = _createStream();
        address newRecipient = address(0x7);

        vm.prank(recipient);
        vest.transferStream(id, newRecipient);

        ISimplyVest.Stream memory s = vest.getStream(id);
        assertEq(s.recipient, newRecipient);
    }

    function test_RevertWhen_NonRecipientTransfers() public {
        bytes32 id = _createStream();
        vm.prank(creator);
        vm.expectRevert(ISimplyVest.Unauthorized.selector);
        vest.transferStream(id, address(0x7));
    }

    function test_RevertWhen_TransferToZero() public {
        bytes32 id = _createStream();
        vm.prank(recipient);
        vm.expectRevert(ISimplyVest.InvalidRecipient.selector);
        vest.transferStream(id, address(0));
    }

    function test_RevertWhen_TransferCancelledStream() public {
        bytes32 id = _createStream();
        vm.prank(creator);
        vest.cancel(id);

        vm.prank(recipient);
        vm.expectRevert(ISimplyVest.AlreadyCancelled.selector);
        vest.transferStream(id, address(0x7));
    }

    function test_RecipientCanCancelTimeStream() public {
        bytes32 id = _createStream();
        vm.warp(START + (END - START) / 2);

        uint256 expectedVested = AMOUNT * (uint256(block.timestamp) - START) / (END - START);

        vm.prank(recipient);
        vest.cancel(id);

        ISimplyVest.Stream memory s = vest.getStream(id);
        assertTrue(s.cancelled);
        // recipient should not lose vested tokens — they're sent in cancel
        assertEq(token.balanceOf(recipient), expectedVested);
    }

    // ── Transfer Milestone Stream ──

    function test_TransferMilestoneStream() public {
        bytes32 id = _createMilestone();
        address newRecipient = address(0x7);

        vm.prank(recipient);
        vest.transferMilestoneStream(id, newRecipient);

        ISimplyVest.MilestoneStream memory ms = vest.getMilestoneStream(id);
        assertEq(ms.recipient, newRecipient);
    }

    function test_RevertWhen_NonRecipientTransfersMilestone() public {
        bytes32 id = _createMilestone();
        vm.prank(creator);
        vm.expectRevert(ISimplyVest.Unauthorized.selector);
        vest.transferMilestoneStream(id, address(0x7));
    }

    function test_RevertWhen_TransferMilestoneToZero() public {
        bytes32 id = _createMilestone();
        vm.prank(recipient);
        vm.expectRevert(ISimplyVest.InvalidRecipient.selector);
        vest.transferMilestoneStream(id, address(0));
    }

    function test_RevertWhen_TransferMilestoneAfterWithdrawn() public {
        bytes32 id = _createMilestone();
        vm.prank(milestoneAuth);
        vest.triggerMilestone(id);
        vm.prank(recipient);
        vest.withdrawMilestone(id);

        vm.prank(recipient);
        vm.expectRevert(ISimplyVest.StreamFinished.selector);
        vest.transferMilestoneStream(id, address(0x7));
    }

    // ── Recipient Cancel (Milestone) ──

    function test_RecipientCanCancelMilestone() public {
        bytes32 id = _createMilestone();
        uint256 creatorBefore = token.balanceOf(creator);

        vm.prank(recipient);
        vest.cancelMilestone(id);

        ISimplyVest.MilestoneStream memory ms = vest.getMilestoneStream(id);
        assertTrue(ms.cancelled);
        assertEq(token.balanceOf(creator) - creatorBefore, AMOUNT); // all returned to creator
    }

    function test_RevertWhen_UnauthorizedCancels() public {
        bytes32 id = _createStream();
        vm.prank(other);
        vm.expectRevert(ISimplyVest.Unauthorized.selector);
        vest.cancel(id);
    }

    function test_RevertWhen_UnauthorizedCancelsMilestone() public {
        bytes32 id = _createMilestone();
        vm.prank(other);
        vm.expectRevert(ISimplyVest.Unauthorized.selector);
        vest.cancelMilestone(id);
    }

    // ── Recipient Cannot Cancel After Milestone Reached ──

    function test_RevertWhen_RecipientCancelsMilestoneAfterTrigger() public {
        bytes32 id = _createMilestone();
        vm.prank(milestoneAuth);
        vest.triggerMilestone(id);

        vm.prank(recipient);
        vm.expectRevert(ISimplyVest.FullyVested.selector);
        vest.cancelMilestone(id);
    }
}
