import { Amount, CalcExpr, EntryDef, ResolvedEntry } from './types';

export interface CalcContext {
  flags: Record<string, unknown>;
  balance: (account: string) => number;
  netIncome: () => number;
}

function flagValue(name: string, flags: Record<string, unknown>): number {
  const value = flags[name];
  if (typeof value !== 'number' || Number.isNaN(value)) {
    console.error(`Calc: flag "${name}" is not a number (${String(value)})`);
    return 0;
  }
  return value;
}

export function evaluateCalc(expr: CalcExpr, ctx: CalcContext): number {
  if (typeof expr === 'number') return expr;

  if ('flag' in expr) return flagValue(expr.flag, ctx.flags);
  if ('balance' in expr) return ctx.balance(expr.balance);
  if ('netIncome' in expr) return ctx.netIncome();

  if (expr.op === 'table') {
    const input = evaluateCalc(expr.of, ctx);
    const keys = Object.keys(expr.table).map(Number).sort((a, b) => a - b);
    if (keys.length === 0) return 0;
    let picked = keys[0];
    for (const key of keys) {
      if (key <= input) picked = key;
    }
    return expr.table[picked];
  }

  const values = expr.args.map(arg => evaluateCalc(arg, ctx));
  if (values.length === 0) return 0;
  switch (expr.op) {
    case 'add':
      return values.reduce((sum, v) => sum + v, 0);
    case 'sub':
      return values.slice(1).reduce((diff, v) => diff - v, values[0]);
    case 'mul':
      return values.reduce((product, v) => product * v, 1);
    case 'div':
      return values.slice(1).reduce((quotient, v) => (v === 0 ? 0 : Math.floor(quotient / v)), values[0]);
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
  }
}

export function resolveAmount(amount: Amount | undefined, flags: Record<string, unknown>): number | undefined {
  if (amount === undefined) return undefined;
  if (typeof amount === 'number') return amount;
  return flagValue(amount.flag, flags);
}

export function resolveEntries(entries: EntryDef[], flags: Record<string, unknown>): ResolvedEntry[] {
  return entries.map(entry => ({
    account: entry.account,
    debit: resolveAmount(entry.debit, flags),
    credit: resolveAmount(entry.credit, flags),
  }));
}
