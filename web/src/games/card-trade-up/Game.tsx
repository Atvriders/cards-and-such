import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTradeUpState, CardTradeUpAction, CardTradeUpSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_TRADES } from "./state.js";
import "./Game.css";

export function CardTradeUpGame({ state, dispatch, onGameOver }: GameProps<CardTradeUpState, CardTradeUpSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ctu-wrap"><div className="ctu-done"><h2>Done!</h2><div>Net delta: {state.score}</div><div className="ctu-final">{Math.max(0, state.score)} pts</div></div></div>;
  }
  return (
    <div className="ctu-wrap">
      <div className="ctu-info">Trade {state.trade} / {TOTAL_TRADES}</div>
      <div className="ctu-score">Net: {state.score}</div>
      <div className="ctu-row">
        <div className="ctu-col">
          <div className="ctu-label">Your Card</div>
          <div className={`ctu-card ${isRed(state.current) ? "red" : "black"}`}>{cardName(state.current)}</div>
        </div>
        <div className="ctu-col">
          <div className="ctu-label">Candidate</div>
          <div className={`ctu-card ${isRed(state.candidate) ? "red" : "black"}`}>{cardName(state.candidate)}</div>
        </div>
      </div>
      <div className="ctu-row">
        <button className="ctu-btn" onClick={() => dispatch({ type: "trade" } as CardTradeUpAction)}>Trade</button>
        <button className="ctu-btn alt" onClick={() => dispatch({ type: "keep" } as CardTradeUpAction)}>Keep</button>
      </div>
    </div>
  );
}
