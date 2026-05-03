import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BankCrapsState, BankCrapsAction, BankCrapsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BankCrapsGame({ state, dispatch, onGameOver }: GameProps<BankCrapsState, BankCrapsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="bkcr-wrap bkcr-theme"><div className="bkcr-done"><h2>Done!</h2><div className="bkcr-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bkcr-wrap bkcr-theme">
      <div className="bkcr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bkcr-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="bkcr-row">{state.dice.map((d, i) => <div key={i} className="bkcr-die">{d}</div>)}</div>}
      {state.message && <div className="bkcr-result">{state.message}</div>}
      {state.phase === "roll" && <button className="bkcr-btn" data-testid="hint-target-bank-craps-roll" onClick={() => dispatch({ type:"roll" } as BankCrapsAction)}>Roll</button>}
      {state.phase === "result" && <button className="bkcr-btn alt" data-testid="hint-target-bank-craps-next" onClick={() => dispatch({ type:"next" } as BankCrapsAction)}>Next</button>}
    </div>
  );
}
