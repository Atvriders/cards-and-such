import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourCardPokerCasState, FourCardPokerCasAction, FourCardPokerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function FourCardPokerCasGame({ state, dispatch, onGameOver }: GameProps<FourCardPokerCasState, FourCardPokerCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="fcp-c-wrap"><h3>Four Card Poker (Casino)</h3><div className="fcp-c-done"><h2>Done!</h2><div className="fcp-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="fcp-c-wrap">
      <h3>Four Card Poker (Casino)</h3>
      <div className="fcp-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="fcp-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="fcp-c-row">
          <div className={`fcp-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`fcp-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`fcp-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button className="fcp-c-btn" onClick={() => dispatch({ type: "play" } as FourCardPokerCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="fcp-c-result">{state.result}</div>
        <button className="fcp-c-btn alt" onClick={() => dispatch({ type: "next" } as FourCardPokerCasAction)}>Next</button>
      </>}
    </div>
  );
}
