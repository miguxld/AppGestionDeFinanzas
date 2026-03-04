import { describe, it, expect, beforeEach } from 'vitest';
import { useFinancialStore } from './financial-store';

describe('useFinancialStore', () => {
    beforeEach(() => {
        // Reset store state before each test if necessary
        // Note: Zustand persist might need manual clearing in tests
        useFinancialStore.setState({
            month: 1,
            year: 2024,
            currency: 'COP',
            hideValues: false
        });
    });

    it('should initialize with default values', () => {
        const state = useFinancialStore.getState();
        expect(state.month).toBe(1);
        expect(state.year).toBe(2024);
        expect(state.currency).toBe('COP');
    });

    it('should update period', () => {
        useFinancialStore.getState().setPeriod(5, 2025);
        const state = useFinancialStore.getState();
        expect(state.month).toBe(5);
        expect(state.year).toBe(2025);
    });

    it('should increment month correctly', () => {
        useFinancialStore.getState().nextMonth();
        expect(useFinancialStore.getState().month).toBe(2);
    });

    it('should wrap around to next year on December', () => {
        useFinancialStore.setState({ month: 12, year: 2024 });
        useFinancialStore.getState().nextMonth();
        const state = useFinancialStore.getState();
        expect(state.month).toBe(1);
        expect(state.year).toBe(2025);
    });

    it('should decrement month correctly', () => {
        useFinancialStore.setState({ month: 2, year: 2024 });
        useFinancialStore.getState().prevMonth();
        expect(useFinancialStore.getState().month).toBe(1);
    });

    it('should wrap around to previous year on January', () => {
        useFinancialStore.setState({ month: 1, year: 2024 });
        useFinancialStore.getState().prevMonth();
        const state = useFinancialStore.getState();
        expect(state.month).toBe(12);
        expect(state.year).toBe(2023);
    });

    it('should toggle hideValues', () => {
        useFinancialStore.getState().setHideValues(true);
        expect(useFinancialStore.getState().hideValues).toBe(true);
    });
});
