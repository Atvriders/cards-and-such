import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CosmicWimpoutState, CosmicWimpoutSettings, CosmicWimpoutAction } from "./state.js";
import { isTerminal, scoreDice } from "./state.js";
import "./CosmicWimpout.css";

const FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function CosmicWimpout({
  state,
  dispatch,
  onGameOver,
}: GameProps<CosmicWimpoutState, CosmicWimpoutSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, lastRoll, keptIndices, bankedScore, turnScore, turnsPlayed } = state;
  const target = parseInt(state.settings.target, 10);

  return (
    <div className="cw">
      <div className="cw-scoreboard">
        <span>Banked: {bankedScore} / {target}</span>
        <span style={{ color: "#2a6a2a" }}>Turn: {turnScore}</span>
        <span style={{ color: "#666" }}>Turns: {turnsPlayed}</span>
      </div>

      {lastRoll.length > 0 && (
        <>
          <div className="cw-label">
            {phase === "rolled" ? "Click scoring dice to keep:" : "Dice:"}
          </div>
          <div className="cw-dice">
            {lastRoll.map((v, i) => {
              const isKept = keptIndices.includes(i);
              const canKeep = phase === "rolled" && !isKept && scoreDice([v]) > 0;
              return (
                <div
                  key={i}
                  className={`cw-die${isKept ? " kept" : ""}${!canKeep && !isKept ? " inactive" : ""}`}
                  onClick={() => canKeep && dispatch({ type: "keep", index: i } as CosmicWimpoutAction)}
                  role={canKeep ? "button" : undefined}
                  aria-label={`Die ${v}${isKept ? " (kept)" : ""}`}
                >
                  {FACE[v]}
                </div>
              );
            })}
          </div>
        </>
      )}

      {phase === "wimpout" && (
        <div className="cw-message">Wimpout! No scoring dice — turn lost!</div>
      )}

      {terminal && (
        <div className="cw-message won">You won! Banked {bankedScore} in {turnsPlayed} turns!</div>
      )}

      <div className="cw-controls">
        {phase === "preRoll" && !terminal && (
          <button onClick={() => dispatch({ type: "roll" } as CosmicWimpoutAction)}>Roll 5 Dice</button>
        )}
        {phase === "rolled" && (
          <>
            <button
              onClick={() => dispatch({ type: "roll" } as CosmicWimpoutAction)}
              disabled={keptIndices.length === 0}
            >
              Roll Again
            </button>
            <button
              className="bank-btn"
              onClick={() => dispatch({ type: "bank" } as CosmicWimpoutAction)}
              disabled={turnScore === 0}
            >
              Bank {turnScore}
            </button>
          </>
        )}
        {phase === "wimpout" && (
          <button onClick={() => dispatch({ type: "nextTurn" } as CosmicWimpoutAction)}>Next Turn</button>
        )}
      </div>
    </div>
  );
}
