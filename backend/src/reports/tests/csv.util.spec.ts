import { toCsv } from '../utils/csv.util';

describe('toCsv', () => {
  it('builds a header row and data rows', () => {
    const csv = toCsv(
      ['name', 'roas'],
      [
        { name: 'Meta', roas: 0.6 },
        { name: 'Google', roas: 2.5 },
      ],
    );
    expect(csv).toBe('name,roas\nMeta,0.6\nGoogle,2.5');
  });

  it('escapes values containing commas, quotes or newlines', () => {
    const csv = toCsv(
      ['name'],
      [{ name: 'Frio, Warm' }, { name: 'dice "hola"' }],
    );
    expect(csv).toBe('name\n"Frio, Warm"\n"dice ""hola"""');
  });

  it('renders empty cells for missing keys', () => {
    const csv = toCsv(['a', 'b'], [{ a: 1 }]);
    expect(csv).toBe('a,b\n1,');
  });
});
