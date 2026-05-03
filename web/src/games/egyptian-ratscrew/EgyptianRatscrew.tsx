import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EgyptianRatscrewState, EgyptianRatscewSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./EgyptianRatscrew.css";

type ERSAction = { type: "flip" } | { type: "slap" } | { type: "bot-slap" };

function botDelay(speed: EgyptianRatscewSettings["botSpeed"]): number {
  if (speed === "fast") return 700;
  if (speed === "slow") return 2000;
  return 1300;
}

function tributeName(n: number): string {
  return n === 1 ? "1 card" : `${n} cards`;
}

export function EgyptianRatscrew({
  state,
  dispatch,
  onGameOver,
}: GameProps<EgyptianRatscrewState, EgyptianRatscewSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Bot slap timer
  useEffect(() => {
    if (state.phase === "slap-window") {
      const delay = botDelay(state.settings.botSpeed);
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: "bot-slap" } as ERSAction);
      }, delay);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [state.phase, state.settings.botSpeed, dispatch]);

  const { playerDeck, botDeck, pile, phase, winner, tributeOwed, tributePayer, tributeChallenger } = state;
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
  const prevCard = pile.length >= 2 ? pile[pile.length - 2] : null;
  const gameOver = phase === "done";

  // Determine whose turn to flip (for the Flip button label)
  const isTributeTurn = phase === "tribute" && tributePayer === 0;
  const isNormalPlayerTurn = phase === "flipping" && state.lastFlippedBy !== 0;
  const playerShouldFlip = isNormalPlayerTurn || isTributeTurn;

  function dis(a: ERSAction): void { dispatch(a); }

  return (
    <div className="ers-game">
      <div className="ers-title">Egyptian Ratscrew</div>

      <div className="ers-decks">
        <div className="ers-side">
          <div className="ers-label">Bot</div>
          <div className="ers-count">{botDeck.length} cards</div>
          {botDeck.length > 0 && <Card faceDown />}
        </div>

        <div className="ers-center">
          <div className="ers-pile-label">Pile ({pile.length})</div>
          <div className={`ers-pile${phase === "slap-window" ? " slap-ready" : ""}`}>
            {prevCard && (
              <div className="ers-pile-prev"><Card card={prevCard} /></div>
            )}
            {topCard && (
              <div className="ers-pile-top"><Card card={topCard} /></div>
            )}
            {pile.length === 0 && <div className="ers-pile-empty">—</div>}
          </div>
        </div>

        <div className="ers-side">
          <div className="ers-label">You</div>
          <div className="ers-count">{playerDeck.length} cards</div>
          {playerDeck.length > 0 && <Card faceDown />}
        </div>
      </div>

      {phase === "tribute" && (
        <div className="ers-tribute">
          {tributePayer === 0
            ? `Face card! You must flip ${tributeName(tributeOwed)} to save yourself.`
            : `Bot must flip ${tributeName(tributeOwed)} tribute to Bot ${tributeChallenger === 0 ? "you" : `${tributeChallenger}`}.`}
        </div>
      )}

      {phase === "slap-window" && (
        <div className="ers-slap-banner">DOUBLE! SLAP NOW!</div>
      )}

      {!gameOver && (
        <div className="ers-actions">
          <button data-testid="hint-target-egyptian-ratscrew-action"
            className="ers-btn flip-btn"
            onClick={() => dis({ type: "flip" })}
            disabled={phase !== "flipping" && !(phase === "tribute" && tributePayer === 0)}
          >
            {isTributeTurn ? `Flip (${tributeOwed} left)` : "Flip Card"}
          </button>
          <button
            className="ers-btn slap-btn"
            onClick={() => dis({ type: "slap" })}
            disabled={phase !== "slap-window"}
          >
            SLAP!
          </button>
        </div>
      )}

      {gameOver && (
        <div className="ers-result">
          <h2>{winner === 0 ? "You win!" : "Bot wins!"}</h2>
        </div>
      )}
    </div>
  );
}
