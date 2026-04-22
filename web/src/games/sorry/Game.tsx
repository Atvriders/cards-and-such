import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SorryState, SorrySettings, SorryCard } from "./state.js";
import type { SorryAction } from "./state.js";
import { isTerminal, HOME_SQ, YARD, NUM_PAWNS } from "./state.js";
import "./Game.css";

const COLORS = ["blue", "red", "green", "orange"];
const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

function cardLabel(card: SorryCard): string {
  if (card === "Sorry") return "Sorry!";
  if (card === "Swap") return "Swap";
  return String(card);
}

function cardDesc(card: SorryCard): string {
  if (card === "Sorry") return "Send an opponent's pawn home!";
  if (card === "Swap") return "Swap positions with an opponent's pawn!";
  if (card === 4) return "Move back 4 spaces";
  if (card === 10) return "Move 10 forward or 1 backward";
  if (card === 11) return "Move 11 forward";
  if (card === 2) return "Move 2 and draw again";
  return `Move forward ${card} spaces`;
}

export function Sorry({
  state,
  dispatch,
  onGameOver,
}: GameProps<SorryState, SorrySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const canDraw = isMyTurn && state.phase === "drawing";
  const choosing = isMyTurn && state.phase === "choosing";

  let status = "";
  if (state.winner === 0) status = "You win!";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is playing…`;
  else if (canDraw) status = "Draw a card!";
  else if (state.currentCard) status = `Card: ${cardLabel(state.currentCard)} — ${cardDesc(state.currentCard)}`;

  function canMovePawn(pi: number, alt = false): boolean {
    if (!choosing || state.currentCard === null) return false;
    const card = state.currentCard;
    const pos = state.pawns[0]![pi]!;
    if (pos === HOME_SQ) return false;
    if (card === "Sorry" || card === "Swap") return false;
    if (pos === YARD) return card === 1;
    const delta = card === 4 ? -4 : card === 10 ? (alt ? -1 : 10) : typeof card === "number" ? card : 0;
    const newPos = pos + delta;
    if (card === 4) return pos > 0;
    return newPos >= 0 && newPos <= HOME_SQ;
  }

  return (
    <div className="sorry-game">
      <div className={`race-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      {/* Card display */}
      <div className="sorry-card-area">
        {state.currentCard && (
          <div className="sorry-card">{cardLabel(state.currentCard)}</div>
        )}
        {canDraw && (
          <button className="roll-btn" onClick={() => dispatch({ type: "draw" } satisfies SorryAction)}>
            Draw Card
          </button>
        )}
      </div>

      {/* Players */}
      <div className="sorry-players">
        {Array.from({ length: state.numPlayers }, (_, pi) => (
          <div key={pi} className={`player-panel color-${COLORS[pi]} ${state.turn === pi && !state.winner ? "active-turn" : ""}`}>
            <div className="player-label">{LABELS[pi]}</div>
            <div className="pawn-list">
              {state.pawns[pi]!.map((pos, pawnIdx) => {
                const label = pos === YARD ? "Yard" : pos === HOME_SQ ? "Home" : `Sq ${pos}`;
                const moveable = canMovePawn(pawnIdx);
                const moveableAlt = choosing && state.currentCard === 10 && pi === 0 && canMovePawn(pawnIdx, true);
                const isSorryTarget = choosing && state.currentCard === "Sorry" && pi !== 0 && pos !== YARD && pos !== HOME_SQ;
                const isSwapTarget = choosing && state.currentCard === "Swap" && pi !== 0 && pos !== YARD && pos !== HOME_SQ;
                const isSwapSource = choosing && state.currentCard === "Swap" && pi === 0 && pos !== YARD && pos !== HOME_SQ;
                return (
                  <div key={pawnIdx} className="pawn-entry">
                    <span className={`pawn-token color-${COLORS[pi]} ${pos === HOME_SQ ? "finished" : ""}`}>
                      {pos === YARD ? "Y" : pos === HOME_SQ ? "H" : pawnIdx + 1}
                    </span>
                    <span className="pawn-pos">{label}</span>
                    {moveable && (
                      <button className="move-btn" onClick={() => dispatch({ type: "move", pawn: pawnIdx } satisfies SorryAction)}>
                        Move
                      </button>
                    )}
                    {moveableAlt && (
                      <button className="move-btn alt" onClick={() => dispatch({ type: "move", pawn: pawnIdx, alt: true } satisfies SorryAction)}>
                        -1
                      </button>
                    )}
                    {isSorryTarget && (
                      <button className="sorry-btn" onClick={() => dispatch({ type: "sorry", targetPlayer: pi, targetPawn: pawnIdx } satisfies SorryAction)}>
                        Sorry!
                      </button>
                    )}
                    {isSwapSource && state.numPlayers > 1 && (
                      <span className="swap-hint">↔</span>
                    )}
                    {isSwapTarget && (
                      // Find my on-board pawn to swap with
                      <button className="move-btn" onClick={() => {
                        const myPawn = state.pawns[0]!.findIndex((p) => p !== YARD && p !== HOME_SQ);
                        if (myPawn !== -1) dispatch({ type: "swap", myPawn, targetPlayer: pi, targetPawn: pawnIdx } satisfies SorryAction);
                      }}>
                        Swap
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sorry-info">
        Deck: {state.deck.length} cards remaining
      </div>
      <div className="race-legend">
        Card 1: bring out or move 1. Card 4: back 4. Card 10: +10 or -1. Card 11: +11. Sorry!: send home. Swap: trade places.
      </div>
    </div>
  );
}
