import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceLadderState, DiceLadderSettings, DiceLadderAction } from "./state.js";
import { isTerminal, getPhase } from "./state.js";
import "./Game.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceLadder({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceLadderState, DiceLadderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const phase = getPhase(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const rungs = Array.from({ length: state.rungs }, (_, i) => state.rungs - i);

  return (
    <div className="dl-game">
      <div className="dl-title">Dice Ladder</div>
      <div className="dl-stats">
        <span>Rung: {state.currentRung} / {state.rungs}</span>
        <span>Turns: {state.turnsTaken}</span>
      </div>

      <div className="dl-ladder">
        {rungs.map(rung => (
          <div
            key={rung}
            className={`dl-rung ${state.currentRung === rung ? "current" : ""} ${rung === state.rungs ? "top" : ""}`}
          >
            <span className="dl-rung-num">{rung}</span>
            {state.currentRung === rung && <span className="dl-player">★</span>}
            {rung === state.rungs && <span className="dl-top-label">GOAL</span>}
          </div>
        ))}
        <div className={`dl-rung ${state.currentRung === 0 ? "current" : ""}`}>
          <span className="dl-rung-num">Start</span>
          {state.currentRung === 0 && <span className="dl-player">★</span>}
        </div>
      </div>

      {state.lastRoll.length > 0 && (
        <div className="dl-dice-display">
          {state.lastRoll.map((v, i) => (
            <span key={i} className="dl-die">{DIE_FACES[v]}</span>
          ))}
          <span className="dl-roll-sum">Sum: {state.lastRoll.reduce((a, b) => a + b, 0)}</span>
        </div>
      )}

      {!state.gameOver && (
        <div className="dl-actions">
          {!phase.rolled && (
            <button className="dl-btn roll-btn" onClick={() => dispatch({ type: "roll" } as DiceLadderAction)}>
              Roll Dice
            </button>
          )}
          {phase.rolled && (
            <>
              <button className="dl-btn up-btn" onClick={() => dispatch({ type: "climbUp" } as DiceLadderAction)}>
                Climb Up (+{state.lastRoll.reduce((a, b) => a + b, 0)})
              </button>
              {phase.canClimbDown && (
                <button className="dl-btn down-btn" onClick={() => dispatch({ type: "climbDown" } as DiceLadderAction)}>
                  Slide Down (-{Math.min(...state.lastRoll)})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {state.gameOver && (
        <div className="dl-game-over">
          <div>You reached the top in {state.turnsTaken} turns!</div>
          <div className="dl-score">Score: {terminal?.score}</div>
          <button className="dl-btn roll-btn" onClick={() => dispatch({ type: "restart" } as DiceLadderAction)}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
