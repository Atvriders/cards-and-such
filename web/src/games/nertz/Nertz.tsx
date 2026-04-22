import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NertzState, NertzSettings } from "./state.js";
import { isTerminal, canPlayToCenter, canPlayToRiver } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./Nertz.css";

type NertzAction =
  | { type: "play-nertz-to-center" }
  | { type: "play-river-to-center"; riverIdx: number }
  | { type: "play-stream-to-center" }
  | { type: "play-nertz-to-river"; riverIdx: number }
  | { type: "play-river-to-river"; fromIdx: number; toIdx: number }
  | { type: "play-stream-to-river"; riverIdx: number }
  | { type: "flip-stream" }
  | { type: "bot-tick" }
  | { type: "restart" };

type CardSource = "nertz" | { river: number } | "stream";

function NCard({ card, selected, onClick }: { card: Card | null; selected?: boolean; onClick?: () => void }) {
  if (!card) return <div className="nertz-card empty-slot" onClick={onClick}>—</div>;
  const colorClass = isRed(card.suit) ? "red-suit" : "black-suit";
  return (
    <div className={`nertz-card ${colorClass}${selected ? " selected" : ""}`} onClick={onClick}>
      <div>{rankLabel(card.rank)}</div>
      <div>{card.suit}</div>
    </div>
  );
}

function FaceDown({ count, onClick }: { count: number; onClick?: () => void }) {
  return <div className="nertz-card facedown" onClick={onClick}>{count}</div>;
}

export function Nertz({ state, dispatch, onGameOver }: GameProps<NertzState, NertzSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sel, setSel] = useState<CardSource | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      tickRef.current = setInterval(() => dispatch({ type: "bot-tick" } as NertzAction), 700);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  function dis(a: NertzAction) { dispatch(a); }

  function getSelCard(): Card | null {
    if (!sel) return null;
    if (sel === "nertz") return state.playerNertzPile[state.playerNertzPile.length - 1] ?? null;
    if (sel === "stream") return state.playerStreamHand[state.playerStreamHand.length - 1] ?? null;
    const pile = state.playerRiver[sel.river];
    return (pile && pile.length > 0) ? pile[pile.length - 1]! : null;
  }

  function handleRiverClick(idx: number) {
    if (!sel) {
      const pile = state.playerRiver[idx];
      if (pile && pile.length > 0) setSel({ river: idx });
      return;
    }
    const card = getSelCard();
    if (!card) { setSel(null); return; }
    const target = state.playerRiver[idx]!;
    if (!canPlayToRiver(card, target)) { setSel(null); return; }
    if (sel === "nertz") dis({ type: "play-nertz-to-river", riverIdx: idx });
    else if (sel === "stream") dis({ type: "play-stream-to-river", riverIdx: idx });
    else if (typeof sel === "object") dis({ type: "play-river-to-river", fromIdx: sel.river, toIdx: idx });
    setSel(null);
  }

  function handleCenter() {
    if (!sel) return;
    const card = getSelCard();
    if (!card || !canPlayToCenter(card, state.centerPiles)) { setSel(null); return; }
    if (sel === "nertz") dis({ type: "play-nertz-to-center" });
    else if (sel === "stream") dis({ type: "play-stream-to-center" });
    else if (typeof sel === "object") dis({ type: "play-river-to-center", riverIdx: sel.river });
    setSel(null);
  }

  const suits = ["♠", "♥", "♦", "♣"] as const;
  const selCard = getSelCard();

  return (
    <div className="nertz-game">
      <div className="nertz-title">Nertz</div>
      <div className="nertz-status">
        Your Nertz: <strong>{state.playerNertzPile.length}</strong> | Bot Nertz: <strong>{state.botNertzPile.length}</strong>
      </div>
      {terminal && (
        <div className="nertz-game-over">
          {state.winner === "player" ? "You win!" : "Bot wins!"} — Score: {terminal.score}
        </div>
      )}

      <div className="nertz-center">
        <div className="nertz-section-label">Center Piles (shared) — click selected card to play here</div>
        <div className="nertz-center-piles">
          {suits.map(suit => {
            const pile = state.centerPiles[suit] ?? [];
            const top = pile[pile.length - 1] ?? null;
            const canPlay = selCard ? canPlayToCenter(selCard, state.centerPiles) && selCard.suit === suit : false;
            return <NCard key={suit} card={top ?? { suit, rank: 0 as never, id: `empty-${suit}` }} selected={canPlay} onClick={handleCenter} />;
          })}
        </div>
        {selCard && canPlayToCenter(selCard, state.centerPiles) && (
          <div className="nertz-hint">Click center pile to play {rankLabel(selCard.rank)}{selCard.suit}</div>
        )}
      </div>

      <div className="nertz-player-area">
        <div className="nertz-half">
          <div className="nertz-section-label">Your Area</div>
          <div className="nertz-row">
            <div>
              <div className="nertz-section-label">Nertz ({state.playerNertzPile.length})</div>
              {state.playerNertzPile.length > 0
                ? <NCard card={state.playerNertzPile[state.playerNertzPile.length - 1]!} selected={sel === "nertz"} onClick={() => setSel(s => s === "nertz" ? null : "nertz")} />
                : <div className="nertz-card empty-slot">—</div>
              }
            </div>
            <div>
              <div className="nertz-section-label">Stream ({state.playerStream.length})</div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {state.playerStream.length > 0
                  ? <FaceDown count={state.playerStream.length} onClick={() => dis({ type: "flip-stream" })} />
                  : <div className="nertz-card empty-slot" onClick={() => dis({ type: "flip-stream" })}>↺</div>
                }
                {state.playerStreamHand.length > 0
                  ? <NCard card={state.playerStreamHand[state.playerStreamHand.length - 1]!} selected={sel === "stream"} onClick={() => setSel(s => s === "stream" ? null : "stream")} />
                  : <div className="nertz-card empty-slot">—</div>
                }
              </div>
            </div>
          </div>
          <div>
            <div className="nertz-section-label">River</div>
            <div className="nertz-row">
              {state.playerRiver.map((pile, i) => {
                const top = pile[pile.length - 1] ?? null;
                const isSel = typeof sel === "object" && sel !== null && "river" in sel && sel.river === i;
                return <NCard key={i} card={top} selected={isSel} onClick={() => handleRiverClick(i)} />;
              })}
            </div>
          </div>
          {sel && <div className="nertz-hint">Selected: {selCard ? `${rankLabel(selCard.rank)}${selCard.suit}` : "?"} — click destination</div>}
          {!sel && <div className="nertz-hint">Click a card to select it</div>}
        </div>

        <div className="nertz-half" style={{ opacity: 0.8 }}>
          <div className="nertz-section-label">Bot Area</div>
          <div className="nertz-row">
            <FaceDown count={state.botNertzPile.length} />
            <div>
              <div className="nertz-section-label">River</div>
              <div className="nertz-row">
                {state.botRiver.map((pile, i) => {
                  const top = pile[pile.length - 1] ?? null;
                  return <NCard key={i} card={top} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {terminal && (
        <button className="nertz-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
