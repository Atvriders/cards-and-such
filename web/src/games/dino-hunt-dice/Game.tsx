import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DinoHuntDiceState, DinoHuntDiceAction, DinoHuntDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DinoHuntDiceGame({ state, dispatch, onGameOver }: GameProps<DinoHuntDiceState, DinoHuntDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dh-wrap"><div className="dh-done"><h2>Done!</h2><div className="dh-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dh-wrap">
      <div className="dh-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dh-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="dh-row">{state.dice.map((d, i) => <div key={i} className="dh-die">{d}</div>)}</div>}
      {state.message && <div className="dh-result">{state.message}</div>}
      {state.phase === "roll" && <button className="dh-btn" onClick={() => dispatch({ type:"roll" } as DinoHuntDiceAction)}>Roll</button>}
      {state.phase === "result" && <button className="dh-btn alt" onClick={() => dispatch({ type:"next" } as DinoHuntDiceAction)}>Next</button>}
    </div>
  );
}
