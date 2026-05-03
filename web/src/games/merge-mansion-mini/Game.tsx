import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MergeMansionMiniState, MergeMansionMiniAction, MergeMansionMiniSettings } from "./state.js";
import { isTerminal, MAX_MOVES } from "./state.js";
import "./Game.css";

const TIER_ICON = ["", "🌱", "🌿", "🌳", "🍎", "🌟", "💎", "👑"];
const TIER_COLOR = ["#e2e8f0", "#a7f3d0", "#86efac", "#4ade80", "#facc15", "#fbbf24", "#a78bfa", "#f472b6"];

export function MergeMansionMiniGame({ state, dispatch, onGameOver }: GameProps<MergeMansionMiniState, MergeMansionMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mrgmns-wrap">
        <div className="mrgmns-done">
          <h2>Board Full!</h2>
          <div className="mrgmns-stats">Best tier: {state.best} • Moves: {state.movesUsed}</div>
          <div className="mrgmns-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mrgmns-wrap">
      <div className="mrgmns-header">
        <span className="mrgmns-info">Moves: {state.movesUsed}/{MAX_MOVES}</span>
        <span className="mrgmns-next" style={{ background: TIER_COLOR[state.next] }}>{TIER_ICON[state.next]}</span>
        <span className="mrgmns-score">{state.score}</span>
      </div>
      <div className="mrgmns-grid">
        {state.grid.map((row, r) => row.map((v, c) => (
          <button data-testid="hint-target-merge-mansion-mini-action" key={`${r}-${c}`} className="mrgmns-cell"
            disabled={v !== 0}
            style={{ background: v ? TIER_COLOR[v] : "#f1f5f9" }}
            onClick={() => dispatch({ type: "place", row: r, col: c } as MergeMansionMiniAction)}>
            {v ? TIER_ICON[v] : ""}
          </button>
        )))}
      </div>
      <div className="mrgmns-hint">Place tiles next to matching ones to merge into higher tiers</div>
    </div>
  );
}
