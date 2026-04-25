import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PigState, PigSettings } from "./state.js";
import { seatName, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function PigGame({ state, dispatch, onGameOver }: GameProps<PigState, PigSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canPass = state.phase === "passing" && !state.winner;
  const canNose = state.phase === "nose" && !state.winner && !state.nosePressed[0];

  return (
    <div className="pig-card">
      <div className="pig-title">Pig</div>

      <div className="pig-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="pig-opponent">
            <div className="pig-opp-name">{seatName(seat)}</div>
            <div className="pig-nose-icon">{state.nosePressed[seat] ? "🐽" : "😐"}</div>
            <div style={{ fontSize: "0.8rem" }}>{"❤️".repeat(state.lives[seat] ?? 0)}{"🖤".repeat(3 - (state.lives[seat] ?? 0))}</div>
          </div>
        ))}
      </div>

      <div className="pig-log">{state.log}</div>

      <div className="pig-lives-row">
        You: {"❤️".repeat(state.lives[0] ?? 0)}{"🖤".repeat(3 - (state.lives[0] ?? 0))}
        {state.nosePressed[0] && <span> 🐽</span>}
      </div>

      <div className="pig-hand">
        <div className="pig-hand-label">{canPass ? "Click a card to pass left" : canNose ? "Touch your nose!" : "—"}</div>
        <div className="pig-cards">
          {(state.hands[0] ?? []).map(c => (
            <button
              key={c.id}
              className="pig-card-btn"
              disabled={!canPass}
              onClick={() => dispatch({ type: "pass", cardId: c.id })}
            >
              <Card card={c} />
            </button>
          ))}
        </div>
      </div>

      {canNose && (
        <button className="pig-nose-btn" onClick={() => dispatch({ type: "pressNose" })}>
          Touch Your Nose! 🐽
        </button>
      )}

      {state.winner !== null && (
        <div className="pig-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
