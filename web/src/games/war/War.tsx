import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WarState, WarAction, WarSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./War.css";

export function War({
  state,
  dispatch,
  onGameOver,
}: GameProps<WarState, WarSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  function dis(a: WarAction): void {
    dispatch(a);
  }

  const gameOver = state.winner !== null;

  return (
    <div className="war-game">
      <div className="war-title">WAR</div>

      {/* Deck counts */}
      <div className="war-decks">
        <div className="war-deck-side">
          <div className="war-deck-label">You</div>
          <div className="war-deck-stack">
            {state.player.length > 0 && <Card faceDown className="war-deck-card" />}
          </div>
          <div className="war-deck-count">{state.player.length}</div>
        </div>

        <div className="war-vs">VS</div>

        <div className="war-deck-side">
          <div className="war-deck-label">Bot</div>
          <div className="war-deck-stack">
            {state.bot.length > 0 && <Card faceDown className="war-deck-card" />}
          </div>
          <div className="war-deck-count">{state.bot.length}</div>
        </div>
      </div>

      {/* Battlefield / pile */}
      <div className="war-battlefield">
        <div className="war-battlefield-label">Battlefield</div>
        {state.pile.length > 0 ? (
          <div className="war-pile-count">{state.pile.length} cards at stake</div>
        ) : (
          <div className="war-pile-count">—</div>
        )}
      </div>

      {/* Last result */}
      <div className="war-result">
        {state.lastResult ?? "Press \"Play Round\" to begin!"}
      </div>

      {/* Rounds played */}
      <div className="war-rounds">
        Round {state.roundsPlayed} / {state.maxRounds} max
      </div>

      {/* Actions */}
      {!gameOver && (
        <div className="war-actions">
          <button onClick={() => dis({ type: "play-round" })}>
            Play Round
          </button>
          <button className="secondary" onClick={() => dis({ type: "auto-play" })}>
            Auto-play
          </button>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div className="war-game-over">
          {state.winner === 0 && "You win!"}
          {state.winner === 1 && "Bot wins!"}
          {state.winner === "draw" && "Draw!"}
          <br />
          <span style={{ fontSize: "1rem", opacity: 0.8 }}>
            Finished in {state.roundsPlayed} round{state.roundsPlayed !== 1 ? "s" : ""}
            {terminal ? ` — Score: ${terminal.score}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
