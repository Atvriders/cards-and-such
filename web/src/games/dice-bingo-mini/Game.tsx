import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBingoMiniState, DiceBingoMiniAction, DiceBingoMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function DiceBingoMini({ state, dispatch, onGameOver }: GameProps<DiceBingoMiniState, DiceBingoMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const done = state.phase === "won" || state.phase === "gameover";
  if (done) return (
    <div className="dbm-wrap"><div className="dbm-done">
      <h2>{state.phase === "won" ? "Bingo!" : "Game Over"}</h2>
      <p>Bingos: {state.bingos}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#1abc9c" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="dbm-wrap">
      <div className="dbm-header">
        <span>Roll {state.rollCount} / {state.maxRolls}</span>
        <span className="dbm-score">{state.score} pts</span>
      </div>
      <div className="dbm-die"><Die value={state.die as 1 | 2 | 3 | 4 | 5 | 6} /></div>
      <div className="dbm-card">
        {state.card.map((row, r) => row.map((num, c) => (
          <div key={`${r}-${c}`} className={`dbm-cell ${state.marked[r]![c] ? "marked" : ""}`}>{num}</div>
        )))}
      </div>
      <div className="dbm-info">Bingos: {state.bingos}</div>
      <button data-testid="hint-target-dice-bingo-mini-roll" className="dbm-btn" onClick={() => dispatch({ type: "roll" } as DiceBingoMiniAction)}>Roll</button>
    </div>
  );
}
