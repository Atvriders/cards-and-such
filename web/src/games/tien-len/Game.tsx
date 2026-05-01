import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TienLenState, TienLenSettings } from "./state.js";
import { isTerminal, isLegalPlay, rankVal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type TienLenAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export function TienLenGame({ state, dispatch, onGameOver }: GameProps<TienLenState, TienLenSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, finishOrder } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";

  const toggle = (id: string) => isMyTurn && setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const sel = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(sel, lastPlay ?? null);
  const canPass = isMyTurn && lastPlay !== null;
  const sorted = [...myHand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const places = ["1st", "2nd", "3rd", "4th"] as const;

  return (
    <div className="tienlen tl-shed">
      <div className="tienlen-header">
        <h2>Tien Len</h2>
        <div className="tienlen-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "tienlen-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${places[finishOrder.indexOf(s)]})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="tienlen-pile">
        {lastPlay ? (
          <>
            <div className="tienlen-pile-label">Played by {seatName(state.lastPlaySeat!)}:</div>
            <div className="tienlen-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div>
          </>
        ) : <div className="tienlen-new-round">New round — play any valid hand</div>}
      </div>

      <div className="tienlen-status">
        {phase === "playing" ? (isMyTurn ? "Your turn" : `${seatName(turn)}'s turn…`) : "Game Over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="tienlen-hand">
            {sorted.map(c => (
              <div key={c.id} className={`tienlen-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " click" : ""}`} onClick={() => toggle(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="tienlen-actions">
            <button className="tienlen-btn play" disabled={!canPlay}
              onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as TienLenAction); setSelected(new Set()); }}>
              Play ({selected.size})
            </button>
            <button className="tienlen-btn pass" disabled={!canPass}
              onClick={() => { dispatch({ type: "pass" } as TienLenAction); setSelected(new Set()); }}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="tienlen-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "tienlen-you" : ""}>{seatName(s)}: {places[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
