import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollThroughAgesState, RollThroughAgesAction } from "./state.js";
import { isTerminal, FACE_LABEL } from "./state.js";
import "./RollThroughAges.css";

type RTASettings = RollThroughAgesState["settings"];

export function RollThroughAges({
  state,
  dispatch,
  onGameOver,
}: GameProps<RollThroughAgesState, RTASettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const {
    turn, totalTurns, cities, food, goods, workers, monuments, developments,
    currentRoll, heldMask, rerollsLeft, phase, lastMsg, score
  } = state;

  return (
    <div className="rta">
      <div className="rta-header">
        <span>Turn {turn}/{totalTurns}</span>
        <span>Score: <strong>{score}</strong></span>
        <span>Cities: {cities}</span>
      </div>

      <div className="rta-resources">
        <span>🍖 {food}</span>
        <span>⚙️ {goods}</span>
        <span>👷 {workers}</span>
        <span>🏛️ {monuments}</span>
        <span>📜 {developments}</span>
      </div>

      {currentRoll.length > 0 && (
        <div className="rta-dice">
          {currentRoll.map((f, i) => (
            <button
              key={i}
              className={`rta-die ${heldMask[i] ? "held" : ""} ${phase !== "rolled" ? "inactive" : ""}`}
              onClick={() => phase === "rolled" && dispatch({ type: "toggleHold", index: i } as RollThroughAgesAction)}
              disabled={phase !== "rolled"}
              title={FACE_LABEL[f]}
            >
              {FACE_LABEL[f]}
            </button>
          ))}
        </div>
      )}

      {lastMsg && <div className="rta-msg">{lastMsg}</div>}

      <div className="rta-controls">
        {phase === "preRoll" && (
          <button className="rta-btn" onClick={() => dispatch({ type: "roll" } as RollThroughAgesAction)}>
            Roll Dice
          </button>
        )}
        {phase === "rolled" && (
          <>
            {rerollsLeft > 0 && (
              <button className="rta-btn" onClick={() => dispatch({ type: "roll" } as RollThroughAgesAction)}>
                Reroll Unheld ({rerollsLeft} left)
              </button>
            )}
            <button className="rta-btn rta-btn-bank" onClick={() => dispatch({ type: "endRoll" } as RollThroughAgesAction)}>
              Keep Dice
            </button>
          </>
        )}
        {phase === "turnOver" && (
          <>
            <button
              className="rta-btn"
              onClick={() => dispatch({ type: "buyDev" } as RollThroughAgesAction)}
              disabled={goods < 3}
              title="3 goods → development (+5 pts)"
            >
              Buy Dev ({goods}/3 ⚙️)
            </button>
            <button
              className="rta-btn"
              onClick={() => dispatch({ type: "buildMon" } as RollThroughAgesAction)}
              disabled={workers < 6}
              title="6 workers → monument (+10 pts)"
            >
              Build Mon ({workers}/6 👷)
            </button>
            <button className="rta-btn rta-btn-next" onClick={() => dispatch({ type: "nextTurn" } as RollThroughAgesAction)}>
              Next Turn (feed {cities} 🍖)
            </button>
          </>
        )}
      </div>

      {phase === "done" && (
        <div className="rta-gameover">
          Age complete! Final score: <strong>{score}</strong>
        </div>
      )}
    </div>
  );
}
