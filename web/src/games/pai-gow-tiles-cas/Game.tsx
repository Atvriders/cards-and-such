import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function CasGame({ state, dispatch, onGameOver }: GameProps<CasState, CasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="pgt-c-wrap"><h3>Pai Gow Tiles (Casino)</h3><div className="pgt-c-done"><h2>Done!</h2><div className="pgt-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="pgt-c-wrap">
      <h3>Pai Gow Tiles (Casino)</h3>
      <div className="pgt-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="pgt-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="pgt-c-row">
          <div className={`pgt-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`pgt-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`pgt-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-pai-gow-tiles-cas-primary" className="pgt-c-btn" onClick={() => dispatch({ type: "play" } as CasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="pgt-c-result">{state.result}</div>
        <button className="pgt-c-btn alt" onClick={() => dispatch({ type: "next" } as CasAction)}>Next</button>
      </>}
    </div>
  );
}
