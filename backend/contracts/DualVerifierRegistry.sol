// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DualVerifierRegistry
 * @dev Universal Web2 & Web3 Forensic Payment Explorer — Anti-Replay Attestation Registry
 * Hackathon Track: Intelligence: AI & Web3 Without Borders (BlockchainUNN Hackathon)
 *
 * Implements immutable anchoring for both Nigerian Local Bank Transfers (Rail 1: NIBSS)
 * and On-Chain Blockchain Transfers (Rail 2: EVM/Web3).
 * Prevents double-spending of receipts across merchants by tracking proof hashes and verification counts.
 */
contract DualVerifierRegistry {
    // Enum representing verification rails
    enum RailType {
        NONE,
        LOCAL_BANK_NIBSS, // 1
        ONCHAIN_WEB3      // 2
    }

    struct VerificationRecord {
        bytes32 proofHash;          // SHA-256(railType + sessionIdOrTxHash + sender + receiver + amount)
        uint8   railType;           // 1 = LOCAL_BANK_NIBSS, 2 = ONCHAIN_WEB3
        address verifierOracle;     // Authorized DualVerifier Backend Signer / Attester
        uint64  verifiedAt;         // Block timestamp of first verification
        uint32  verificationCount;  // Increments if someone attempts to verify/claim the same receipt again
        string  routingSummary;     // Compact metadata (e.g., "GTB->OPAY:NGN:25000" or "USDC:BASE:250")
    }

    // Mapping from cryptographic proofHash => VerificationRecord
    mapping(bytes32 => VerificationRecord) public proofs;

    // Total proofs registered
    uint256 public totalRegisteredProofs;
    // Total replay attempts intercepted
    uint256 public totalReplayInterceptions;

    // Authorized oracle/signer
    address public owner;
    mapping(address => bool) public authorizedOracles;

    // Events
    event ProofRegistered(
        bytes32 indexed proofHash,
        uint8 indexed railType,
        address indexed oracle,
        uint64 verifiedAt,
        string routingSummary
    );

    event ReplayAttemptBlocked(
        bytes32 indexed proofHash,
        uint8 indexed railType,
        uint32 attemptCount,
        uint64 firstVerifiedAt,
        uint64 reattemptAt
    );

    event OracleAuthorized(address indexed oracle, bool authorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == owner, "Unauthorized verifier oracle");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedOracles[msg.sender] = true;
    }

    function setOracle(address oracle, bool authorized) external onlyOwner {
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }

    /**
     * @notice Registers or re-verifies a payment proof.
     * @param proofHash SHA-256 cryptographic digest of the transaction parameters
     * @param railType 1 for Local Bank (NIBSS), 2 for On-Chain Web3
     * @param routingSummary Compact identity & asset pipeline description
     * @return isFirstTime True if this is the first time the proof has been anchored (authentic);
     *                     False if it has already been claimed (replay detected).
     * @return record The updated verification record
     */
    function registerProof(
        bytes32 proofHash,
        uint8 railType,
        string calldata routingSummary
    ) external onlyOracle returns (bool isFirstTime, VerificationRecord memory record) {
        require(proofHash != bytes32(0), "Invalid proof hash");
        require(railType == 1 || railType == 2, "Invalid rail type");

        VerificationRecord storage rec = proofs[proofHash];

        if (rec.verifiedAt == 0) {
            // First time registration
            rec.proofHash = proofHash;
            rec.railType = railType;
            rec.verifierOracle = msg.sender;
            rec.verifiedAt = uint64(block.timestamp);
            rec.verificationCount = 1;
            rec.routingSummary = routingSummary;

            totalRegisteredProofs++;

            emit ProofRegistered(proofHash, railType, msg.sender, rec.verifiedAt, routingSummary);
            return (true, rec);
        } else {
            // Replay attack / duplicate verification detected!
            rec.verificationCount++;
            totalReplayInterceptions++;

            emit ReplayAttemptBlocked(
                proofHash,
                rec.railType,
                rec.verificationCount,
                rec.verifiedAt,
                uint64(block.timestamp)
            );

            return (false, rec);
        }
    }

    /**
     * @notice Verifies whether a proof has already been claimed/registered.
     * @param proofHash SHA-256 digest
     * @return exists True if already registered
     * @return firstVerifiedAt Timestamp of original registration
     * @return claimCount Total number of verification attempts
     * @return summary Routing description
     * @return railType Rail type enum
     */
    function verifyProofStatus(bytes32 proofHash) external view returns (
        bool exists,
        uint64 firstVerifiedAt,
        uint32 claimCount,
        string memory summary,
        uint8 railType
    ) {
        VerificationRecord memory rec = proofs[proofHash];
        if (rec.verifiedAt > 0) {
            return (true, rec.verifiedAt, rec.verificationCount, rec.routingSummary, rec.railType);
        }
        return (false, 0, 0, "", 0);
    }
}

