import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDeckBetState, CardDeckBetAction, CardDeckBetSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardDeckBetGame({ state, dispatch, onGameOver }: GameProps<CardDeckBetState, CardDeckBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bid, setBid] = useState(5);
  if (state.phase === "gameover") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Game Over</h2><div className="cm-final">Final Coins: {state.coins}</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-coins">Coins: {state.coins}</div>
      <div className="cm-card">{cardName(state.topCard)}</div>
      {state.phase === "betting" ? (
        <div className="cm-bid-row">
          <input type="number" min={1} max={state.coins} value={bid} onChange={e => setBid(Number(e.target.value))} />
          <button className="cm-btn" onClick={() => dispatch({ type:"bet", amount:bid, dir:"higher" } as CardDeckBetAction)}>Higher</button>
          <button className="cm-btn" onClick={() => dispatch({ type:"bet", amount:bid, dir:"lower" } as CardDeckBetAction)}>Lower</button>
        </div>
      ) : (
        <>
          <div className="cm-card">{state.revealedCard !== null ? cardName(state.revealedCard) : "?"}</div>
          <div className={`cm-result ${state.lastResult ?? ""}`}>{state.lastResult === "win" ? `+${state.bid}` : state.lastResult === "lose" ? `-${state.bid}` : "Tie"}</div>
          <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardDeckBetAction)}>Next</button>
        </>
      )}
    </div>
  );
}
