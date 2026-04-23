import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PusoyDosState, PusoyDosSettings } from "./state.js";
import { isTerminal, isLegalPlay, rankVal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type PusoyDosAction = { type: "play"; cardIds: string[] } | { type: "pass" };

const SUIT_ORDER: Record<string, number> = { "♦": 0, "♣": 1, "♥": 2, "♠": 3 };
function cv(c: { rank: number; suit: string }) { return rankVal(c.rank as Parameters<typeof rankVal>[0]) * 4 + (SUIT_ORDER[c.suit] ?? 0); }

export function PusoyDosGame({ state, dispatch, onGameOver }: GameProps<PusoyDosState, PusoyDosSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, finishOrder, score } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";
  const toggle = (id: string) => isMyTurn && setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const sel = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(sel, lastPlay ?? null);
  const canPass = isMyTurn && lastPlay !== null;
  const sorted = [...myHand].sort((a, b) => cv(a) - cv(b));
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const places = ["Winner", "2nd", "3rd", "Last"] as const;

  return (
    <div className="pusoy">
      <div className="pusoy-header"><h2>Pusoy Dos</h2>
        <div className="pusoy-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "pusoy-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${places[finishOrder.indexOf(s)]})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="pusoy-pile">
        {lastPlay ? (
          <><div className="pusoy-pile-label">Last play ({seatName(state.lastPlaySeat!)}):</div>
            <div className="pusoy-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div></>
        ) : <div className="pusoy-new-round">New round — any valid hand</div>}
      </div>

      <div className="pusoy-status">
        {phase === "playing" ? (isMyTurn ? "Your turn" : `${seatName(turn)}'s turn…`) : `Game Over! Score: ${score}`}
      </div>

      {phase === "playing" && (
        <>
          <div className="pusoy-hand">
            {sorted.map(c => (
              <div key={c.id} className={`pusoy-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " click" : ""}`} onClick={() => toggle(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="pusoy-actions">
            <button className="pusoy-btn play" disabled={!canPlay}
              onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as PusoyDosAction); setSelected(new Set()); }}>
              Play ({selected.size})
            </button>
            <button className="pusoy-btn pass" disabled={!canPass}
              onClick={() => { dispatch({ type: "pass" } as PusoyDosAction); setSelected(new Set()); }}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="pusoy-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "pusoy-you" : ""}>{seatName(s)}: {places[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
          {finishOrder[0] === 0 && <div className="pusoy-pts">You won {score} points!</div>}
        </div>
      )}
    </div>
  );
}
