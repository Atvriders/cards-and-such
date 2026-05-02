import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBullseyeState, DiceBullseyeAction, DiceBullseyeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, RINGS } from "./state.js";
import "./Game.css";

export function DiceBullseyeGame({ state, dispatch, onGameOver }: GameProps<DiceBullseyeState, DiceBullseyeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="bs-wrap">
        <div className="bs-done">
          <h2>Match Over</h2>
          <div className="bs-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-wrap">
      <div className="bs-banner">Shot {state.round} / {TOTAL_ROUNDS} · Score {state.score}</div>
      <div className="bs-target">
        <div className="bs-ring r1"><div className="bs-ring r2"><div className="bs-ring r3"><div className="bs-ring r4 bull" /></div></div></div>
      </div>
      {state.rolls && (
        <div className="bs-row">
          <div className="bs-die">{state.rolls[0]}</div>
          <div className="bs-die">{state.rolls[1]}</div>
        </div>
      )}
      <div className="bs-log">{state.log || "Pick a target value. Closer dice average = more points."}</div>
      {state.phase === "aim" && (
        <div className="bs-actions">
          {RINGS.map(r => (
            <button key={r} className="bs-btn" data-testid="hint-target-dice-bullseye-roll" onClick={() => dispatch({ type: "shoot", target: r } as DiceBullseyeAction)}>Aim {r}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && (
        <button className="bs-btn alt" data-testid="hint-target-dice-bullseye-next" onClick={() => dispatch({ type: "next" } as DiceBullseyeAction)}>Next Shot</button>
      )}
    </div>
  );
}
