import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyGlobal(val: number, currency: 'COP' | 'USD' = 'COP', exchangeRate: number = 4000) {
  let finalValue = val;
  let currencyCode = 'COP';

  if (currency === 'USD') {
    finalValue = val / exchangeRate;
    currencyCode = 'USD';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(finalValue);
}
