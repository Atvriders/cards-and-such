import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LastCardState, LastCardSettings } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { isTerminal, canPlayOn } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type LastCardAction =
  | { type: "play"; cardId: string; suit?: Suit }
  | { type: "draw" }
  | { type: "callLastCard" };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function LastCardGame({ state, dispatch, onGameOver }: GameProps<LastCardState, LastCardSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSuitPicker, setShowSuitPicker] = useState(false);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, discard, currentSuit, phase, drawPending } = state;
  const myHand = hands[0]!;
  const topCard = discard[discard.length - 1]!;
  const isMyTurn = turn === 0 && phase === "playing";
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  function selectCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => prev === id ? null : id);
    setShowSuitPicker(false);
  }

  function playCard(suit?: Suit): void {
    if (!selected) return;
    dispatch({ type: "play", cardId: selected, suit } as LastCardAction);
    setSelected(null);
    setShowSuitPicker(false);
  }

  const selectedCard = selected ? myHand.find(c => c.id === selected) : null;
  const canPlay = isMyTurn && selectedCard ? canPlayOn(selectedCard, topCard, currentSuit) : false;
  const selectedIsWild = selectedCard?.rank === 8;

  return (
    <div className="lastcard">
      <div className="lastcard-header">
        <h2>Last Card</h2>
        <div className="lastcard-info">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "" : ""}>
              {seatName(s)}: {hands[s]!.length} card{hands[s]!.length !== 1 ? "s" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="lastcard-pile">
        <div>
          <div className="lastcard-pile-label">Top card:</div>
          <Card card={topCard} />
        </div>
        <div>
          <div className="lastcard-pile-label">Current suit:</div>
          <div className="lastcard-suit-indicator">{currentSuit}</div>
        </div>
        {drawPending > 0 && <div style={{ color: "#ff8a65", fontWeight: 700 }}>Draw {drawPending} pending!</div>}
      </div>

      <div className="lastcard-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn" : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
        {state.direction === -1 && phase === "playing" && " (reversed)"}
      </div>

      {phase === "playing" && isMyTurn && showSuitPicker && (
        <div className="lastcard-suit-picker">
          <span>Choose suit:</span>
          {SUITS.map(s => (
            <button key={s} className="lastcard-suit-btn" onClick={() => playCard(s)}>{s}</button>
          ))}
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="lastcard-hand-label">Your hand ({myHand.length}):</div>
          <div className="lastcard-hand">
            {myHand.map(c => (
              <div key={c.id}
                className={`lastcard-slot${selected === c.id ? " sel" : ""}${isMyTurn ? " clickable" : ""}${isMyTurn && !canPlayOn(c, topCard, currentSuit) && selected !== c.id ? " dimmed" : ""}`}
                onClick={() => selectCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="lastcard-actions">
            {canPlay && !selectedIsWild && (
              <button className="lastcard-btn play" onClick={() => playCard()}>
                Play card
              </button>
            )}
            {canPlay && selectedIsWild && (
              <button className="lastcard-btn play" onClick={() => setShowSuitPicker(true)}>
                Play 8 (choose suit)
              </button>
            )}
            <button className="lastcard-btn draw" onClick={() => dispatch({ type: "draw" } as LastCardAction)} disabled={!isMyTurn}>
              {drawPending > 0 ? `Draw ${drawPending}` : "Draw"}
            </button>
            {myHand.length === 2 && (
              <button className="lastcard-btn lastcall" onClick={() => dispatch({ type: "callLastCard" } as LastCardAction)}>
                Call "Last Card!"
              </button>
            )}
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="lastcard-result">
          <h3>Game Over!</h3>
          {hands[0]!.length === 0
            ? <div className="lastcard-win">You win!</div>
            : <div>Better luck next time!</div>}
        </div>
      )}
    </div>
  );
}
