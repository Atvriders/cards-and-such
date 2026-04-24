import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZilchState, ZilchAction } from "./state.js";
import { isTerminal, scoreSelection } from "./state.js";
import "./Zilch.css";

type ZilchSettings = ZilchState["settings"];

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function Zilch({
  state,
  dispatch,
  onGameOver,
}: GameProps<ZilchState, ZilchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { score, turnScore, currentRoll, heldIndices, diceLeft, phase, consecutiveZilches } = state;
  const target = Number(state.settings.target);

  const heldVals = heldIndices.map((i) => currentRoll[i]).filter((v): v is typeof currentRoll[number] => v !== undefined);
  const heldPts = scoreSelection(heldVals);
  const validSelection = heldPts > 0 && heldIndices.length > 0;

  return (
    <div className="zilch">
      <div className="zilch-scoreboard">
        <span>Total: <strong>{score}</strong></span>
        <span className="zilch-target">/ {target}</span>
        {turnScore > 0 && <span className="zilch-turn-pts">Turn: +{turnScore}</span>}
      </div>

      <div className="zilch-progress-wrap">
        <div className="zilch-progress-bar" style={{ width: `${Math.min(100, (score / target) * 100)}%` }} />
      </div>

      {currentRoll.length > 0 && (
        <div className="zilch-dice">
          {currentRoll.map((v, i) => (
            <button
              key={i}
              className={`zilch-die ${heldIndices.includes(i) ? "held" : ""} ${phase !== "rolled" ? "inactive" : ""}`}
              onClick={() => phase === "rolled" && dispatch({ type: "toggleHold", index: i } as ZilchAction)}
              disabled={phase !== "rolled"}
            >
              {FACES[v]}
            </button>
          ))}
        </div>
      )}

      {phase === "rolled" && heldIndices.length > 0 && (
        <div className="zilch-held-pts">
          Selected: <strong>{heldPts > 0 ? `+${heldPts}` : "invalid"}</strong>
        </div>
      )}

      {phase === "zilched" && (
        <div className="zilch-msg zilch-bad">
          Zilch! No scoring dice — turn lost.
          {consecutiveZilches > 0 && ` (${consecutiveZilches} in a row)`}
          {consecutiveZilches >= 3 && " — -500 penalty!"}
        </div>
      )}

      {phase === "won" && (
        <div className="zilch-msg zilch-win">You reached {score}! Zilch!</div>
      )}

      <div className="zilch-controls">
        {phase === "preRoll" && (
          <button className="zilch-btn" onClick={() => dispatch({ type: "roll" } as ZilchAction)}>
            Roll {diceLeft} {diceLeft === 1 ? "Die" : "Dice"}
            {turnScore > 0 && ` (turn: ${turnScore})`}
          </button>
        )}
        {phase === "rolled" && (
          <>
            <button
              className="zilch-btn zilch-btn-keep"
              onClick={() => dispatch({ type: "nextTurn" } as ZilchAction)}
              disabled={!validSelection}
            >
              Keep &amp; Roll Again
            </button>
            <button
              className="zilch-btn zilch-btn-bank"
              onClick={() => dispatch({ type: "bank" } as ZilchAction)}
              disabled={!validSelection}
            >
              Bank {validSelection ? turnScore + heldPts : ""}
            </button>
          </>
        )}
        {phase === "zilched" && (
          <button className="zilch-btn" onClick={() => dispatch({ type: "roll" } as ZilchAction)}>
            New Turn
          </button>
        )}
      </div>
    </div>
  );
}
