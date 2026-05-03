import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BigTwoState, BigTwoSettings } from "./state.js";
import { isTerminal, isLegalPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type BigTwoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

const SUIT_ORDER: Record<string, number> = { "♦": 0, "♣": 1, "♥": 2, "♠": 3 };
function cardSortVal(c: { rank: number; suit: string }): number {
  const rv = c.rank === 2 ? 15 : c.rank === 1 ? 14 : c.rank;
  return rv * 4 + (SUIT_ORDER[c.suit] ?? 0);
}

export function BigTwoGame({ state, dispatch, onGameOver }: GameProps<BigTwoState, BigTwoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, finishOrder } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";

  function toggleCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const selectedCards = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(selectedCards, lastPlay ?? null);
  const canPass = isMyTurn && lastPlay !== null;

  const sortedHand = [...myHand].sort((a, b) => cardSortVal(a) - cardSortVal(b));
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const positions = ["President", "2nd", "3rd", "Last"] as const;

  return (
    <div className="bigtwo">
      <div className="bigtwo-header">
        <h2>Big Two</h2>
        <div className="bigtwo-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "bigtwo-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${positions[finishOrder.indexOf(s)] ?? ""})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="bigtwo-pile">
        {lastPlay ? (
          <>
            <div className="bigtwo-pile-label">Last play ({seatName(state.lastPlaySeat!)}):</div>
            <div className="bigtwo-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div>
          </>
        ) : (
          <div className="bigtwo-new-round">New round — play any valid hand (must start with 3♦ first turn)</div>
        )}
      </div>

      <div className="bigtwo-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn — select cards, then Play" : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="bigtwo-hand-label">Your hand ({myHand.length}):</div>
          <div className="bigtwo-hand">
            {sortedHand.map(c => (
              <div key={c.id} className={`bigtwo-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="bigtwo-actions">
            <button data-testid="hint-target-big-two-play" className="bigtwo-btn play" onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as BigTwoAction); setSelected(new Set()); }} disabled={!canPlay}>
              Play ({selected.size})
            </button>
            <button data-testid="hint-target-big-two-pass" className="bigtwo-btn pass" onClick={() => { dispatch({ type: "pass" } as BigTwoAction); setSelected(new Set()); }} disabled={!canPass}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="bigtwo-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "bigtwo-you" : ""}>{seatName(s)}: {positions[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
