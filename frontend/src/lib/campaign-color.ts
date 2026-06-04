const PALETTE = ['#34d8a0', '#5b9dff', '#f5b13d', '#c084fc', '#3ddc84', '#ff6a6a'];

export function campaignColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function shortName(name: string, max = 16): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}
