import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TichuState, TichuSettings } from "./state.js";
import { isTerminal, isLegalPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type TichuAction = { type: "play"; cardIds: string[] } | { type: "pass" };

function cardSortVal(c: { rank: number }): number {
  if (c.rank === 2) return 15;
  if (c.rank === 1) return 14;
  return c.rank;
}

export function TichuGame({ state, dispatch, onGameOver }: GameProps<TichuState, TichuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, finishOrder, scores } = state;
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
  const finishRank = ["1st", "2nd", "3rd", "4th"] as const;

  return (
    <div className="tichu">
      <div className="tichu-header">
        <h2>Tichu</h2>
        <div className="tichu-teams">
          <span className="tichu-team">Your Team (You+Bot2): {scores[0]} pts</span>
          <span className="tichu-team">Opponents (Bot1+Bot3): {scores[1]} pts</span>
        </div>
        <div className="tichu-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "tichu-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${finishRank[finishOrder.indexOf(s)] ?? ""})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="tichu-pile">
        {lastPlay ? (
          <>
            <div className="tichu-pile-label">Last play ({seatName(state.lastPlaySeat!)}):</div>
            <div className="tichu-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div>
          </>
        ) : (
          <div className="tichu-new-round">Lead any set of same-rank cards</div>
        )}
      </div>

      <div className="tichu-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn — select cards, then Play" : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="tichu-hand-label">Your hand ({myHand.length}):</div>
          <div className="tichu-hand">
            {sortedHand.map(c => (
              <div key={c.id} className={`tichu-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="tichu-actions">
            <button className="tichu-btn play" onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as TichuAction); setSelected(new Set()); }} disabled={!canPlay}>
              Play ({selected.size})
            </button>
            <button className="tichu-btn pass" onClick={() => { dispatch({ type: "pass" } as TichuAction); setSelected(new Set()); }} disabled={!canPass}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="tichu-result">
          <h3>Game Over!</h3>
          <div className="tichu-you">Your Team: {scores[0]} pts</div>
          <div>Opponents: {scores[1]} pts</div>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "tichu-you" : ""}>{seatName(s)}: {finishRank[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
