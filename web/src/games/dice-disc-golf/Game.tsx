import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDiscGolfState, DiceDiscGolfAction, DiceDiscGolfSettings } from "./state.js";
import { isTerminal, TOTAL_HOLES, PAR } from "./state.js";
import "./Game.css";

export function DiceDiscGolfGame({ state, dispatch, onGameOver }: GameProps<DiceDiscGolfState, DiceDiscGolfSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-disc-golf-wrap"><div className="ds-disc-golf-done"><h2>Done!</h2><div className="ds-disc-golf-final">{state.totalStrokes} strokes (par {PAR * TOTAL_HOLES})</div></div></div>;
  }
  return (
    <div className="ds-disc-golf-wrap">
      <div className="ds-disc-golf-info">Hole {state.hole} / {TOTAL_HOLES} — Par {PAR}</div>
      <div className="ds-disc-golf-score">{state.totalStrokes} strokes</div>
      {state.dice && (
        <div className="ds-disc-golf-row">{state.dice.map((d, i) => <div key={i} className="ds-disc-golf-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-disc-golf-btn" onClick={() => dispatch({ type:"roll" } as DiceDiscGolfAction)}>Throw</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-disc-golf-result">{state.strokes} strokes this hole</div>
          <button className="ds-disc-golf-btn alt" onClick={() => dispatch({ type:"next" } as DiceDiscGolfAction)}>Next Hole</button>
        </>
      )}
    </div>
  );
}
