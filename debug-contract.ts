import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
});

const CONTRACT_ADDRESS = '0x651a242f3b09f4846adA583D3C2103069D9635F0';

const abi = parseAbi([
    'function isAvailable(string name) view returns (bool)'
]);

async function checkContract() {
    console.log(`Checking contract at ${CONTRACT_ADDRESS} on Base Sepolia...`);

    try {
        const code = await client.getBytecode({ address: CONTRACT_ADDRESS });
        console.log('Bytecode result:', code ? 'Found' : 'Not Found');

        if (!code || code === '0x') {
            console.error('ERROR: No bytecode found.');
            return;
        }

        console.log('Calling isAvailable("nizan")...');
        const result = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: abi,
            functionName: 'isAvailable',
            args: ['nizan']
        });
        console.log('Result:', result);

    } catch (error) {
        console.error('Error calling contract:', error);
    }
}

checkContract();
