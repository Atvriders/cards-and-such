import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpoonsState, SpoonsSettings } from "./state.js";
import { seatName, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function SpoonsGame({ state, dispatch, onGameOver }: GameProps<SpoonsState, SpoonsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canPass = state.phase === "passing" && !state.winner;
  const canGrab = state.phase === "grab" && !state.winner;

  return (
    <div className="spoons">
      <div className="sp-title">Spoons</div>

      <div className="sp-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="sp-opponent">
            <div className="sp-opp-name">{seatName(seat)}</div>
            <div className="sp-opp-lives">
              {"❤️".repeat(state.lives[seat] ?? 0)}{"🖤".repeat(3 - (state.lives[seat] ?? 0))}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{state.hands[seat]?.length ?? 0} cards</div>
          </div>
        ))}
      </div>

      <div className="sp-table">
        <span>Table: </span>
        {Array.from({ length: state.spoons }).map((_, i) => (
          <span key={i} className="sp-spoon">🥄</span>
        ))}
        {state.spoons === 0 && <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>No spoons left!</span>}
      </div>

      <div className="sp-log">{state.log}</div>

      <div className="sp-lives-row">
        Your lives: {"❤️".repeat(state.lives[0] ?? 0)}{"🖤".repeat(3 - (state.lives[0] ?? 0))}
      </div>

      <div className="sp-hand">
        <div className="sp-hand-label">Your hand — {canPass ? "click a card to pass left" : canGrab ? "grab a spoon!" : "—"}</div>
        <div className="sp-cards">
          {(state.hands[0] ?? []).map(c => (
            <button
              key={c.id}
              className="sp-card-btn"
              disabled={!canPass}
              onClick={() => dispatch({ type: "pass", cardId: c.id })}
              aria-label={`Pass ${c.suit}${c.rank}`}
            >
              <Card card={c} />
            </button>
          ))}
        </div>
      </div>

      {canGrab && (
        <button className="sp-grab-btn" onClick={() => dispatch({ type: "grab" })}>
          Grab a Spoon! 🥄
        </button>
      )}

      {state.winner !== null && (
        <div className="sp-game-over">
          {state.winner === 0 ? "You win! 🎉" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
