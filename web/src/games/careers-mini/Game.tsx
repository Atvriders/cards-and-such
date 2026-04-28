import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CareersState, CareersAction, CareersSettings } from "./state.js";
import { isTerminal, score, PATHS, PATH_LEN } from "./state.js";
import "./Game.css";

export function CareersMiniGame({ state, dispatch, onGameOver }: GameProps<CareersState, CareersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const path = PATHS[state.path];
  const cur = path[state.pos]!;
  return (
    <div className="cm-wrap">
      <div className="cm-head">Career: <b>{state.path.toUpperCase()}</b></div>
      <div className="cm-stats">
        <div>Money <b>${state.money}</b> / {state.goalMoney}</div>
        <div>Fame <b>{state.fame}</b> / {state.goalFame}</div>
        <div>Happy <b>{state.happiness}</b> / {state.goalHappy}</div>
      </div>
      <div className="cm-board">
        {path.map((sq, i) => (
          <div key={i} className={`cm-cell${i === state.pos ? " cm-here" : ""}`} title={sq.label}>{i + 1}</div>
        ))}
      </div>
      <div className="cm-info">Pos {state.pos + 1}/{PATH_LEN} — Turn {state.turn}</div>
      {state.phase === "rolling" && <button className="cm-btn" onClick={() => dispatch({ type: "roll" } as CareersAction)}>Roll Dice</button>}
      {state.phase === "resolved" && (
        <div className="cm-event">
          <div>Rolled <b>{state.lastRoll}</b> → {cur.label}</div>
          <div>(${cur.m >= 0 ? "+" : ""}{cur.m}, fame {cur.f >= 0 ? "+" : ""}{cur.f}, happy {cur.h >= 0 ? "+" : ""}{cur.h})</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as CareersAction)}>Next</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="cm-done">
          <h3>Career Done</h3>
          <div>Score: {score(state)}</div>
        </div>
      )}
    </div>
  );
}
