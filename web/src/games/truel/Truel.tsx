import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TruelState, TruelSettings, ShooterId, TargetChoice } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./Truel.css";

const ACC_LABEL: Record<ShooterId, string> = {
  A: "33% (you)",
  B: "50% (bot)",
  C: "100% (bot)",
};

export function Truel({ state, dispatch, onGameOver }: GameProps<TruelState, TruelSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const shooters: ShooterId[] = ["A", "B", "C"];
  const targets: TargetChoice[] = ["B", "C", "air"];

  let statusText = state.turn === "A" ? "Your turn (A) — choose target" : "Bots resolving...";
  let statusClass = "";
  if (state.gameOver) {
    if (state.winner === "A") { statusText = "You survived! You win!"; statusClass = "win"; }
    else if (state.winner === "none") { statusText = "All eliminated — nobody wins."; statusClass = "loss"; }
    else { statusText = `${state.winner} wins. You are eliminated.`; statusClass = "loss"; }
  }

  return (
    <div className="truel">
      <div className="truel-shooters">
        {shooters.map((s) => (
          <div
            key={s}
            className={`truel-shooter ${!state.alive[s] ? "dead" : ""} ${state.turn === s && !state.gameOver ? "active-turn" : ""}`}
          >
            <div className="truel-shooter-name">{state.alive[s] ? s : `${s} ☠️`}</div>
            <div className="truel-shooter-acc">{ACC_LABEL[s]}</div>
          </div>
        ))}
      </div>

      <div className={`truel-status ${statusClass}`}>{statusText}</div>

      {!state.gameOver && state.turn === "A" && (
        <div className="truel-actions">
          {targets.map((t) => {
            const disabled = t !== "air" && !state.alive[t as ShooterId];
            return (
              <button
                key={t}
                className={`truel-btn ${t === "air" ? "air" : ""}`}
                disabled={disabled}
                onClick={() => dispatch({ type: "shoot", target: t })}
              >
                {t === "air" ? "Shoot into Air" : `Shoot ${t}`}
              </button>
            );
          })}
        </div>
      )}

      <div className="truel-log">
        {state.log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>

      {state.gameOver && (
        <button className="truel-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
