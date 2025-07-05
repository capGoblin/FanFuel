import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: string | null;
  connect: (address: string, walletType: string) => void;
  disconnect: () => void;
}

export const useStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  walletType: null,
  connect: (address: string, walletType: string) =>
    set({ isConnected: true, address, walletType }),
  disconnect: () =>
    set({ isConnected: false, address: null, walletType: null }),
}));