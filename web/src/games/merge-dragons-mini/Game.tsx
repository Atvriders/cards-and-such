import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MergeDragonsMiniState, MergeDragonsMiniAction, MergeDragonsMiniSettings } from "./state.js";
import { isTerminal, MAX_MOVES } from "./state.js";
import "./Game.css";

const TIER_ICON = ["", "🌱", "🌿", "🌳", "🍎", "🌟", "💎", "👑"];
const TIER_COLOR = ["#e2e8f0", "#a7f3d0", "#86efac", "#4ade80", "#facc15", "#fbbf24", "#a78bfa", "#f472b6"];

export function MergeDragonsMiniGame({ state, dispatch, onGameOver }: GameProps<MergeDragonsMiniState, MergeDragonsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mrgdrg-wrap">
        <div className="mrgdrg-done">
          <h2>Board Full!</h2>
          <div className="mrgdrg-stats">Best tier: {state.best} • Moves: {state.movesUsed}</div>
          <div className="mrgdrg-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mrgdrg-wrap">
      <div className="mrgdrg-header">
        <span className="mrgdrg-info">Moves: {state.movesUsed}/{MAX_MOVES}</span>
        <span className="mrgdrg-next" style={{ background: TIER_COLOR[state.next] }}>{TIER_ICON[state.next]}</span>
        <span className="mrgdrg-score">{state.score}</span>
      </div>
      <div className="mrgdrg-grid">
        {state.grid.map((row, r) => row.map((v, c) => (
          <button data-testid="hint-target-merge-dragons-mini-action" key={`${r}-${c}`} className="mrgdrg-cell"
            disabled={v !== 0}
            style={{ background: v ? TIER_COLOR[v] : "#f1f5f9" }}
            onClick={() => dispatch({ type: "place", row: r, col: c } as MergeDragonsMiniAction)}>
            {v ? TIER_ICON[v] : ""}
          </button>
        )))}
      </div>
      <div className="mrgdrg-hint">Place tiles next to matching ones to merge into higher tiers</div>
    </div>
  );
}
