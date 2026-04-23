import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PopPigState, PopPigSettings } from "./state.js";
import type { PopPigAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function PopThePig({ state, dispatch, onGameOver }: GameProps<PopPigState, PopPigSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canRoll = state.turn === 0 && state.loser === null;
  const fillPct = Math.max(0, Math.min(100, ((state.startBurgers - state.burgersLeft) / state.startBurgers) * 100));
  const danger = fillPct > 75;

  return (
    <div className="pig-game">
      <div className="pig-emoji">{state.loser !== null ? "💥" : fillPct > 85 ? "😬" : fillPct > 60 ? "😅" : "🐷"}</div>

      <div className={`pig-status ${state.loser === 0 ? "loss" : state.loser !== null ? "win" : ""}`}>
        {state.message}
      </div>

      <div className="pig-bar-wrap">
        <div className="pig-bar-bg">
          <div
            className={`pig-bar-fill ${danger ? "danger" : ""}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="pig-bar-label">
          {state.burgersLeft} burgers left of {state.startBurgers}
        </div>
      </div>

      {state.lastRoll !== null && (
        <div className="pig-roll">
          Last roll: <strong>{state.lastRoll}</strong> 🍔
        </div>
      )}

      {canRoll && (
        <button className="pig-roll-btn" onClick={() => dispatch({ type: "roll" } satisfies PopPigAction)}>
          Feed the Pig 🍔
        </button>
      )}

      <div className="pig-players">
        {Array.from({ length: state.numPlayers }, (_, i) => (
          <div key={i} className={`pig-player ${state.loser === i ? "loser" : ""} ${state.turn === i && state.loser === null ? "active" : ""}`}>
            {LABELS[i]}{state.loser === i ? " 💥 POPPED!" : state.turn === i && state.loser === null ? " ←" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
