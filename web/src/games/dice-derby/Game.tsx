import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDerbyState, DiceDerbyAction, DiceDerbySettings } from "./state.js";
import { isTerminal, TOTAL_RACES, ROLLS_PER_RACE, TARGET_SIXES } from "./state.js";
import "./Game.css";
export function DiceDerbyGame({ state, dispatch, onGameOver }: GameProps<DiceDerbyState, DiceDerbySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Race {state.race} / {TOTAL_RACES} — Roll {state.rollNum} / {ROLLS_PER_RACE} — Sixes: {state.sixes} / {TARGET_SIXES}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.lastRoll && (
        <div className="dm-row">
          {state.lastRoll.map((d, i) => <div key={i} className="dm-die" style={{ background: d === 6 ? "#fef0e0" : "#fff" }}>{d}</div>)}
        </div>
      )}
      {state.phase === "racing" && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceDerbyAction)}>Roll 6 Dice</button>
      )}
      {state.phase === "raceDone" && (
        <>
          <div className="dm-result">{state.raceWon ? "Race won! +20 pts" : "Race over — no points"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceDerbyAction)}>Next Race</button>
        </>
      )}
    </div>
  );
}
