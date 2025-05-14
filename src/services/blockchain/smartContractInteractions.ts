import { publicClient, walletClient } from "./config";
import { parseAbiItem, encodeFunctionData, Hex, Abi } from "viem";

// TODO: Replace with the actual ABI of your deployed smart contract
// This is a placeholder ABI based on the requirements
const contractAbi = [
	// Event for Intervention Status Change
	"event InterventionStatusUpdated(bytes32 indexed recordId, uint256 interventionId, string status, uint256 timestamp)",
	// Event for Intervention Cost Validation
	"event InterventionCostValidated(bytes32 indexed recordId, uint256 interventionId, uint256 finalCost, uint256 timestamp)",
	// Event for Doleance Status Change (Public)
	"event DoleanceStatusUpdated(bytes32 indexed recordId, uint256 doleanceId, string status, uint256 timestamp)",
	// Event for Doleance Initial Description Hash
	"event DoleanceCreated(bytes32 indexed recordId, uint256 doleanceId, bytes32 descriptionHash, uint256 timestamp)",

	// --- Placeholder Functions ---
	// These functions would emit the events above. The actual implementation depends on the contract logic.

	// Function to record intervention status update
	"function recordInterventionStatus(bytes32 recordId, uint256 interventionId, string status)",
	// Function to record validated intervention cost
	"function recordInterventionCost(bytes32 recordId, uint256 interventionId, uint256 finalCost)",
	// Function to record doleance status update
	"function recordDoleanceStatus(bytes32 recordId, uint256 doleanceId, string status)",
	// Function to record doleance creation with description hash
	"function recordDoleanceCreation(bytes32 recordId, uint256 doleanceId, bytes32 descriptionHash)",
] as const; // Use const assertion for better type inference

// TODO: Replace with the actual deployed contract address
const contractAddress = process.env.SMART_CONTRACT_ADDRESS as
	| `0x${string}`
	| undefined;

if (!contractAddress) {
	console.warn(
		"Warning: SMART_CONTRACT_ADDRESS environment variable not set. Blockchain interactions will fail."
	);
}

/**
 * Generates a unique ID for the blockchain record (e.g., based on DB ID and type).
 * This needs a robust implementation depending on how you want to link off-chain and on-chain data.
 * Using a simple hash for placeholder.
 */
const generateRecordId = (type: string, id: number): Hex => {
	const data = `${type}-${id}-${Date.now()}`;
	// Simple hash, consider a more robust method like UUID or hashing more stable data
	const hash = Buffer.from(data).toString("hex");
	return `0x${hash.padEnd(64, "0").substring(0, 64)}` as Hex; // Pad/truncate to bytes32
};

/**
 * Records an intervention status update on the blockchain.
 */
export const recordInterventionStatusUpdate = async (
	interventionId: number,
	status: string
): Promise<Hex | null> => {
	if (!walletClient || !contractAddress) {
		console.error(
			"Blockchain write client or contract address not configured."
		);
		return null;
	}

	const recordId = generateRecordId("intervention_status", interventionId);

	try {
		const { request } = await publicClient.simulateContract({
			account: walletClient.account,
			address: contractAddress,
			abi: contractAbi,
			functionName: "recordInterventionStatus",
			args: [recordId, BigInt(interventionId), status],
		});
		const txHash = await walletClient.writeContract(request);
		console.log(
			`Blockchain tx sent for intervention ${interventionId} status ${status}: ${txHash}`
		);
		// Optionally wait for transaction confirmation
		// const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
		// console.log(`Blockchain tx confirmed: ${receipt.transactionHash}`);
		return txHash;
	} catch (error) {
		console.error(
			`Error recording intervention status update for ID ${interventionId} on blockchain:`,
			error
		);
		return null;
	}
};

/**
 * Records a validated intervention cost on the blockchain.
 */
export const recordInterventionValidatedCost = async (
	interventionId: number,
	finalCost: number
): Promise<Hex | null> => {
	if (!walletClient || !contractAddress) {
		console.error(
			"Blockchain write client or contract address not configured."
		);
		return null;
	}

	const recordId = generateRecordId("intervention_cost", interventionId);
	// Convert cost to smallest unit (e.g., cents if cost is in euros)
	const costInSmallestUnit = BigInt(Math.round(finalCost * 100));

	try {
		const { request } = await publicClient.simulateContract({
			account: walletClient.account,
			address: contractAddress,
			abi: contractAbi,
			functionName: "recordInterventionCost",
			args: [recordId, BigInt(interventionId), costInSmallestUnit],
		});
		const txHash = await walletClient.writeContract(request);
		console.log(
			`Blockchain tx sent for intervention ${interventionId} validated cost ${finalCost}: ${txHash}`
		);
		return txHash;
	} catch (error) {
		console.error(
			`Error recording intervention validated cost for ID ${interventionId} on blockchain:`,
			error
		);
		return null;
	}
};

/**
 * Records a public doleance status update on the blockchain.
 */
export const recordDoleanceStatusUpdate = async (
	doleanceId: number,
	status: string
): Promise<Hex | null> => {
	if (!walletClient || !contractAddress) {
		console.error(
			"Blockchain write client or contract address not configured."
		);
		return null;
	}

	const recordId = generateRecordId("doleance_status", doleanceId);

	try {
		const { request } = await publicClient.simulateContract({
			account: walletClient.account,
			address: contractAddress,
			abi: contractAbi,
			functionName: "recordDoleanceStatus",
			args: [recordId, BigInt(doleanceId), status],
		});
		const txHash = await walletClient.writeContract(request);
		console.log(
			`Blockchain tx sent for doleance ${doleanceId} status ${status}: ${txHash}`
		);
		return txHash;
	} catch (error) {
		console.error(
			`Error recording doleance status update for ID ${doleanceId} on blockchain:`,
			error
		);
		return null;
	}
};

/**
 * Records the hash of the initial doleance description on the blockchain.
 */
export const recordDoleanceCreationHash = async (
	doleanceId: number,
	descriptionHash: Hex
): Promise<Hex | null> => {
	if (!walletClient || !contractAddress) {
		console.error(
			"Blockchain write client or contract address not configured."
		);
		return null;
	}

	const recordId = generateRecordId("doleance_create", doleanceId);

	try {
		const { request } = await publicClient.simulateContract({
			account: walletClient.account,
			address: contractAddress,
			abi: contractAbi,
			functionName: "recordDoleanceCreation",
			args: [recordId, BigInt(doleanceId), descriptionHash],
		});
		const txHash = await walletClient.writeContract(request);
		console.log(
			`Blockchain tx sent for doleance ${doleanceId} creation hash: ${txHash}`
		);
		return txHash;
	} catch (error) {
		console.error(
			`Error recording doleance creation hash for ID ${doleanceId} on blockchain:`,
			error
		);
		return null;
	}
};

// TODO: Add functions to query events from the blockchain if needed for verification/display
