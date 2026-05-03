import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlapjackState, SlapjackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Slapjack.css";

type SlapjackAction = { type: "flip" } | { type: "slap" } | { type: "bot-slap" };

function botDelay(speed: SlapjackSettings["botSpeed"]): number {
  if (speed === "fast") return 600;
  if (speed === "slow") return 1800;
  return 1100;
}

export function Slapjack({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlapjackState, SlapjackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "slap-window") {
      const delay = botDelay(state.settings.botSpeed);
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "bot-slap" } as SlapjackAction);
      }, delay);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.phase, state.settings.botSpeed, dispatch]);

  const { playerDeck, botDeck, pile, phase, winner } = state;
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const jackOnTop = topCard?.rank === 11;
  const gameOver = phase === "done";

  function dis(a: SlapjackAction): void {
    dispatch(a);
  }

  return (
    <div className="slapjack-game">
      <div className="slapjack-title">Slapjack</div>

      <div className="slapjack-decks">
        <div className="slapjack-side">
          <div className="slapjack-label">Bot</div>
          <div className="slapjack-count">{botDeck.length} cards</div>
          {botDeck.length > 0 && <Card faceDown className="slapjack-card" />}
        </div>

        <div className="slapjack-center">
          <div className="slapjack-pile-label">Pile ({pile.length})</div>
          <div className={`slapjack-pile${jackOnTop ? " jack-alert" : ""}`}>
            {topCard ? <Card card={topCard} /> : <div className="slapjack-pile-empty">—</div>}
          </div>
          {jackOnTop && phase === "slap-window" && (
            <div className="slapjack-jack-banner">JACK! SLAP IT!</div>
          )}
        </div>

        <div className="slapjack-side">
          <div className="slapjack-label">You</div>
          <div className="slapjack-count">{playerDeck.length} cards</div>
          {playerDeck.length > 0 && <Card faceDown className="slapjack-card" />}
        </div>
      </div>

      {!gameOver && (
        <div className="slapjack-actions">
          <button data-testid="hint-target-slapjack-action"
            className="slapjack-btn flip-btn"
            onClick={() => dis({ type: "flip" })}
            disabled={phase !== "flipping"}
          >
            Flip Card
          </button>
          <button
            className="slapjack-btn slap-btn"
            onClick={() => dis({ type: "slap" })}
            disabled={phase !== "slap-window"}
          >
            SLAP!
          </button>
        </div>
      )}

      {gameOver && (
        <div className="slapjack-result">
          <h2>{winner === 0 ? "You win!" : "Bot wins!"}</h2>
          <p>{winner === 0 ? "Fastest hands win!" : "The bot was quicker."}</p>
        </div>
      )}
    </div>
  );
}
