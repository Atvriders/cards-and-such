import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardStackBetState, CardStackBetAction, CardStackBetSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardStackBet({ state, dispatch, onGameOver }: GameProps<CardStackBetState, CardStackBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [amount, setAmount] = useState(10);

  if (state.phase === "gameover") return (
    <div className="csb-wrap"><div className="csb-done">
      <h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f39c12" }}>{state.coins} coins</p>
    </div></div>
  );

  return (
    <div className="csb-wrap">
      <div className="csb-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="csb-coins">{state.coins} coins</span>
      </div>
      <div className="csb-top">Top card: <strong className="csb-card">{cardName(state.topCard)}</strong></div>
      {state.phase === "betting" && (
        <div className="csb-body">
          <div className="csb-bid-row">
            <input type="number" min={1} max={state.coins} value={amount} onChange={e => setAmount(Number(e.target.value))} className="csb-input" />
            <button className="csb-btn high" onClick={() => dispatch({ type: "bet", amount, dir: "higher" } as CardStackBetAction)}>Higher</button>
            <button className="csb-btn low" onClick={() => dispatch({ type: "bet", amount, dir: "lower" } as CardStackBetAction)}>Lower</button>
          </div>
        </div>
      )}
      {state.phase === "revealed" && (
        <div className="csb-body">
          <div className="csb-reveal">Next: <strong className="csb-card">{cardName(state.revealedCard!)}</strong></div>
          <div className={`csb-result ${state.lastResult}`}>{state.lastResult === "win" ? `+${state.bid}` : state.lastResult === "tie" ? "Tie" : `-${state.bid}`}</div>
          <button className="csb-btn next" onClick={() => dispatch({ type: "next" } as CardStackBetAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
