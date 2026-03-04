import { describe, it, expect, beforeEach } from 'vitest';
import { useCurrencyStore } from './currency-store';

describe('useCurrencyStore', () => {
    beforeEach(() => {
        useCurrencyStore.setState({
            currency: 'COP',
            exchangeRate: 4000
        });
    });

    it('should initialize with COP', () => {
        expect(useCurrencyStore.getState().currency).toBe('COP');
    });

    it('should set currency', () => {
        useCurrencyStore.getState().setCurrency('USD');
        expect(useCurrencyStore.getState().currency).toBe('USD');
    });

    it('should toggle currency between COP and USD', () => {
        const store = useCurrencyStore.getState();
        store.toggleCurrency();
        expect(useCurrencyStore.getState().currency).toBe('USD');
        useCurrencyStore.getState().toggleCurrency();
        expect(useCurrencyStore.getState().currency).toBe('COP');
    });
});
