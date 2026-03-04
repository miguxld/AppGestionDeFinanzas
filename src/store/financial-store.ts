"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FinancialState {
    // Period Management
    month: number;
    year: number;
    setPeriod: (month: number, year: number) => void;
    nextMonth: () => void;
    prevMonth: () => void;

    // Currency Management
    currency: string;
    setCurrency: (currency: string) => void;

    // UI state (e.g., balance visibility)
    hideValues: boolean;
    setHideValues: (hide: boolean) => void;
}

export const useFinancialStore = create<FinancialState>()(
    persist(
        (set) => ({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            currency: "COP",
            hideValues: false,

            setPeriod: (month, year) => set({ month, year }),

            nextMonth: () => set((state) => {
                if (state.month === 12) {
                    return { month: 1, year: state.year + 1 };
                }
                return { month: state.month + 1 };
            }),

            prevMonth: () => set((state) => {
                if (state.month === 1) {
                    return { month: 12, year: state.year - 1 };
                }
                return { month: state.month - 1 };
            }),

            setCurrency: (currency) => set({ currency }),
            setHideValues: (hide) => set({ hideValues: hide }),
        }),
        {
            name: "financial-storage",
        }
    )
);
