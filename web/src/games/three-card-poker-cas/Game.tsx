import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeCardPokerCasState, ThreeCardPokerCasAction, ThreeCardPokerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ThreeCardPokerCasGame({ state, dispatch, onGameOver }: GameProps<ThreeCardPokerCasState, ThreeCardPokerCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tcp-c-wrap"><h3>Three Card Poker (Casino)</h3><div className="tcp-c-done"><h2>Done!</h2><div className="tcp-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="tcp-c-wrap">
      <h3>Three Card Poker (Casino)</h3>
      <div className="tcp-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="tcp-c-score">{state.score} pts</div>
      {state.cardA !== null && state.cardB !== null && state.cardC !== null && (
        <div className="tcp-c-row">
          <div className={`tcp-c-card ${isRed(state.cardA) ? "red" : "black"}`}>{cardName(state.cardA)}</div>
          <div className={`tcp-c-card ${isRed(state.cardB) ? "red" : "black"}`}>{cardName(state.cardB)}</div>
          <div className={`tcp-c-card ${isRed(state.cardC) ? "red" : "black"}`}>{cardName(state.cardC)}</div>
        </div>
      )}
      {state.phase === "ready" && <button className="tcp-c-btn" onClick={() => dispatch({ type: "play" } as ThreeCardPokerCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="tcp-c-result">{state.result}</div>
        <button className="tcp-c-btn alt" onClick={() => dispatch({ type: "next" } as ThreeCardPokerCasAction)}>Next</button>
      </>}
    </div>
  );
}
