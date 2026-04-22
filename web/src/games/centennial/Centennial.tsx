import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CentennialState, CentennialAction, CentennialSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Centennial.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function Centennial({ state, dispatch, onGameOver }: GameProps<CentennialState, CentennialSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="cent">
      <h2>Centennial</h2>

      <div className="cent-targets">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={`cent-target-item ${
              state.playerTarget > n ? "done" : state.playerTarget === n ? "current" : ""
            }`}
          >
            {n}
          </div>
        ))}
      </div>

      <div className="cent-vs">
        <div className="cent-player">
          <h4>You</h4>
          <div className="cent-target-badge">
            {state.playerTarget > 12 ? "DONE!" : `Target: ${state.playerTarget}`}
          </div>
          {state.lastRoll && (
            <div className="cent-dice">
              {state.lastRoll.map((d, i) => <span key={i}>{DICE_FACES[d] ?? "?"}</span>)}
            </div>
          )}
          {state.playerAdvanced && <div className="cent-advanced">Advance!</div>}
          {state.lastRoll && !state.playerAdvanced && <div className="cent-missed">Miss</div>}
        </div>
        <div className="cent-bot">
          <h4>Bot</h4>
          <div className="cent-target-badge">
            {state.botTarget > 12 ? "DONE!" : `Target: ${state.botTarget}`}
          </div>
          {state.lastBotRoll && (
            <div className="cent-dice">
              {state.lastBotRoll.map((d, i) => <span key={i}>{DICE_FACES[d] ?? "?"}</span>)}
            </div>
          )}
          {state.botAdvanced && <div className="cent-advanced">Advance!</div>}
          {state.lastBotRoll && !state.botAdvanced && <div className="cent-missed">Miss</div>}
        </div>
      </div>

      <div className="cent-message">{state.message}</div>

      {state.phase === "rolling" && (
        <button className="cent-btn" onClick={() => dispatch({ type: "roll" } as CentennialAction)}>
          Roll 3 Dice
        </button>
      )}

      {state.gameOver && state.winner && (
        <div className={`cent-game-over ${state.winner}`}>
          {state.winner === "player" ? "You reached 12 first — you win!" : state.winner === "bot" ? "Bot wins!" : "Tie!"}
        </div>
      )}
    </div>
  );
}
