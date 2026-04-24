import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZhengState, ZhengSettings } from "./state.js";
import { isTerminal, isLegalPlay, classifyPlay } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type ZhengAction = { type: "play"; cardIds: string[] } | { type: "pass" };

function cardSortVal(c: { rank: number }): number {
  if (c.rank === 2) return 15;
  if (c.rank === 1) return 14;
  return c.rank;
}

export function ZhengGame({ state, dispatch, onGameOver }: GameProps<ZhengState, ZhengSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, lastPlayType, phase, finishOrder } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";

  function toggleCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const selectedCards = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(selectedCards, lastPlay ?? null, lastPlayType ?? null);
  const canPass = isMyTurn && lastPlay !== null;
  const selectedType = classifyPlay(selectedCards);

  const sortedHand = [...myHand].sort((a, b) => cardSortVal(a) - cardSortVal(b));
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;
  const positions = ["1st", "2nd", "3rd", "4th"] as const;

  return (
    <div className="zheng">
      <div className="zheng-header">
        <h2>Zheng Shangyou</h2>
        <div className="zheng-seats">
          {[0, 1, 2, 3].map(s => (
            <span key={s} className={turn === s && phase === "playing" ? "zheng-active" : ""}>
              {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? ` (${positions[finishOrder.indexOf(s)] ?? ""})` : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="zheng-pile">
        {lastPlay ? (
          <>
            <div className="zheng-pile-label">Last play ({seatName(state.lastPlaySeat!)}): {lastPlayType}</div>
            <div className="zheng-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div>
          </>
        ) : (
          <div className="zheng-new-round">Lead any valid combination</div>
        )}
      </div>

      <div className="zheng-status">
        {phase === "playing"
          ? isMyTurn
            ? `Your turn${selectedCards.length > 0 ? ` — ${selectedType ?? "invalid combo"}` : " — select cards"}`
            : `Waiting for ${seatName(turn)}…`
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="zheng-hand-label">Your hand ({myHand.length}):</div>
          <div className="zheng-hand">
            {sortedHand.map(c => (
              <div key={c.id} className={`zheng-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggleCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="zheng-actions">
            <button className="zheng-btn play" onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as ZhengAction); setSelected(new Set()); }} disabled={!canPlay}>
              Play ({selected.size})
            </button>
            <button className="zheng-btn pass" onClick={() => { dispatch({ type: "pass" } as ZhengAction); setSelected(new Set()); }} disabled={!canPass}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="zheng-result">
          <h3>Game Over!</h3>
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={s === 0 ? "zheng-you" : ""}>{seatName(s)}: {positions[finishOrder.indexOf(s)] ?? "?"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
