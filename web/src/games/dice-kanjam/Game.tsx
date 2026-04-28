import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKanjamState, DiceKanjamAction, DiceKanjamSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKanjamGame({ state, dispatch, onGameOver }: GameProps<DiceKanjamState, DiceKanjamSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-kanjam-wrap"><div className="ds-kanjam-done"><h2>Done!</h2><div className="ds-kanjam-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-kanjam-wrap">
      <div className="ds-kanjam-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-kanjam-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-kanjam-row">{state.dice.map((d, i) => <div key={i} className="ds-kanjam-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-kanjam-btn" onClick={() => dispatch({ type:"roll" } as DiceKanjamAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-kanjam-result">{state.jackpot ? "JACKPOT! +21" : "+" + state.lastPts}</div>
          <button className="ds-kanjam-btn alt" onClick={() => dispatch({ type:"next" } as DiceKanjamAction)}>Next</button>
        </>
      )}
    </div>
  );
}
