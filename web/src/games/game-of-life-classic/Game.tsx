import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClassicState, ClassicAction, ClassicSettings } from "./state.js";
import { isTerminal, score, BOARD } from "./state.js";
import "./Game.css";

export function GameOfLifeClassicGame({ state, dispatch, onGameOver }: GameProps<ClassicState, ClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const sq = BOARD[state.lastSquare]!;
  return (
    <div className="golc-wrap">
      <div className="golc-stats">
        <div className="golc-stat">Turn <b>{state.turn}</b></div>
        <div className="golc-stat">Cash <b>${state.cash}</b></div>
        <div className="golc-stat">Family <b>{state.family}</b></div>
      </div>
      <div className="golc-board">
        {BOARD.map((s, i) => (
          <div key={i} className={`golc-cell golc-${s.kind}${i === state.pos ? " golc-here" : ""}`} title={s.label}>
            <span className="golc-num">{i + 1}</span>
            {i === state.pos && <span className="golc-pin">YOU</span>}
          </div>
        ))}
      </div>
      {state.phase === "spinning" && (
        <button className="golc-btn" onClick={() => dispatch({ type: "spin" } as ClassicAction)}>Spin (1-10)</button>
      )}
      {state.phase === "resolved" && (
        <div className="golc-event">
          <div className="golc-event-title">Spun {state.lastSpin}</div>
          <div className="golc-event-body">Square {state.lastSquare + 1}: <b>{sq.label}</b> ({sq.cash >= 0 ? "+" : ""}${sq.cash}{sq.family ? `, +${sq.family} family` : ""})</div>
          <button className="golc-btn alt" onClick={() => dispatch({ type: "next" } as ClassicAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="golc-done">
          <h3>Retired!</h3>
          <div>Final cash: ${state.cash}</div>
          <div>Family: {state.family}</div>
          <div className="golc-final">Life Score: {score(state)}</div>
        </div>
      )}
    </div>
  );
}
