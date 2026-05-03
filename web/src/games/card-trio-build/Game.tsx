import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTrioBuildState, CardTrioBuildAction, CardTrioBuildSettings } from "./state.js";
import { isTerminal, TOTAL_DRAWS, HAND_LIMIT } from "./state.js";
import "./Game.css";
function rankLabel(r: number): string { return r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r); }
export function CardTrioBuildGame({ state, dispatch, onGameOver }: GameProps<CardTrioBuildState, CardTrioBuildSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ctb-wrap"><div className="ctb-done"><h2>Done!</h2><div>Trios formed: {state.trios}</div><div className="ctb-final">{t?.score} pts</div></div></div>;
  }
  // count by rank for build buttons
  const counts: Record<number, number> = {};
  for (const c of state.hand) counts[c.rank] = (counts[c.rank] ?? 0) + 1;
  const buildable = Object.entries(counts).filter(([_, n]) => n >= 3).map(([r]) => parseInt(r, 10));
  return (
    <div className="ctb-wrap">
      <div className="ctb-header">Draws {state.drew}/{TOTAL_DRAWS} — Trios {state.trios} <span className="ctb-score">{state.score}</span></div>
      <div className="ctb-hand">
        {state.hand.map(c => (
          <button key={c.id} className="ctb-card" onClick={() => dispatch({ type:"discard", cardId: c.id } as CardTrioBuildAction)}>{rankLabel(c.rank)}</button>
        ))}
      </div>
      <div className="ctb-actions">
        <button data-testid="hint-target-card-trio-build-primary" className="ctb-btn draw" disabled={state.drew >= TOTAL_DRAWS || state.hand.length >= HAND_LIMIT} onClick={() => dispatch({ type:"draw" } as CardTrioBuildAction)}>Draw</button>
        {buildable.map(r => (
          <button key={r} className="ctb-btn build" onClick={() => dispatch({ type:"build", rank: r } as CardTrioBuildAction)}>Build {rankLabel(r)} trio</button>
        ))}
      </div>
      <div className="ctb-tip">Tap a card in hand to discard it (-1).</div>
    </div>
  );
}
