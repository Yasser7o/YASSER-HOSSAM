import { KPIDefinition, KPIStatus, TrendDirection } from '../types';

/**
 * Deterministic, safe mathematical evaluator for HR KPI formulas.
 * Avoids eval() and supports safe tokenization and calculation.
 */

export interface CalculationResult {
  value: number;
  status: KPIStatus;
  variance: number;
  percentageDeviation: number;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Safely evaluates a mathematical expression with variable replacements
 */
export function evaluateFormula(
  formula: string,
  variables: Record<string, number>
): { value: number; isError: boolean; errorMessage?: string } {
  try {
    // 1. Clean formula string
    let expr = formula.trim();

    // Check for explicit common formula tokens
    // Replace variable names with their numeric values
    // Sort keys by length descending to avoid partial variable name clashes
    const sortedKeys = Object.keys(variables).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      const val = variables[key];
      if (val === undefined || isNaN(val)) {
        return { value: 0, isError: true, errorMessage: `Missing required variable: ${key}` };
      }
      // Replace all occurrences of key (whole words or exact matches)
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
      expr = expr.replace(regex, `(${val})`);
    }

    // Check for remaining alphabetic variable names that weren't resolved
    const unresolved = expr.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
    if (unresolved && unresolved.length > 0) {
      // Filter out mathematical operators like 'min', 'max', 'abs' if supported
      const invalidTokens = unresolved.filter(t => !['min', 'max', 'abs', 'round'].includes(t.toLowerCase()));
      if (invalidTokens.length > 0) {
        return {
          value: 0,
          isError: true,
          errorMessage: `Unresolved formula terms: ${invalidTokens.join(', ')}`,
        };
      }
    }

    // 2. Safe AST / Recursive Descent Arithmetic Parser
    const evaluated = parseArithmetic(expr);
    if (isNaN(evaluated) || !isFinite(evaluated)) {
      return { value: 0, isError: true, errorMessage: 'Division by zero or invalid calculation result' };
    }

    // Round to 2 decimal places standard for enterprise KPIs
    const rounded = Math.round((evaluated + Number.EPSILON) * 100) / 100;
    return { value: rounded, isError: false };
  } catch (err: any) {
    return { value: 0, isError: true, errorMessage: err.message || 'Calculation failed' };
  }
}

/**
 * Recursive descent arithmetic parser for +, -, *, /, parentheses
 * Safe from malicious injections
 */
function parseArithmetic(expression: string): number {
  // Strip spaces
  const str = expression.replace(/\s+/g, '');
  let pos = 0;

  function peek(): string {
    return str.charAt(pos);
  }

  function get(): string {
    return str.charAt(pos++);
  }

  function parseNumber(): number {
    let numStr = '';
    while (pos < str.length && ((peek() >= '0' && peek() <= '9') || peek() === '.')) {
      numStr += get();
    }
    if (numStr === '') {
      throw new Error(`Expected number at character ${pos}`);
    }
    return parseFloat(numStr);
  }

  function parseFactor(): number {
    if (peek() === '(') {
      get(); // consume '('
      const val = parseExpression();
      if (peek() === ')') {
        get(); // consume ')'
      } else {
        throw new Error("Missing closing parenthesis ')'");
      }
      return val;
    } else if (peek() === '-') {
      get(); // unary minus
      return -parseFactor();
    } else if (peek() === '+') {
      get(); // unary plus
      return parseFactor();
    }
    return parseNumber();
  }

  function parseTerm(): number {
    let result = parseFactor();
    while (pos < str.length) {
      const op = peek();
      if (op === '*' || op === '/') {
        get();
        const next = parseFactor();
        if (op === '*') {
          result = result * next;
        } else {
          if (next === 0) {
            throw new Error('Division by zero');
          }
          result = result / next;
        }
      } else {
        break;
      }
    }
    return result;
  }

  function parseExpression(): number {
    let result = parseTerm();
    while (pos < str.length) {
      const op = peek();
      if (op === '+' || op === '-') {
        get();
        const next = parseTerm();
        if (op === '+') {
          result = result + next;
        } else {
          result = result - next;
        }
      } else {
        break;
      }
    }
    return result;
  }

  const ans = parseExpression();
  if (pos < str.length) {
    throw new Error(`Unexpected character '${peek()}' at ${pos}`);
  }
  return ans;
}

/**
 * Computes performance status comparing actual value to target value
 */
export function determineKPIStatus(
  actual: number,
  target: number,
  trendDirection: TrendDirection,
  warningTolerancePct: number = 0.15, // 15% warning margin
  criticalTolerancePct: number = 0.30 // 30% critical margin
): { status: KPIStatus; variance: number; percentageDeviation: number } {
  if (isNaN(actual) || actual === null || actual === undefined) {
    return { status: 'Insufficient Data', variance: 0, percentageDeviation: 0 };
  }

  const variance = Math.round((actual - target + Number.EPSILON) * 100) / 100;
  const pctDeviation = target !== 0 
    ? Math.round(((actual - target) / Math.abs(target)) * 10000) / 100 
    : 0;

  if (trendDirection === 'Lower is better') {
    // Target = 10%. If actual is 9% -> On Track. If actual is 11% (within 15%) -> At Risk. If 14% -> Off Track.
    if (actual <= target) {
      return { status: 'On Track', variance, percentageDeviation: pctDeviation };
    } else if (actual <= target * (1 + warningTolerancePct)) {
      return { status: 'At Risk', variance, percentageDeviation: pctDeviation };
    } else {
      return { status: 'Off Track', variance, percentageDeviation: pctDeviation };
    }
  } else if (trendDirection === 'Higher is better') {
    // Target = 80%. If actual is 85% -> On Track. If actual is 72% -> At Risk. If actual is 50% -> Off Track.
    if (actual >= target) {
      return { status: 'On Track', variance, percentageDeviation: pctDeviation };
    } else if (actual >= target * (1 - warningTolerancePct)) {
      return { status: 'At Risk', variance, percentageDeviation: pctDeviation };
    } else {
      return { status: 'Off Track', variance, percentageDeviation: pctDeviation };
    }
  } else {
    // Stable / Range target
    const absDiff = Math.abs(actual - target);
    const tolWarning = Math.abs(target) * warningTolerancePct;
    const tolCritical = Math.abs(target) * criticalTolerancePct;

    if (absDiff <= tolWarning) {
      return { status: 'On Track', variance, percentageDeviation: pctDeviation };
    } else if (absDiff <= tolCritical) {
      return { status: 'At Risk', variance, percentageDeviation: pctDeviation };
    } else {
      return { status: 'Off Track', variance, percentageDeviation: pctDeviation };
    }
  }
}

/**
 * Ratio Aggregator:
 * Calculates aggregate values across multiple time periods or departments
 * by properly summing numerators and denominators first (no unweighted average of percentages).
 */
export function aggregateRatioKPI(
  submissions: Array<{ numerator: number; denominator: number; multiplier?: number }>
): { aggregatedValue: number; totalNumerator: number; totalDenominator: number } {
  let totalNumerator = 0;
  let totalDenominator = 0;
  const multiplier = submissions[0]?.multiplier || 100;

  for (const item of submissions) {
    totalNumerator += item.numerator || 0;
    totalDenominator += item.denominator || 0;
  }

  if (totalDenominator === 0) {
    return { aggregatedValue: 0, totalNumerator, totalDenominator };
  }

  const aggregatedValue = Math.round(((totalNumerator / totalDenominator) * multiplier + Number.EPSILON) * 100) / 100;
  return { aggregatedValue, totalNumerator, totalDenominator };
}
