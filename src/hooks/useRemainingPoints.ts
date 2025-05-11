import { useMemo } from "react";
import { BASE_ATTRIBUTES } from "../data/attributes";

export function useRemainingPoints(
  level: number,
  attributes: Record<keyof typeof BASE_ATTRIBUTES, number>,
  finalized: boolean
) {
  return useMemo(() => {
    const total = 10 + level * 6;
    const used = Object.values(attributes).reduce((a, b) => a + b, 0);
    return finalized ? Math.max(0, total - used) : total - used;
  }, [level, attributes, finalized]);
}
