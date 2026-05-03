import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GridmagicState, GridmagicAction, GridmagicSettings } from "./state.js";
import { isTerminal, TOTAL_PUZZLES, MAGIC_SUM } from "./state.js";
import "./Game.css";

export function GridmagicGame({ state, dispatch, onGameOver }: GameProps<GridmagicState, GridmagicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gm-wrap"><div className="gm-done"><h2>Done!</h2><div className="gm-final">{state.score} pts</div></div></div>;
  }
  const p = state.puzzles[state.index]!;
  const display = p.square.map((v, i) => {
    if (i === p.blanks[0]) return state.fillA;
    if (i === p.blanks[1]) return state.fillB;
    return v;
  });
  return (
    <div className="gm-wrap">
      <div className="gm-info">Puzzle {state.index + 1} / {TOTAL_PUZZLES} — Magic Sum {MAGIC_SUM}</div>
      <div className="gm-score">{state.score} pts</div>
      <div className="gm-grid">
        {display.map((v, i) => {
          const isBlank0 = i === p.blanks[0];
          const isBlank1 = i === p.blanks[1];
          const isBlank = isBlank0 || isBlank1;
          let cls = "gm-cell";
          if (isBlank) {
            cls += " blank";
            if ((isBlank0 && state.selectedBlank === 0) || (isBlank1 && state.selectedBlank === 1)) cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={!isBlank || state.phase !== "playing"}
              onClick={() => isBlank && dispatch({ type: "selectBlank", which: isBlank0 ? 0 : 1 } as GridmagicAction)}
            >{v ?? "?"}</button>
          );
        })}
      </div>
      {state.phase === "playing" && (
        <>
          <div className="gm-bank-label">Pick a value for the highlighted blank:</div>
          <div className="gm-bank">
            {p.bank.map((v, i) => (
              <button data-testid={`hint-target-gridmagic-answer-${i}`} key={i} className="gm-bank-btn" onClick={() => dispatch({ type: "pick", value: v } as GridmagicAction)}>{v}</button>
            ))}
          </div>
          <button className="gm-btn submit" disabled={state.fillA === null || state.fillB === null} onClick={() => dispatch({ type: "submit" } as GridmagicAction)}>Submit</button>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className={`gm-feedback ${state.lastOk ? "ok" : "no"}`}>{state.lastOk ? "Correct! +30" : "Wrong"}</div>
          <button className="gm-btn next" onClick={() => dispatch({ type: "next" } as GridmagicAction)}>{state.index + 1 >= TOTAL_PUZZLES ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
