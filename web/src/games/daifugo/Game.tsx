import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DaifugoState, DaifugoSettings } from "./state.js";
import { isTerminal, isLegalPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type DaifugoAction = { type: "play"; cardIds: string[] } | { type: "pass" };

function cardSortVal(c: { rank: number }): number {
  if (c.rank === 2) return 15;
  if (c.rank === 1) return 14;
  return c.rank;
}

export function DaifugoGame({ state, dispatch, onGameOver }: GameProps<DaifugoState, DaifugoSettings>): JSX.Element {
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
  const ranks = ["Daifugo", "Fugo", "Hinmin", "Daihinmin"] as const;

  return (
    <div className="daifugo">
      <div className="daifugo-header">
        <h2>Daifugo</h2>
        <div className="daifugo-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "daifugo-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${ranks[finishOrder.indexOf(s)] ?? ""})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="daifugo-pile">
        {lastPlay ? (
          <>
            <div className="daifugo-pile-label">Last play ({seatName(state.lastPlaySeat!)}):</div>
            <div className="daifugo-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div>
          </>
        ) : (
          <div className="daifugo-new-round">New round — lead any card(s) of the same rank</div>
        )}
      </div>

      <div className="daifugo-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn — select cards, then Play" : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="daifugo-hand-label">Your hand ({myHand.length}):</div>
          <div className="daifugo-hand">
            {sortedHand.map(c => (
              <div key={c.id} className={`daifugo-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="daifugo-actions">
            <button data-testid="hint-target-daifugo-play" className="daifugo-btn play" onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as DaifugoAction); setSelected(new Set()); }} disabled={!canPlay}>
              Play ({selected.size})
            </button>
            <button className="daifugo-btn pass" onClick={() => { dispatch({ type: "pass" } as DaifugoAction); setSelected(new Set()); }} disabled={!canPass}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="daifugo-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "daifugo-you" : ""}>{seatName(s)}: {ranks[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
