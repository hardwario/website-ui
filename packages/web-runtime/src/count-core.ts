/**
 * Pure logic of the count-up (counter.ts, `[data-hwio-count]`), unit-tested with `node --test`.
 * The figure is rendered on the server in its final form ("7 000+", "Since 2016"); the runtime
 * counts from `from` to `to` through `template` and ends on that exact server text.
 */
export interface HWioCountSpec {
  to: number;
  from: number;
  /** Text around the number; `{n}` marks it ("{n}+", "Since {n}"). */
  template: string;
  /** Thousands separator ("" none, "\u00a0" a non-breaking space, "," ...). */
  group: string;
}

/** Reads the data attributes of a count element (`data-hwio-count`, `-from`, `-template`, `-group`). */
export function hwioParseCount(data: Record<string, string | undefined>): HWioCountSpec | null {
  const to = Number(data.hwioCount);
  if (data.hwioCount === undefined || data.hwioCount === '' || !Number.isFinite(to)) return null;
  const fromRaw = data.hwioCountFrom;
  const from = fromRaw === undefined || fromRaw === '' ? 0 : Number(fromRaw);
  return {
    to,
    from: Number.isFinite(from) ? from : 0,
    template: data.hwioCountTemplate && data.hwioCountTemplate.includes('{n}') ? data.hwioCountTemplate : '{n}',
    group: data.hwioCountGroup ?? '',
  };
}

/** Formats an integer with an optional thousands separator into the template. */
export function hwioFormatCount(n: number, template = '{n}', group = ''): string {
  const rounded = Math.round(n);
  const digits = String(Math.abs(rounded));
  const grouped = group ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, group) : digits;
  return template.replace('{n}', `${rounded < 0 ? '-' : ''}${grouped}`);
}

/** Ease-out cubic on 0..1: fast start, calm settle (the motion rule: ease-out, nothing bounces). */
export function hwioEaseOut(progress: number): number {
  const p = Math.min(Math.max(progress, 0), 1);
  return 1 - Math.pow(1 - p, 3);
}

/** The number shown at `progress` (0..1) of the count. */
export function hwioCountAt(spec: Pick<HWioCountSpec, 'from' | 'to'>, progress: number): number {
  return Math.round(spec.from + (spec.to - spec.from) * hwioEaseOut(progress));
}
