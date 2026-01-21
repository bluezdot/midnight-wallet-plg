
import { WalletState, TransactionRecord, TransactionStatus, NetworkType } from '../types';

export class MidnightService {
  private static instance: MidnightService;
  
  private constructor() {}

  public static getInstance(): MidnightService {
    if (!MidnightService.instance) {
      MidnightService.instance = new MidnightService();
    }
    return MidnightService.instance;
  }

  async connectWallet(): Promise<WalletState> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      address: 'unshielded_midnight1q8y9u2h5jxwa8n0p...',
      shieldedAddress: 'shielded_mn1zxp9v8y2lx087scda...',
      unshieldedBalance: 1250.75,
      shieldedBalance: 5000.00,
      isConnected: true,
      network: NetworkType.DEVNET
    };
  }

  async getBalance(address: string, isShielded: boolean): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return isShielded ? 5000.00 : 1250.75;
  }

  /**
   * Simulates the Midnight transaction process: 
   * 1. Build tx body
   * 2. Generate ZK Proof (if shielded)
   * 3. Sign and submit
   */
  async transfer(
    from: string, 
    to: string, 
    amount: number, 
    isShielded: boolean,
    onProgress?: (stage: string) => void
  ): Promise<TransactionRecord> {
    onProgress?.("Building transaction components...");
    await new Promise(r => setTimeout(r, 600));

    if (isShielded) {
      onProgress?.("Generating ZK-Proof (Compact contract)...");
      // Simulate proof calculation time
      await new Promise(r => setTimeout(r, 2500));
      onProgress?.("Proof generated. Adding nullifiers to state...");
      await new Promise(r => setTimeout(r, 800));
    } else {
      onProgress?.("Signing public transaction...");
      await new Promise(r => setTimeout(r, 1000));
    }

    onProgress?.("Submitting to Midnight Devnet...");
    await new Promise(r => setTimeout(r, 1200));

    return {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type: isShielded ? 'Shielded' : 'Unshielded',
      amount,
      recipient: to,
      status: TransactionStatus.SUCCESS,
      hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
  }
}

export const midnightService = MidnightService.getInstance();
