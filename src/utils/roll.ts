export function rollTest({
  attributeValue,
  cd = 4,
}: {
  attributeValue: number;
  cd?: number;
}): { hits: number; rolls: number[] } {
  const diceCount = Math.floor(attributeValue / 4);
  const rolls = Array.from(
    { length: diceCount },
    () => Math.floor(Math.random() * 6) + 1
  );

  let hits = rolls.reduce((acc, val) => {
    if (val === 1) return acc - 1;
    if (val >= cd) return acc + 1;
    return acc;
  }, 0);

  hits = Math.max(0, hits);

  return { hits, rolls };
}

export function isAdjacent(
  a: { x: number; y: number },
  b: { x: number; y: number }
) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx <= 1 && dy <= 1 && (dx !== 0 || dy !== 0);
}
