export const COLORS = [
  '#3b5bdb','#0ca678','#f76707','#ae3ec9','#e64980',
  '#1971c2','#2f9e44','#d9480f','#6741d9','#c2255c',
  '#0c8599','#5f3dc4','#087f5b','#862e9c','#a61e4d',
];

export function getTaskColor(us: string): string {
  let hash = 0;
  for (let i = 0; i < us.length; i++) {
    hash = us.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return COLORS[hash % COLORS.length];
}
