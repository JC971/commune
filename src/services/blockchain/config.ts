import { createPublicClient, http, createWalletClient, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains"; // Example chains, replace with actual target chain

// TODO: Replace with actual chain configuration (private/consortium or L2)
// Example using Sepolia testnet
const targetChain: Chain = sepolia;

// TODO: Load RPC URL and Private Key from environment variables for security
const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"; // Default to local node
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY as
	| `0x${string}`
	| undefined;

if (!deployerPrivateKey) {
	console.warn(
		"Warning: DEPLOYER_PRIVATE_KEY environment variable not set. Blockchain transactions will not be signed."
	);
	// Potentially throw an error or use a read-only client if signing is always required
}

// Public client for reading data from the blockchain
export const publicClient = createPublicClient({
	chain: targetChain,
	transport: http(rpcUrl),
});

// Wallet client for sending transactions (writing data)
// Requires a private key for the account that will pay for gas
const account = deployerPrivateKey
	? privateKeyToAccount(deployerPrivateKey)
	: undefined;

export const walletClient = account
	? createWalletClient({
			account,
			chain: targetChain,
			transport: http(rpcUrl),
	  })
	: null; // Set to null if no private key is available

console.log(
	`Blockchain service configured for chain: ${targetChain.name} (ID: ${targetChain.id}) via RPC: ${rpcUrl}`
);
if (walletClient) {
	console.log(
		`Wallet client configured for account: ${walletClient.account.address}`
	);
} else {
	console.log(
		"Wallet client not configured (no private key found). Read-only mode or unsigned transactions only."
	);
}
