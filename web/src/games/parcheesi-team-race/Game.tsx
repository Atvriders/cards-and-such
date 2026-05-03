import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RaceState, RaceSettings, RaceAction } from "./state.js";
import { isTerminal, TRACK, CHECKERS } from "./state.js";
import "./Game.css";

export function RaceGame({ state, dispatch, onGameOver }: GameProps<RaceState, RaceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const msg = state.winner === "P" ? "You won!" : "CPU won!";
    return <div className="race-wrap"><h2>{msg}</h2><div className="race-score">Score: {state.score}</div></div>;
  }

  const isPTurn = state.turn === "P";
  const dieAvailable = (i: 0 | 1) => !state.diceUsed[i];

  return (
    <div className="race-wrap">
      <div className="race-status">
        {isPTurn ? (state.phase === "rolling" ? "Your turn — roll dice." : "Move your checkers.") : "CPU thinking..."}
      </div>
      <div className="race-dice-row">
        <div className="die" data-used={state.diceUsed[0]}>D1: {state.dice[0] || "-"}</div>
        <div className="die" data-used={state.diceUsed[1]}>D2: {state.dice[1] || "-"}</div>
        {state.phase === "rolling" && isPTurn && (
          <button data-testid="hint-target-parcheesi-team-race-primary" className="race-btn" onClick={() => dispatch({ type: "roll" } as RaceAction)}>Roll</button>
        )}
        {state.phase === "moving" && isPTurn && (
          <button className="race-btn" onClick={() => dispatch({ type: "endTurn" } as RaceAction)}>End Turn</button>
        )}
      </div>
      <div className="race-board">
        <div className="race-track">
          {Array.from({ length: TRACK + 1 }, (_, i) => (
            <div key={i} className="race-cell">
              <span className="race-num">{i}</span>
              <div className="race-tokens">
                {state.pPositions.map((p, idx) => p === i ? <span key={"p"+idx} className="race-tok p">{idx+1}</span> : null)}
                {state.cPositions.map((p, idx) => p === i ? <span key={"c"+idx} className="race-tok c">{idx+1}</span> : null)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {state.phase === "moving" && isPTurn && (
        <div className="race-checkers">
          <div className="race-label">Move a checker:</div>
          <div className="race-pickrow">
            {state.pPositions.map((p, idx) => p < TRACK ? (
              <div key={idx} className="race-pick">
                <span>#{idx+1} @ {p}</span>
                {dieAvailable(0) && <button onClick={() => dispatch({ type:"move", checkerIdx: idx, die: 0 } as RaceAction)}>+{state.dice[0]}</button>}
                {dieAvailable(1) && <button onClick={() => dispatch({ type:"move", checkerIdx: idx, die: 1 } as RaceAction)}>+{state.dice[1]}</button>}
                {dieAvailable(0) && dieAvailable(1) && <button onClick={() => dispatch({ type:"move", checkerIdx: idx, die: 2 } as RaceAction)}>+{state.dice[0]+state.dice[1]}</button>}
              </div>
            ) : <div key={idx} className="race-pick done">#{idx+1} done</div>)}
          </div>
        </div>
      )}
      <div className="race-info">Track {TRACK} | Checkers {CHECKERS}</div>
    </div>
  );
}
