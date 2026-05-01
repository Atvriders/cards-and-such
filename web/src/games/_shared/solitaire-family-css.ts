/**
 * Returns a CSS string parameterised by the game's unique class prefix and
 * felt colour.  Imported by each per-game `state.ts` only at the type level;
 * at runtime each game has a tiny `Game.css` that hand-rolls the same
 * prefix.  Centralising the template keeps look and feel consistent.
 */
export function buildSolitaireFamilyCss(prefix: string, felt = "#0d5e3a"): string {
  return `
.${prefix}-root { padding: 12px; min-height: 480px; background: ${felt}; color: #fff; border-radius: 8px; }
.${prefix}-info { display: flex; gap: 18px; align-items: center; padding-bottom: 8px; font-size: 14px; }
.${prefix}-auto { background: rgba(255,255,255,0.18); color: #fff; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; }
.${prefix}-auto:hover { background: rgba(255,255,255,0.32); }
.${prefix}-top { display: flex; gap: 10px; align-items: flex-start; padding-bottom: 14px; }
.${prefix}-spacer { flex: 1; }
.${prefix}-tableau { display: flex; gap: 10px; align-items: flex-start; }
.${prefix}-col, .${prefix}-stock, .${prefix}-waste, .${prefix}-foundation { min-width: 60px; }
.${prefix}-root.has-won { box-shadow: inset 0 0 60px gold; }
`;
}
