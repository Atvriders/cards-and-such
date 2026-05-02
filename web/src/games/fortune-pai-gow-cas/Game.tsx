import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasState, CasAction, CasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";

export function CasGame({ state, dispatch, onGameOver }: GameProps<CasState, CasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="fpg-c-wrap"><h3>Fortune Pai Gow</h3><div className="fpg-c-done"><h2>Done!</h2><div className="fpg-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="fpg-c-wrap">
      <h3>Fortune Pai Gow</h3>
      <div className="fpg-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="fpg-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="fpg-c-row">
          <div className={`fpg-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`fpg-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`fpg-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-fortune-pai-gow-cas-primary" className="fpg-c-btn" onClick={() => dispatch({ type: "play" } as CasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="fpg-c-result">{state.result}</div>
        <button className="fpg-c-btn alt" onClick={() => dispatch({ type: "next" } as CasAction)}>Next</button>
      </>}
    </div>
  );
}
