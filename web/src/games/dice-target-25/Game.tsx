import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTarget25State, DiceTarget25Action, DiceTarget25Settings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function DiceTarget25({ state, dispatch, onGameOver }: GameProps<DiceTarget25State, DiceTarget25Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const sum = state.dice.reduce((a, b) => a + b, 0);
  const isScored = state.phase === "scored";

  if (state.phase === "gameover") return (
    <div className="dt25-wrap"><div className="dt25-done">
      <h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#16a085" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="dt25-wrap">
      <div className="dt25-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="dt25-score">{state.score} pts</span>
      </div>
      <div className="dt25-target">Target: <strong>{state.target}</strong></div>
      <div className={`dt25-dice ${isScored ? "final" : ""}`}>
        {state.dice.map((d, i) => {
          const disabled = isScored || state.rollsLeft === 2;
          const clickProps = disabled
            ? {}
            : { onClick: () => dispatch({ type: "toggle", index: i } as DiceTarget25Action) };
          return (
            <Die
              key={i}
              value={d as 1 | 2 | 3 | 4 | 5 | 6}
              kept={!!state.kept[i]}
              {...clickProps}
            />
          );
        })}
      </div>
      <div className="dt25-sum">Sum: <strong>{sum}</strong> (diff: {Math.abs(sum - state.target)})</div>
      {!isScored && state.rollsLeft > 0 && (
        <p className="dt25-hint">{state.rollsLeft === 2 ? "Roll to start" : "Toggle dice to keep, then re-roll or score"}</p>
      )}
      <div className="dt25-actions">
        {!isScored && (
          <>
            <button data-testid="hint-target-dice-target-25-roll" className="dt25-btn roll" disabled={state.rollsLeft <= 0} onClick={() => dispatch({ type: "roll" } as DiceTarget25Action)}>
              Roll ({state.rollsLeft} left)
            </button>
            <button data-testid="hint-target-dice-target-25-score" className="dt25-btn score" disabled={state.rollsLeft === 2} onClick={() => dispatch({ type: "score" } as DiceTarget25Action)}>Score</button>
          </>
        )}
        {isScored && (
          <button data-testid="hint-target-dice-target-25-next" className="dt25-btn next" onClick={() => dispatch({ type: "next" } as DiceTarget25Action)}>
            {state.round >= state.maxRounds ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
