import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'COP' | 'USD';

interface CurrencyState {
    currency: Currency;
    exchangeRate: number; // Tasa estática: 1 USD = 4000 COP
    setCurrency: (c: Currency) => void;
    toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'COP', // Default
            exchangeRate: 4000,
            setCurrency: (c) => set({ currency: c }),
            toggleCurrency: () => set((state) => ({
                currency: state.currency === 'COP' ? 'USD' : 'COP'
            })),
        }),
        {
            name: 'financial-currency-storage',
        }
    )
);
