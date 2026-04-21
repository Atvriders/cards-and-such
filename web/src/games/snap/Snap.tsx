import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnapState, SnapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Snap.css";

type SnapAction = { type: "flip" } | { type: "snap" } | { type: "bot-snap" };

export function Snap({
  state,
  dispatch,
  onGameOver,
}: GameProps<SnapState, SnapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // When snap window opens, start timer for bot to auto-snap
  useEffect(() => {
    if (state.phase === "snap-window") {
      // Bot snaps after 2 seconds if player doesn't
      const delay = state.snapWindowFlipsLeft === 0 ? 1000 : 2000;
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "bot-snap" } as SnapAction);
      }, delay);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.phase, state.snapWindowFlipsLeft, dispatch]);

  const { playerDeck, botDeck, pile, phase, winner } = state;
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const prevCard = pile.length >= 2 ? pile[pile.length - 2] : null;
  const gameOver = phase === "done";

  function dis(a: SnapAction): void {
    dispatch(a);
  }

  return (
    <div className="snap-game">
      <div className="snap-title">SNAP!</div>

      <div className="snap-decks">
        <div className="snap-deck-side">
          <div className="snap-deck-label">Bot</div>
          <div className="snap-deck-count">{botDeck.length} cards</div>
          {botDeck.length > 0 && <Card faceDown className="snap-deck-card" />}
        </div>

        <div className="snap-pile-area">
          <div className="snap-pile-label">Pile ({pile.length})</div>
          <div className="snap-pile-cards">
            {prevCard && (
              <div className="snap-pile-prev">
                <Card card={prevCard} />
              </div>
            )}
            {topCard && (
              <div className="snap-pile-top">
                <Card card={topCard} />
              </div>
            )}
            {pile.length === 0 && (
              <div className="snap-pile-empty">—</div>
            )}
          </div>
        </div>

        <div className="snap-deck-side">
          <div className="snap-deck-label">You</div>
          <div className="snap-deck-count">{playerDeck.length} cards</div>
          {playerDeck.length > 0 && <Card faceDown className="snap-deck-card" />}
        </div>
      </div>

      {phase === "snap-window" && (
        <div className="snap-snap-banner">
          SNAP! Two {topCard?.rank === prevCard?.rank ? "matching" : ""} cards! Click SNAP now!
        </div>
      )}

      {!gameOver && (
        <div className="snap-actions">
          <button
            className="snap-btn snap-btn-flip"
            onClick={() => dis({ type: "flip" })}
            disabled={phase !== "flipping"}
          >
            Flip Card
          </button>
          <button
            className="snap-btn snap-btn-snap"
            onClick={() => dis({ type: "snap" })}
            disabled={phase !== "snap-window"}
          >
            SNAP!
          </button>
        </div>
      )}

      {gameOver && (
        <div className="snap-result">
          <h2>{winner === 0 ? "You win!" : "Bot wins!"}</h2>
          <p>{winner === 0 ? "You collected all the cards!" : "Better luck next time."}</p>
        </div>
      )}
    </div>
  );
}
