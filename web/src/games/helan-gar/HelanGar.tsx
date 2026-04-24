import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HelanGarState, HelanGarAction } from "./state.js";
import { isTerminal, stageName, stageTarget } from "./state.js";
import "./HelanGar.css";

type HelanGarSettings = HelanGarState["settings"];

function dieFace(val: number): string {
  return ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][val] ?? "?";
}

export function HelanGar({
  state,
  dispatch,
  onGameOver,
}: GameProps<HelanGarState, HelanGarSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { stage, totalStages, score, currentRoll, rollsLeft, hitThisStage, phase, lastMsg } = state;

  const target = stageTarget(stage <= totalStages ? stage : totalStages);
  const name = stageName(stage <= totalStages ? stage : totalStages);

  return (
    <div className="helan">
      <div className="helan-header">
        <strong>Helan går!</strong>
        <span>Score: {score}</span>
      </div>

      <div className="helan-stages">
        {Array.from({ length: totalStages }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`helan-stage-pip ${s < stage ? "passed" : s === stage ? "current" : "future"}`}
            title={stageName(s)}
          >
            {stageName(s).substring(0, 3)}
          </div>
        ))}
      </div>

      {phase !== "done" && stage <= totalStages && (
        <div className="helan-current-stage">
          <span className="helan-stage-name">{name}</span>
          <span className="helan-target">Target sum: <strong>{target}</strong></span>
          <span className="helan-rolls">Rolls left: {rollsLeft}</span>
        </div>
      )}

      {currentRoll && (
        <div className="helan-dice">
          <span className={`helan-die ${hitThisStage ? "hit" : ""}`}>{dieFace(currentRoll[0])}</span>
          <span className="helan-plus">+</span>
          <span className={`helan-die ${hitThisStage ? "hit" : ""}`}>{dieFace(currentRoll[1])}</span>
          <span className="helan-sum">= {currentRoll[0] + currentRoll[1]}</span>
        </div>
      )}

      {lastMsg && (
        <div className={`helan-msg ${hitThisStage && phase === "stageOver" ? "hit" : phase === "stageOver" ? "miss" : ""}`}>
          {lastMsg}
        </div>
      )}

      {phase === "done" && (
        <div className={`helan-gameover ${score > 0 ? "win" : "lose"}`}>
          Skål! Final score: <strong>{score}</strong>
        </div>
      )}

      <div className="helan-controls">
        {(phase === "preRoll" || phase === "rolled") && (
          <button className="helan-btn" onClick={() => dispatch({ type: "roll" } as HelanGarAction)}>
            Roll
          </button>
        )}
        {phase === "stageOver" && stage < totalStages && (
          <button className="helan-btn helan-btn-next" onClick={() => dispatch({ type: "nextStage" } as HelanGarAction)}>
            Next: {stageName(stage + 1)}
          </button>
        )}
        {phase === "stageOver" && stage >= totalStages && (
          <button className="helan-btn helan-btn-next" onClick={() => dispatch({ type: "nextStage" } as HelanGarAction)}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
