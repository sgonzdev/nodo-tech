function escape(value: unknown): string {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(
  headers: string[],
  rows: Record<string, unknown>[],
): string {
  const head = headers.map(escape).join(',');
  const body = rows
    .map((row) => headers.map((h) => escape(row[h])).join(','))
    .join('\n');
  return `${head}\n${body}`;
}
