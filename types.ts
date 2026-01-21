
export enum NetworkType {
  DEVNET = 'Devnet',
  TESTNET = 'Testnet',
  MAINNET = 'Mainnet'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed'
}

export interface WalletState {
  address: string;
  shieldedAddress: string;
  unshieldedBalance: number;
  shieldedBalance: number;
  isConnected: boolean;
  network: NetworkType;
}

export interface TransactionRecord {
  id: string;
  timestamp: number;
  type: 'Shielded' | 'Unshielded';
  amount: number;
  recipient: string;
  status: TransactionStatus;
  hash: string;
}

export interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
