import type { GameHint } from "./types.js";

/**
 * Generic, pattern-based hint inference for games that don't define their own
 * `getHint`. Recognises common shapes:
 *
 *  - Quiz games: state has `questions: { correct: number; choices: ... }[]`,
 *    `currentIndex: number`, `selected: number | null`, optionally `submitted`.
 *    Hint: pick a random *wrong* choice to eliminate.
 *
 *  - Sudoku/grid logic puzzles: state has `current: number[]`, `solution:
 *    number[]`, and `given: number[]` (all length 81). Hint: reveal one empty
 *    cell.
 *
 *  - Generic logic puzzles: state has `cells` plus a `solution` array of the
 *    same shape — reveal the first incorrect/empty cell.
 *
 * Returns null if no pattern matches or no hint is meaningful.
 */
export function inferHint(state: unknown): GameHint | null {
  if (!state || typeof state !== "object") return null;
  const s = state as Record<string, unknown>;

  // --- Quiz pattern -------------------------------------------------------
  if (Array.isArray(s.questions) && typeof s.currentIndex === "number") {
    const questions = s.questions as Array<{
      correct?: number;
      choices?: unknown[];
    }>;
    const idx = s.currentIndex as number;
    const q = questions[idx];
    if (q && Array.isArray(q.choices) && typeof q.correct === "number") {
      // Don't hint after submission
      if (s.submitted === true || s.phase === "result" || s.phase === "done") {
        return null;
      }
      const wrongIdxs: number[] = [];
      for (let i = 0; i < q.choices.length; i++) {
        if (i !== q.correct) wrongIdxs.push(i);
      }
      if (wrongIdxs.length === 0) return null;
      // Deterministic: pick first wrong index that isn't already the user's
      // selection (so eliminating doesn't remove their pick).
      const selected = typeof s.selected === "number" ? s.selected : null;
      const pick =
        wrongIdxs.find((i) => i !== selected) ?? wrongIdxs[0]!;
      const labels = ["A", "B", "C", "D", "E", "F"];
      const label = labels[pick] ?? String(pick + 1);
      return {
        message: `Eliminate one wrong answer: ${label} is incorrect.`,
        eliminatedChoice: pick,
      };
    }
  }

  // --- Sudoku pattern -----------------------------------------------------
  if (
    Array.isArray(s.current) &&
    Array.isArray(s.solution) &&
    Array.isArray(s.given) &&
    (s.current as unknown[]).length === (s.solution as unknown[]).length
  ) {
    const current = s.current as number[];
    const solution = s.solution as number[];
    const given = s.given as number[];
    for (let i = 0; i < current.length; i++) {
      if (given[i] === 0 && current[i] === 0) {
        const sol = solution[i];
        if (typeof sol === "number" && sol > 0) {
          // Format as row/col when plausible (length 81 = 9x9).
          let where = `cell ${i + 1}`;
          if (current.length === 81) {
            const r = Math.floor(i / 9) + 1;
            const c = (i % 9) + 1;
            where = `row ${r}, col ${c}`;
          }
          return {
            message: `Reveal one cell: ${where} is ${sol}.`,
            revealedIndex: i,
          };
        }
      }
    }
    return null;
  }

  return null;
}
