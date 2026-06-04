export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0;
    return this.state / 0xffffffff;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  weighted<T>(entries: readonly [T, number][]): T {
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = this.next() * total;
    for (const [item, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return item;
    }
    return entries[entries.length - 1][0];
  }
}
