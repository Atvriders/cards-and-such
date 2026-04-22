import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RatRaceState, RatRaceSettings, RatCard } from "./state.js";
import type { RatRaceAction } from "./state.js";
import { isTerminal, FINISH } from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

function cardDescription(card: RatCard): string {
  switch (card.kind) {
    case "move": return `Move forward ${card.value} spaces!`;
    case "back": return `Move back ${card.value} spaces.`;
    case "skip": return `Skip your next turn.`;
    case "extra": return `Extra turn! Draw again.`;
    case "teleport": return `Teleport to square ${card.to}!`;
  }
}

function cardEmoji(card: RatCard): string {
  switch (card.kind) {
    case "move": return "🏃";
    case "back": return "↩️";
    case "skip": return "⏸️";
    case "extra": return "⚡";
    case "teleport": return "✨";
  }
}

function cardClass(card: RatCard): string {
  switch (card.kind) {
    case "move": return "card-move";
    case "back": return "card-back";
    case "skip": return "card-skip";
    case "extra": return "card-extra";
    case "teleport": return "card-teleport";
  }
}

export function RatRace({
  state,
  dispatch,
  onGameOver,
}: GameProps<RatRaceState, RatRaceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canDraw = isMyTurn && state.phase === "drawing";
  const showResult = isMyTurn && state.phase === "result" && state.currentCard !== null;
  const isSkipped = isMyTurn && state.skipNext[0];

  let status = "";
  if (state.winner === 0) status = "You win! 🎉";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is drawing…`;
  else if (isSkipped) status = "Your turn is skipped — draw to skip";
  else if (canDraw) status = "Draw a card to race!";
  else if (showResult && state.currentCard) status = cardDescription(state.currentCard);

  // Progress bar segments
  const segments = 16; // visual steps
  const pct = (pos: number) => Math.round((pos / FINISH) * segments);

  return (
    <div className="rat-race">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      {/* Card area */}
      <div className="rat-card-area">
        {state.currentCard && (
          <div className={`rat-card ${cardClass(state.currentCard)}`}>
            <span className="card-emoji">{cardEmoji(state.currentCard)}</span>
            <span className="card-text">{cardDescription(state.currentCard)}</span>
          </div>
        )}
        {canDraw && !isSkipped && (
          <button className="draw-btn" onClick={() => dispatch({ type: "draw" } satisfies RatRaceAction)}>
            Draw Card
          </button>
        )}
        {isSkipped && (
          <button className="draw-btn skip-btn" onClick={() => dispatch({ type: "draw" } satisfies RatRaceAction)}>
            Skip Turn (pass)
          </button>
        )}
        {showResult && (
          <button className="confirm-btn" onClick={() => dispatch({ type: "confirm" } satisfies RatRaceAction)}>
            {state.extraTurn ? "Draw Again!" : "Next Turn"}
          </button>
        )}
      </div>

      {/* Race tracks */}
      <div className="rat-tracks">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div key={pi} className="rat-track-row">
            <div className={`track-label color-${COLORS[pi]}`}>
              {LABELS[pi]}
              {state.skipNext[pi] && <span className="skip-badge">SKIP</span>}
            </div>
            <div className="track-bar">
              <div
                className={`track-fill color-${COLORS[pi]}`}
                style={{ width: `${(state.positions[pi]! / FINISH) * 100}%` }}
              />
              <div className="track-tokens">
                {Array.from({ length: segments + 1 }, (_, seg) => {
                  const playerSeg = pct(state.positions[pi]!);
                  return (
                    <div
                      key={seg}
                      className={`track-seg ${seg <= playerSeg ? `filled color-${COLORS[pi]}` : "empty"}`}
                    />
                  );
                })}
              </div>
              <span className={`track-token-marker color-${COLORS[pi]}`} style={{ left: `calc(${(state.positions[pi]! / FINISH) * 100}% - 8px)` }}>
                {state.positions[pi] === FINISH ? "W" : (LABELS[pi] ?? "?")[0]}
              </span>
            </div>
            <div className="track-pos">{state.positions[pi]}/{FINISH}</div>
          </div>
        ))}
      </div>

      <div className="race-legend">
        Deck: {state.deck.length} cards. Cards move you forward, back, skip your turn, grant extra turns, or teleport!
      </div>
    </div>
  );
}
