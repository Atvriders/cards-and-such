import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSpiralState, CardSpiralAction, CardSpiralSettings } from "./state.js";
import { isTerminal, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
function rankLabel(r: number): string { return r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r); }
export function CardSpiralGame({ state, dispatch, onGameOver }: GameProps<CardSpiralState, CardSpiralSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="csp-wrap"><div className="csp-done bounce-in"><h2>Spiral Complete!</h2><div className="csp-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="csp-wrap fade-in">
      <div className="csp-header">Draw {state.drew} / {TOTAL_DRAWS} <span className="csp-score pulse">{state.score}</span></div>
      <div className="csp-spiral">
        {state.spiral.map(c => (
          <div key={c.id} className="csp-card-mini">{rankLabel(c.rank)}</div>
        ))}
      </div>
      {state.drawn ? (
        <div className="csp-current">
          <div className="csp-card-big">{rankLabel(state.drawn.rank)}</div>
          <div className="csp-actions">
            <button data-testid="hint-target-card-spiral-keep" className="csp-btn keep" onClick={() => dispatch({ type:"keep" } as CardSpiralAction)}>Keep</button>
            <button className="csp-btn skip" onClick={() => dispatch({ type:"discard" } as CardSpiralAction)}>Discard</button>
          </div>
        </div>
      ) : (
        <button data-testid="hint-target-card-spiral-primary" className="csp-btn draw" onClick={() => dispatch({ type:"draw" } as CardSpiralAction)}>Draw Card</button>
      )}
    </div>
  );
}
