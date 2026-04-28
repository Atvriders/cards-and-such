import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BankCrapsState, BankCrapsAction, BankCrapsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BankCrapsGame({ state, dispatch, onGameOver }: GameProps<BankCrapsState, BankCrapsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="bk-wrap"><div className="bk-done"><h2>Done!</h2><div className="bk-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bk-wrap">
      <div className="bk-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bk-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="bk-row">{state.dice.map((d, i) => <div key={i} className="bk-die">{d}</div>)}</div>}
      {state.message && <div className="bk-result">{state.message}</div>}
      {state.phase === "roll" && <button className="bk-btn" onClick={() => dispatch({ type:"roll" } as BankCrapsAction)}>Roll</button>}
      {state.phase === "result" && <button className="bk-btn alt" onClick={() => dispatch({ type:"next" } as BankCrapsAction)}>Next</button>}
    </div>
  );
}
