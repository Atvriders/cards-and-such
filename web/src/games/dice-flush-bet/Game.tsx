import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFlushBetState, DiceFlushBetAction, DiceFlushBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FACES = ["", "⚀","⚁","⚂","⚃","⚄","⚅"];

export function DiceFlushBetGame({ state, dispatch, onGameOver }: GameProps<DiceFlushBetState, DiceFlushBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bid, setBid] = useState(5);
  if (state.phase === "gameover") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Game Over</h2><div className="dm-final">Final Coins: {state.coins}</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {state.maxRounds}</div>
      <div className="dm-coins">Coins: {state.coins}</div>
      <div className="dm-dice">{state.dice.map((d,i) => <span key={i}>{FACES[d] ?? d}</span>)}</div>
      {state.phase === "betting" ? (
        <div className="dm-bid-row">
          <input type="number" min={1} max={state.coins} value={bid} onChange={e => setBid(Number(e.target.value))} />
          <button data-testid="hint-target-dice-flush-bet-roll" className="dm-btn" onClick={() => dispatch({ type:"roll", amount:bid } as DiceFlushBetAction)}>Roll</button>
        </div>
      ) : (
        <>
          <div className={`dm-result ${state.lastResult ?? ""}`}>{state.lastResult === "win" ? `+${state.bid}` : state.lastResult === "lose" ? `-${state.bid}` : "Tie"}</div>
          <div className="dm-info">{state.resultLabel}</div>
          <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceFlushBetAction)}>Next</button>
        </>
      )}
    </div>
  );
}
