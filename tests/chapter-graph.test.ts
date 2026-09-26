import { describe, it, expect } from 'vitest';
import { ALL_ACCOUNT_DEFS, isValidAccountCategory } from '../src/models/Account';
import { ENTRY_STATS } from '../src/vn/ConditionEvaluator';
import { Amount, CalcExpr, ChapterScript, ConditionDef, EntryDef, ScriptNode } from '../src/vn/types';

const chapterModules = import.meta.glob('../src/data/chapters/chapter*.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const chapters = Object.entries(chapterModules)
  .map(([path, mod]) => {
    const id = Number(/chapter(\d+)\.ts$/.exec(path)![1]);
    return { id, level: id < 100 ? 1 : id < 200 ? 2 : 3, script: mod[`chapter${id}`] as ChapterScript };
  })
  .sort((a, b) => a.id - b.id);

const chapterIds = new Set(chapters.map(c => c.id));
const accountLevels = new Map(ALL_ACCOUNT_DEFS.map(def => [def.category as string, def.level]));
const engineFlags = new Set<string>(Object.values(ENTRY_STATS));

function calcFlags(expr: CalcExpr | undefined, out: Set<string>): void {
  if (expr === undefined || typeof expr === 'number') return;
  if ('flag' in expr) out.add(expr.flag);
  else if ('op' in expr && expr.op === 'table') calcFlags(expr.of, out);
  else if ('op' in expr) expr.args.forEach(arg => calcFlags(arg, out));
}

function amountFlags(amount: Amount | undefined, out: Set<string>): void {
  if (amount !== undefined && typeof amount === 'object') out.add(amount.flag);
}

function entryFlags(entries: EntryDef[] | undefined, out: Set<string>): void {
  entries?.forEach(entry => {
    amountFlags(entry.debit, out);
    amountFlags(entry.credit, out);
  });
}

function conditionFlags(condition: ConditionDef | undefined, out: Set<string>): void {
  if (!condition) return;
  if ((condition.type === 'flag_gte' || condition.type === 'flag_lte') && condition.flag) out.add(condition.flag);
  condition.all?.forEach(inner => conditionFlags(inner, out));
}

/** Where a node continues to; a node without any is a dead end unless it ends the chapter. */
function targets(node: ScriptNode): string[] {
  switch (node.type) {
    case 'conditional':
      return [node.trueNext, node.falseNext];
    case 'choice':
      return node.choices.map(choice => choice.next);
    case 'chapter_end':
      return [];
    default:
      return [node.next];
  }
}

/** Flags a node reads as numbers; a flag read before it exists would make the calculation fall back to zero. */
function readFlags(node: ScriptNode): Set<string> {
  const out = new Set<string>();
  switch (node.type) {
    case 'transaction':
      entryFlags(node.entries, out);
      break;
    case 'journal_entry_input':
      entryFlags(node.expectedEntries, out);
      break;
    case 'calc':
      calcFlags(node.expr, out);
      break;
    case 'number_input':
      calcFlags(node.min, out);
      calcFlags(node.max, out);
      calcFlags(node.initial, out);
      Object.values(node.preview?.values ?? {}).forEach(expr => calcFlags(expr, out));
      if (node.preview) out.delete(node.flag);
      break;
    case 'conditional':
      conditionFlags(node.condition, out);
      break;
    case 'choice':
      node.choices.forEach(choice => {
        entryFlags(choice.effects?.transaction?.entries, out);
        conditionFlags(choice.requires, out);
      });
      break;
    case 'chapter_end':
      node.rating?.forEach(goal => conditionFlags(goal.when, out));
      break;
  }
  return out;
}

function definedFlags(nodes: ScriptNode[]): Set<string> {
  const out = new Set<string>(engineFlags);
  for (const node of nodes) {
    if (node.type === 'set_flag') Object.keys(node.flags).forEach(flag => out.add(flag));
    if (node.type === 'calc') out.add(node.set);
    if (node.type === 'number_input') out.add(node.flag);
    if (node.type === 'choice') {
      node.choices.forEach(choice => Object.keys(choice.effects?.setFlags ?? {}).forEach(flag => out.add(flag)));
    }
  }
  return out;
}

describe.each(chapters.map(c => [c.id, c] as const))('chapter %i script', (_id, chapter) => {
  const { nodes } = chapter.script;
  const ids = new Set(nodes.map(node => node.id));

  it('has unique node ids', () => {
    expect(nodes.length).toBe(ids.size);
  });

  it('only continues to nodes that exist', () => {
    const dangling = nodes.flatMap(node =>
      targets(node)
        .filter(target => !ids.has(target))
        .map(target => `${node.id} -> ${target}`)
    );
    expect(dangling).toEqual([]);
  });

  it('only continues to a chapter that exists', () => {
    const missing = nodes.flatMap(node =>
      node.type === 'chapter_end' && node.nextChapter !== undefined && !chapterIds.has(node.nextChapter)
        ? [`${node.id} -> chapter ${node.nextChapter}`]
        : []
    );
    expect(missing).toEqual([]);
  });

  it('never reads a flag that the chapter does not set', () => {
    const defined = definedFlags(nodes);
    const unknown = nodes.flatMap(node =>
      [...readFlags(node)].filter(flag => !defined.has(flag)).map(flag => `${node.id}: ${flag}`)
    );
    expect(unknown).toEqual([]);
  });

  it('has at most three rating goals', () => {
    const tooMany = nodes.filter(node => node.type === 'chapter_end' && (node.rating?.length ?? 0) > 3).map(node => node.id);
    expect(tooMany).toEqual([]);
  });

  it('opens with accounts that exist at its level', () => {
    const bad = Object.keys(chapter.script.opening ?? {}).filter(account => {
      const level = accountLevels.get(account);
      return !isValidAccountCategory(account) || level === undefined || level > chapter.level;
    });
    expect(bad).toEqual([]);
  });
});
