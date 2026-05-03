import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZanzibarDiceState, ZanzibarDiceAction, ZanzibarDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ZanzibarDiceGame({ state, dispatch, onGameOver }: GameProps<ZanzibarDiceState, ZanzibarDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="zb-wrap"><div className="zb-done"><h2>Done!</h2><div className="zb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="zb-wrap">
      <div className="zb-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="zb-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="zb-row">{state.dice.map((d, i) => <div key={i} className="zb-die">{d}</div>)}</div>}
      {state.message && <div className="zb-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-zanzibar-dice-roll" className="zb-btn" onClick={() => dispatch({ type:"roll" } as ZanzibarDiceAction)}>Roll</button>}
      {state.phase === "result" && <button data-testid="hint-target-zanzibar-dice-next" className="zb-btn alt" onClick={() => dispatch({ type:"next" } as ZanzibarDiceAction)}>Next</button>}
    </div>
  );
}
