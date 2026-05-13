import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GoingToBostonState, GoingToBostonSettings, GoingToBostonAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./GoingToBoston.css";

const FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function GoingToBoston({
  state,
  dispatch,
  onGameOver,
}: GameProps<GoingToBostonState, GoingToBostonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, round, totalRounds, totalScore, roundScore, keptDice, currentRoll } = state;

  const rollLabel =
    phase === "preRoll" ? "Roll 3 Dice" :
    phase === "kept1" ? "Roll 2 Remaining" :
    phase === "kept2" ? "Roll Last Die" : "";

  return (
    <div className="gtb fade-in">
      <div className="gtb-header">
        Round {round} of {totalRounds} — Total: {totalScore}
      </div>

      {keptDice.length > 0 && (
        <>
          <div className="gtb-label">Kept (best kept each roll):</div>
          <div className="gtb-kept">
            {keptDice.map((v, i) => (
              <div key={i} className="gtb-die">{FACE[v]}</div>
            ))}
          </div>
        </>
      )}

      {currentRoll.length > 0 && (
        <>
          <div className="gtb-label">Remaining dice:</div>
          <div className="gtb-remaining">
            {currentRoll.map((v, i) => (
              <div key={i} className="gtb-die">{FACE[v]}</div>
            ))}
          </div>
        </>
      )}

      {(phase === "roundDone" || phase === "gameDone") && (
        <div className="gtb-score pulse">Round Score: {roundScore}</div>
      )}

      {terminal && (
        <div className="gtb-message">Game over! Total: {totalScore}</div>
      )}

      <div className="gtb-controls">
        {(phase === "preRoll" || phase === "kept1" || phase === "kept2") && (
          <button title="Roll" data-testid="hint-target-going-to-boston-roll" onClick={() => dispatch({ type: "roll" } as GoingToBostonAction)}>{rollLabel}</button>
        )}
        {phase === "roundDone" && (
          <button data-testid="hint-target-going-to-boston-nextRound" onClick={() => dispatch({ type: "nextRound" } as GoingToBostonAction)}>Next Round</button>
        )}
      </div>
    </div>
  );
}
