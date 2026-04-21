import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PresidentState, PresidentSettings } from "./state.js";
import { isTerminal, isLegalPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./President.css";

type PresidentAction = { type: "play"; cardIds: string[] } | { type: "pass" };

const TITLES = ["President", "Vice", "Scum", "Double Scum"];

export function President({
  state,
  dispatch,
  onGameOver,
}: GameProps<PresidentState, PresidentSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, titles, finishOrder } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";

  function toggleCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function playSelected(): void {
    const ids = Array.from(selected);
    dispatch({ type: "play", cardIds: ids } as PresidentAction);
    setSelected(new Set());
  }

  function pass(): void {
    dispatch({ type: "pass" } as PresidentAction);
    setSelected(new Set());
  }

  const selectedCards = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(selectedCards, lastPlay ?? null);
  const canPass = isMyTurn && lastPlay !== null;

  function seatName(s: number): string {
    return s === 0 ? "You" : `Bot ${s}`;
  }

  const sortedHand = myHand.slice().sort((a, b) => {
    const aVal = a.rank === 2 ? 15 : a.rank === 1 ? 14 : a.rank;
    const bVal = b.rank === 2 ? 15 : b.rank === 1 ? 14 : b.rank;
    return aVal - bVal;
  });

  return (
    <div className="president">
      <div className="president-header">
        <h2>President</h2>
        <div className="president-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "active-turn" : ""}>
              {seatName(s)}: {hands[s]!.length}
              {finishOrder.includes(s) ? ` (${TITLES[finishOrder.indexOf(s)] ?? ""})` : ""}
            </span>
          ))}
        </div>
      </div>

      {lastPlay && (
        <div className="president-last-play">
          <span className="president-last-label">Last played by {seatName(state.lastPlaySeat!)}:</span>
          <div className="president-last-cards">
            {lastPlay.map(c => <Card key={c.id} card={c} />)}
          </div>
          <span className="president-last-note">({lastPlay.length}× {rankLabel(lastPlay[0]!.rank)})</span>
        </div>
      )}

      {!lastPlay && phase === "playing" && (
        <div className="president-new-round">New round — any card(s) of same rank</div>
      )}

      <div className="president-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn — select cards to play" : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="president-hand-label">Your hand ({myHand.length}):</div>
          <div className="president-hand">
            {sortedHand.map(c => (
              <div
                key={c.id}
                className={`president-card-slot${selected.has(c.id) ? " selected" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}
              >
                <Card card={c} />
              </div>
            ))}
          </div>

          <div className="president-actions">
            <button
              className="president-btn play-btn"
              onClick={playSelected}
              disabled={!canPlay}
            >
              Play ({selected.size})
            </button>
            <button
              className="president-btn pass-btn"
              onClick={pass}
              disabled={!canPass}
            >
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && titles && (
        <div className="president-result">
          <h2>Game Over!</h2>
          <div className="president-titles">
            {[0, 1, 2, 3].map(s => (
              <div key={s} className={`president-title-row${s === 0 ? " you" : ""}`}>
                {seatName(s)}: <strong>{titles[s]}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
