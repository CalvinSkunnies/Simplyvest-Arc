// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ISimplyVest {
    // --- Structs ---

    struct Stream {
        address creator;
        address recipient;
        address token;
        uint256 amount;
        uint256 amountWithdrawn;
        uint256 startTime;
        uint256 cliffTime;
        uint256 endTime;
        bool cancelled;
    }

    struct MilestoneStream {
        address creator;
        address recipient;
        address token;
        uint256 amount;
        uint256 amountWithdrawn;
        address milestoneAuthority;
        bool milestoneReached;
        bool cancelled;
    }

    struct StreamInput {
        address recipient;
        address token;
        uint256 amount;
        uint256 startTime;
        uint256 cliffTime;
        uint256 endTime;
    }

    struct MilestoneStreamInput {
        address recipient;
        address token;
        uint256 amount;
        address milestoneAuthority;
    }

    // --- Events ---

    event StreamCreated(
        bytes32 indexed streamId,
        address indexed creator,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 cliffTime,
        uint256 endTime
    );

    event TokensClaimed(
        bytes32 indexed streamId, address indexed recipient, uint256 amount, uint256 claimed, uint256 totalClaimed
    );

    event StreamCompleted(bytes32 indexed streamId, address indexed recipient, uint256 totalAmount);

    event StreamCancelled(
        bytes32 indexed streamId,
        address indexed creator,
        address indexed recipient,
        uint256 vestedToRecipient,
        uint256 returnedToCreator
    );

    event MilestoneStreamCreated(
        bytes32 indexed streamId,
        address indexed creator,
        address indexed recipient,
        address token,
        uint256 amount,
        address milestoneAuthority
    );

    event MilestoneTriggered(bytes32 indexed streamId, address indexed milestoneAuthority);

    event MilestoneCompleted(bytes32 indexed streamId, address indexed recipient, uint256 amount);

    event MilestoneCancelled(
        bytes32 indexed streamId, address indexed creator, address indexed recipient, uint256 returnedToCreator
    );

    event StreamDeposited(
        bytes32 indexed streamId, address indexed creator, uint256 addedAmount, uint256 newTotal
    );

    event StreamTransferred(
        bytes32 indexed streamId, address indexed oldRecipient, address indexed newRecipient
    );

    event MilestoneStreamTransferred(
        bytes32 indexed streamId, address indexed oldRecipient, address indexed newRecipient
    );

    // --- Errors ---

    error ZeroAmount();
    error InvalidTimeRange();
    error InvalidCliffTime();
    error DurationTooShort();
    error StartTimeInPast();
    error InsufficientBalance();
    error AlreadyCancelled();
    error CliffNotReached();
    error NothingToWithdraw();
    error ExceedsClaimable();
    error Unauthorized();
    error StreamExpired();
    error FullyVested();
    error AlreadyTriggered();
    error AlreadyWithdrawn();
    error InvalidRecipient();
    error InvalidMilestoneAuthority();
    error StreamFinished();
    error AlreadyTransferred();
    error ArrayLengthMismatch();

    // --- Stream Functions ---

    function createStream(
        address recipient,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 cliffTime,
        uint256 endTime
    ) external returns (bytes32 streamId);

    function batchCreateStreams(StreamInput[] calldata inputs) external returns (bytes32[] memory ids);

    function depositMore(bytes32 streamId, uint256 amount) external;

    function transferStream(bytes32 streamId, address newRecipient) external;

    function withdraw(bytes32 streamId, uint256 amount) external;

    function cancel(bytes32 streamId) external;

    // --- Milestone Functions ---

    function createMilestoneStream(address recipient, address token, uint256 amount, address milestoneAuthority)
        external
        returns (bytes32 streamId);

    function batchCreateMilestoneStreams(MilestoneStreamInput[] calldata inputs)
        external
        returns (bytes32[] memory ids);

    function transferMilestoneStream(bytes32 streamId, address newRecipient) external;

    function triggerMilestone(bytes32 streamId) external;

    function withdrawMilestone(bytes32 streamId) external;

    function cancelMilestone(bytes32 streamId) external;

    // --- View Functions ---

    function getClaimable(bytes32 streamId) external view returns (uint256);

    function getStatus(bytes32 streamId) external view returns (uint8);

    function getStream(bytes32 streamId) external view returns (Stream memory);

    function getMilestoneStream(bytes32 streamId) external view returns (MilestoneStream memory);

    function getMilestoneClaimable(bytes32 streamId) external view returns (uint256);

    function getStreamCount() external view returns (uint256);

    function getMilestoneStreamCount() external view returns (uint256);

    function creatorNonces(address creator) external view returns (uint256);

    function streamIds(uint256 index) external view returns (bytes32);
}
