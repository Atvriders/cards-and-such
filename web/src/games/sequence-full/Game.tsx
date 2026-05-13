import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  type SequenceFullState,
  type SequenceFullSettings,
  type SequenceFullAction,
  isTerminal,
  BOARD_LABELS,
  BOARD_SIZE,
  isOneEyedJack,
  isTwoEyedJack,
  isDeadCard,
} from "./state.js";
import "./Game.css";

const SUIT_GLYPH: Record<string, string> = { H: "♥", D: "♦", C: "♣", S: "♠" };
const RED_SUITS = new Set(["H", "D"]);

function suitClass(suit: string): string {
  return RED_SUITS.has(suit) ? "sf-red" : "sf-black";
}

export function SequenceFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SequenceFullState, SequenceFullSettings>): JSX.Element {
  const term = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (term && !endedRef.current) {
      endedRef.current = true;
      onGameOver(term.score);
    }
  }, [term, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const playerHand = state.hands[0];
  const selectedIdx = state.selectedHandIdx;
  const selectedCard = selectedIdx !== null ? playerHand[selectedIdx] ?? null : null;

  function handleCardClick(i: number) {
    if (!isHumanTurn) return;
    if (state.phase === "select-remove") return;
    dispatch({ type: "select-card", handIdx: i } satisfies SequenceFullAction);
  }

  function handleCellClick(ci: number) {
    if (state.winner !== null) return;
    if (state.phase === "select-remove") {
      dispatch({ type: "remove-chip", cellIdx: ci } satisfies SequenceFullAction);
      return;
    }
    if (!isHumanTurn) return;
    if (selectedIdx === null || !selectedCard) return;
    dispatch({ type: "play", handIdx: selectedIdx, cellIdx: ci } satisfies SequenceFullAction);
  }

  function handleDiscardDead() {
    if (!isHumanTurn || selectedIdx === null || !selectedCard) return;
    if (!isDeadCard(state, selectedCard)) return;
    dispatch({ type: "discard-dead", handIdx: selectedIdx } satisfies SequenceFullAction);
  }

  function handleCancelRemove() {
    dispatch({ type: "cancel-remove" } satisfies SequenceFullAction);
  }

  let status = "";
  if (state.winner === 0) status = "You win! Two sequences claimed.";
  else if (state.winner === 1) status = "Bot wins. Better luck next time.";
  else if (state.phase === "select-remove") status = "Pick an opponent chip to remove (sequence chips are protected).";
  else if (!isHumanTurn) status = "Bot is thinking...";
  else if (selectedCard && isTwoEyedJack(selectedCard)) status = "Two-eyed Jack: click any empty space.";
  else if (selectedCard && isOneEyedJack(selectedCard)) status = "One-eyed Jack: click an opponent chip to remove.";
  else if (selectedCard) status = "Click a matching empty space to place your chip.";
  else status = "Choose a card from your hand.";

  // Build cells
  const cells: JSX.Element[] = [];
  for (let i = 0; i < 100; i++) {
    const lbl = BOARD_LABELS[i]!;
    const chip = state.board[i];
    const locked = state.lockedFor[i];
    const r = Math.floor(i / BOARD_SIZE);
    const c = i % BOARD_SIZE;
    let bodyClass = "sf-cell";
    if (lbl.isFree) bodyClass += " sf-free";
    if (chip === 0) bodyClass += " sf-chip-p";
    if (chip === 1) bodyClass += " sf-chip-b";
    if (locked !== null) bodyClass += " sf-locked";
    // Highlight legal targets when a card is selected.
    if (isHumanTurn && state.phase === "playing" && selectedCard) {
      if (isTwoEyedJack(selectedCard) && chip === null && !lbl.isFree) {
        bodyClass += " sf-target";
      } else if (isOneEyedJack(selectedCard) && chip === 1 && locked !== 1) {
        bodyClass += " sf-target sf-target-remove";
      } else if (
        !isOneEyedJack(selectedCard) && !isTwoEyedJack(selectedCard) &&
        chip === null && !lbl.isFree && lbl.card &&
        lbl.card.rank === selectedCard.rank && lbl.card.suit === selectedCard.suit
      ) {
        bodyClass += " sf-target";
      }
    } else if (state.phase === "select-remove" && chip === 1 && locked !== 1) {
      bodyClass += " sf-target sf-target-remove";
    }

    cells.push(
      <button
        key={i}
        className={bodyClass}
        onClick={() => handleCellClick(i)}
        data-testid={`sf-cell-${r}-${c}`}
        title={lbl.isFree
          ? "Free corner — counts for any sequence"
          : lbl.card
          ? `${lbl.card.rank}${SUIT_GLYPH[lbl.card.suit] ?? ""}`
          : ""}
        aria-label={lbl.isFree ? "Free corner" : (lbl.card ? `${lbl.card.rank} of ${lbl.card.suit}` : "")}
      >
        {lbl.isFree ? (
          <span className="sf-cell-free">FREE</span>
        ) : lbl.card ? (
          <span className={`sf-cell-face ${suitClass(lbl.card.suit)}`}>
            <span className="sf-rank">{lbl.card.rank}</span>
            <span className="sf-suit">{SUIT_GLYPH[lbl.card.suit] ?? ""}</span>
          </span>
        ) : null}
        {chip !== null && (
          <span className={`sf-chip ${chip === 0 ? "sf-chip-player" : "sf-chip-bot"} ${locked !== null ? "sf-chip-locked" : ""}`} />
        )}
      </button>
    );
  }

  return (
    <div className="sf-root fade-in">
      <div className="sf-header">
        <div className="sf-scores pulse">
          <span className="sf-score-chip sf-score-p">You: {state.sequences[0]}/2</span>
          <span className="sf-score-chip sf-score-b">Bot: {state.sequences[1]}/2</span>
          <span className="sf-deck-info">Deck: {state.deck.length}</span>
        </div>
        <div className="sf-status">{status}</div>
      </div>

      <div
        className="sf-board"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {cells}
      </div>

      <div className="sf-hand-section">
        <div className="sf-hand-label">Your hand:</div>
        <div className="sf-hand">
          {playerHand.map((card, i) => {
            const isSel = i === selectedIdx;
            const dead = isDeadCard(state, card);
            let cls = "sf-handcard";
            if (isSel) cls += " sf-handcard-sel";
            if (dead) cls += " sf-handcard-dead";
            const label = card.rank === "J"
              ? (isTwoEyedJack(card) ? "Two-eyed Jack (wild)" : "One-eyed Jack (remove)")
              : `${card.rank} of ${card.suit}`;
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleCardClick(i)}
                data-testid={`sf-hand-${i}`}
                title={label}
                aria-label={label}
                disabled={!isHumanTurn || state.phase === "select-remove"}
              >
                <span className={`sf-cardface ${suitClass(card.suit)}`}>
                  <span className="sf-rank">{card.rank}</span>
                  <span className="sf-suit">{SUIT_GLYPH[card.suit] ?? ""}</span>
                </span>
                {card.rank === "J" && (
                  <span className="sf-jack-tag">{isTwoEyedJack(card) ? "wild" : "remove"}</span>
                )}
                {dead && card.rank !== "J" && <span className="sf-dead-tag">dead</span>}
              </button>
            );
          })}
        </div>
        <div className="sf-actions">
          {state.phase === "select-remove" && (
            <button
              type="button"
              className="sf-action-btn"
              onClick={handleCancelRemove}
              title="Cancel removing a chip"
            >
              Cancel
            </button>
          )}
          {state.phase === "playing" && selectedCard && isDeadCard(state, selectedCard) && (
            <button
              type="button"
              className="sf-action-btn"
              onClick={handleDiscardDead}
              title="Discard a dead card (both board spaces are already covered) and draw a replacement"
              data-testid="sf-discard-dead"
            >
              Discard dead card
            </button>
          )}
        </div>
        <div className="sf-last">{state.lastAction}</div>
      </div>

      {state.winner !== null && (
        <div className="sf-overlay bounce-in">
          <div className="sf-overlay-inner">
            <div className="sf-overlay-title">
              {state.winner === 0 ? "Victory!" : "Defeat"}
            </div>
            <div className="sf-overlay-body">
              Final: You {state.sequences[0]} – {state.sequences[1]} Bot
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
