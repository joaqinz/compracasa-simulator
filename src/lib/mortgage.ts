export function calculateMonthlyPaymentUF(
  loanAmountUF: number,
  annualRatePct: number,
  termYears: number
): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loanAmountUF / n;
  const factor = Math.pow(1 + r, n);
  return loanAmountUF * (r * factor) / (factor - 1);
}

export function reverseMaxLoanUF(
  maxDividendUF: number,
  annualRatePct: number,
  termYears: number
): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return maxDividendUF * n;
  const factor = Math.pow(1 + r, n);
  return maxDividendUF * (factor - 1) / (r * factor);
}

export function calculateFullDividendUF(
  baseDividendUF: number,
  monthlyInsuranceUF: number
): number {
  return baseDividendUF + monthlyInsuranceUF;
}

export function calculateRequiredIncomeUF(
  fullDividendUF: number,
  maxDividendIncomeRatioPct: number
): number {
  return fullDividendUF / (maxDividendIncomeRatioPct / 100);
}

export function calculateDownPaymentUF(
  propertyPriceUF: number,
  downPaymentPct: number
): number {
  return propertyPriceUF * (downPaymentPct / 100);
}

export function calculateLoanAmountUF(
  propertyPriceUF: number,
  downPaymentPct: number
): number {
  return propertyPriceUF * (1 - downPaymentPct / 100);
}
