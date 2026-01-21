
/**
 * HOW TO RUN:
 * npx ts-node test-script.ts
 */

import { midnightService } from './services/midnightService';

async function runTests() {
  console.log('--- Midnight Wallet Script Test ---');
  
  try {
    // 1. Connection
    console.log('Connecting to Midnight Devnet...');
    const wallet = await midnightService.connectWallet();
    console.log(`Connected Address: ${wallet.address}`);
    console.log(`Shielded Balance: ${wallet.shieldedBalance} DUST`);

    // 2. Fetch Balance
    console.log('Refreshing balances...');
    const unshielded = await midnightService.getBalance(wallet.address, false);
    console.log(`Unshielded: ${unshielded}`);

    // 3. Test Transfer
    const testRecipient = 'midnight1test_recipient_address_001';
    const amount = 50.5;
    console.log(`Initiating unshielded transfer of ${amount} to ${testRecipient}...`);
    
    const tx = await midnightService.transfer(wallet.address, testRecipient, amount, false);
    console.log(`Transaction Success! Hash: ${tx.hash}`);

    console.log('--- Test Suite Completed ---');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Check if running in Node environment for ts-node support
if (typeof window === 'undefined') {
  runTests();
}
