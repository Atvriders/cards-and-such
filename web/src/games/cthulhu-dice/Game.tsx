import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CthulhuDiceState, CthulhuDiceAction, CthulhuDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CthulhuDiceGame({ state, dispatch, onGameOver }: GameProps<CthulhuDiceState, CthulhuDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ct-wrap"><div className="ct-done"><h2>Done!</h2><div className="ct-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ct-wrap">
      <div className="ct-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ct-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="ct-row">{state.dice.map((d, i) => <div key={i} className="ct-die">{d}</div>)}</div>}
      {state.message && <div className="ct-result">{state.message}</div>}
      {state.phase === "roll" && <button className="ct-btn" onClick={() => dispatch({ type:"roll" } as CthulhuDiceAction)}>Roll</button>}
      {state.phase === "result" && <button className="ct-btn alt" onClick={() => dispatch({ type:"next" } as CthulhuDiceAction)}>Next</button>}
    </div>
  );
}
