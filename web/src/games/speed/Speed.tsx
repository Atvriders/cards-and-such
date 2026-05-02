import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpeedState, SpeedSettings } from "./state.js";
import { isTerminal, canPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Speed.css";

type SpeedAction =
  | { type: "play"; cardId: string; pileIndex: 0 | 1 }
  | { type: "tick" }
  | { type: "start" };

export function Speed({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpeedState, SpeedSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Tick timer
  useEffect(() => {
    if (state.phase === "playing") {
      tickRef.current = setInterval(() => {
        dispatch({ type: "tick" } as SpeedAction);
      }, 1000);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, dispatch]);

  const { hand, piles, stock, cardsPlayed, secondsLeft, phase } = state;
  const [pile0, pile1] = piles;
  const top0 = pile0!.length > 0 ? pile0![pile0!.length - 1] : null;
  const top1 = pile1!.length > 0 ? pile1![pile1!.length - 1] : null;

  function playCard(pileIndex: 0 | 1): void {
    if (!selectedCard) return;
    dispatch({ type: "play", cardId: selectedCard, pileIndex } as SpeedAction);
    setSelectedCard(null);
  }

  function selectCard(id: string): void {
    setSelectedCard(prev => prev === id ? null : id);
  }

  const selectedCardObj = hand.find(c => c.id === selectedCard) ?? null;
  const canPlayOn0 = selectedCardObj ? canPlay(selectedCardObj, pile0!) : false;
  const canPlayOn1 = selectedCardObj ? canPlay(selectedCardObj, pile1!) : false;

  return (
    <div className="speed-game">
      <div className="speed-header">
        <div className="speed-title">Speed</div>
        <div className="speed-stats">
          <span className={`speed-timer${secondsLeft <= 10 ? " urgent" : ""}`}>
            {secondsLeft}s
          </span>
          <span className="speed-score">Cards: {cardsPlayed}</span>
          <span className="speed-stock">Stock: {stock.length}</span>
        </div>
      </div>

      <div className="speed-piles">
        <button
          className={`speed-pile-btn${canPlayOn0 ? " valid-target" : ""}`}
          onClick={() => playCard(0)}
          disabled={!canPlayOn0 || phase !== "playing"}
        >
          <div className="speed-pile-label">Pile 1</div>
          <div className="speed-pile-card">
            {top0 ? <Card card={top0} /> : <div className="speed-pile-empty">—</div>}
          </div>
          {top0 && (
            <div className="speed-pile-top-label">{rankLabel(top0.rank)}{top0.suit}</div>
          )}
        </button>

        <button
          className={`speed-pile-btn${canPlayOn1 ? " valid-target" : ""}`}
          onClick={() => playCard(1)}
          disabled={!canPlayOn1 || phase !== "playing"}
        >
          <div className="speed-pile-label">Pile 2</div>
          <div className="speed-pile-card">
            {top1 ? <Card card={top1} /> : <div className="speed-pile-empty">—</div>}
          </div>
          {top1 && (
            <div className="speed-pile-top-label">{rankLabel(top1.rank)}{top1.suit}</div>
          )}
        </button>
      </div>

      <div className="speed-hand-area">
        <div className="speed-hand-label">
          Your hand ({hand.length} cards) — select then click a pile:
        </div>
        <div className="speed-hand">
          {hand.map(c => (
            <div
              key={c.id}
              data-testid={`hint-target-speed-hand-${c.id}`}
              className={`speed-card-slot${selectedCard === c.id ? " selected" : ""}${phase === "playing" ? " clickable" : ""}`}
              onClick={() => selectCard(c.id)}
            >
              <Card card={c} />
            </div>
          ))}
        </div>
      </div>

      {phase === "done" && (
        <div className="speed-result">
          <h2>Time's up!</h2>
          <p>Cards played: <strong>{cardsPlayed}</strong></p>
          <button
            className="speed-btn"
            onClick={() => dispatch({ type: "start" } as SpeedAction)}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
