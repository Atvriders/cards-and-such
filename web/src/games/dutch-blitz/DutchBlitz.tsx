import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DutchBlitzState, DutchBlitzSettings, DBCard } from "./state.js";
import { isTerminal, canPlayToCenter, canPlayToPost } from "./state.js";
import "./DutchBlitz.css";

type DutchBlitzAction =
  | { type: "play-blitz-to-center"; centerIdx: number }
  | { type: "play-post-to-center"; postIdx: number; centerIdx: number }
  | { type: "play-wood-to-center"; centerIdx: number }
  | { type: "play-blitz-to-post"; postIdx: number }
  | { type: "play-wood-to-post"; postIdx: number }
  | { type: "flip-wood" }
  | { type: "bot-tick" }
  | { type: "restart" };

type CardSource = { from: "blitz" } | { from: "post"; postIdx: number } | { from: "wood" };

function DBCardView({ card, selected, onClick, className = "" }: {
  card: DBCard | null;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  faceDown?: boolean;
}) {
  if (!card) {
    return (
      <div className={`db-pile-slot ${className}`} onClick={onClick}>
        empty
      </div>
    );
  }
  return (
    <div
      className={`db-card ${card.color}${selected ? " selected" : ""} ${className}`}
      onClick={onClick}
    >
      <div>{card.rank}</div>
    </div>
  );
}

function FaceDownCard({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <div className="db-card facedown" onClick={onClick} style={{ position: "relative" }}>
      <div style={{ fontSize: "0.7rem" }}>{count}</div>
    </div>
  );
}

export function DutchBlitz({
  state,
  dispatch,
  onGameOver,
}: GameProps<DutchBlitzState, DutchBlitzSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedSource, setSelectedSource] = useState<CardSource | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      tickRef.current = setInterval(() => {
        dispatch({ type: "bot-tick" } as DutchBlitzAction);
      }, 600);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  function dis(a: DutchBlitzAction): void {
    dispatch(a);
  }

  function getSelectedCard(): DBCard | null {
    if (!selectedSource) return null;
    if (selectedSource.from === "blitz") return state.playerBlitzPile[state.playerBlitzPile.length - 1] ?? null;
    if (selectedSource.from === "wood") return state.playerWoodHand[0] ?? null;
    if (selectedSource.from === "post") {
      const pp = state.playerPostPiles[selectedSource.postIdx];
      return (pp && pp.length > 0) ? pp[pp.length - 1]! : null;
    }
    return null;
  }

  function handleCenterClick(i: number): void {
    if (!selectedSource) return;
    const card = getSelectedCard();
    if (!card || !canPlayToCenter(card, state.centerPiles[i] ?? [])) {
      setSelectedSource(null);
      return;
    }
    if (selectedSource.from === "blitz") dis({ type: "play-blitz-to-center", centerIdx: i });
    else if (selectedSource.from === "wood") dis({ type: "play-wood-to-center", centerIdx: i });
    else if (selectedSource.from === "post") dis({ type: "play-post-to-center", postIdx: selectedSource.postIdx, centerIdx: i });
    setSelectedSource(null);
  }

  function handleNewCenter(): void {
    if (!selectedSource) return;
    const card = getSelectedCard();
    if (!card || card.rank !== 1) { setSelectedSource(null); return; }
    const newIdx = state.centerPiles.length;
    if (selectedSource.from === "blitz") dis({ type: "play-blitz-to-center", centerIdx: newIdx });
    else if (selectedSource.from === "wood") dis({ type: "play-wood-to-center", centerIdx: newIdx });
    else if (selectedSource.from === "post") dis({ type: "play-post-to-center", postIdx: selectedSource.postIdx, centerIdx: newIdx });
    setSelectedSource(null);
  }

  function handlePostClick(postIdx: number): void {
    if (!selectedSource) {
      // select this post pile
      const pp = state.playerPostPiles[postIdx];
      if (pp && pp.length > 0) setSelectedSource({ from: "post", postIdx });
      return;
    }
    // try to play selected to this post
    const card = getSelectedCard();
    if (!card) { setSelectedSource(null); return; }
    const pp = state.playerPostPiles[postIdx];
    if (!pp || !canPlayToPost(card, pp)) { setSelectedSource(null); return; }
    if (selectedSource.from === "blitz") dis({ type: "play-blitz-to-post", postIdx });
    else if (selectedSource.from === "wood") dis({ type: "play-wood-to-post", postIdx });
    setSelectedSource(null);
  }

  const selCard = getSelectedCard();
  const blitzTop = state.playerBlitzPile[state.playerBlitzPile.length - 1] ?? null;
  const woodTop = state.playerWoodHand[0] ?? null;

  return (
    <div className="dutch-blitz-game">
      <div className="db-title">Dutch Blitz</div>
      <div className="db-status">
        Your blitz: <strong>{state.playerBlitzPile.length}</strong> | Bot blitz: <strong>{state.botBlitzPile.length}</strong>
      </div>

      {terminal && (
        <div className="db-game-over">
          {state.winner === "player" ? "🎉 You win!" : "Bot wins!"}<br />
          Score: {terminal.score}
        </div>
      )}

      <div className="db-center-section">
        <div className="db-section-label">Center Piles — click a pile to play selected card</div>
        <div className="db-center-piles">
          {state.centerPiles.map((pile, i) => {
            const top = pile[pile.length - 1] ?? null;
            const canPlay = selCard ? canPlayToCenter(selCard, pile) : false;
            return (
              <div
                key={i}
                className={`db-card ${top?.color ?? "facedown"}${canPlay ? " selected" : ""}`}
                onClick={() => handleCenterClick(i)}
                style={{ cursor: selectedSource ? "pointer" : "default" }}
              >
                {top ? top.rank : "?"}
              </div>
            );
          })}
          {selCard?.rank === 1 && (
            <div className="db-pile-slot" onClick={handleNewCenter} style={{ borderColor: "yellow" }}>
              +NEW
            </div>
          )}
          {state.centerPiles.length === 0 && !selCard && (
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", alignSelf: "center" }}>
              No center piles yet — play a 1 to start one
            </div>
          )}
        </div>
      </div>

      <div className="db-player-area">
        <div className="db-player-section">
          <div className="db-section-label">Your Area</div>
          <div className="db-piles-row">
            <div>
              <div className="db-blitz-count">Blitz ({state.playerBlitzPile.length})</div>
              {blitzTop
                ? <DBCardView card={blitzTop} selected={selectedSource?.from === "blitz"} onClick={() => setSelectedSource(s => s?.from === "blitz" ? null : { from: "blitz" })} />
                : <div className="db-pile-slot">empty</div>
              }
            </div>
            <div>
              <div className="db-card-count">Wood ({state.playerWoodPile.length})</div>
              <div className="db-wood-area">
                {state.playerWoodPile.length > 0
                  ? <FaceDownCard count={state.playerWoodPile.length} onClick={() => dis({ type: "flip-wood" })} />
                  : <div className="db-pile-slot" onClick={() => dis({ type: "flip-wood" })}>↺</div>
                }
                {woodTop
                  ? <DBCardView card={woodTop} selected={selectedSource?.from === "wood"} onClick={() => setSelectedSource(s => s?.from === "wood" ? null : { from: "wood" })} />
                  : <div className="db-pile-slot" style={{ fontSize: "0.6rem" }}>flip</div>
                }
              </div>
            </div>
          </div>
          <div>
            <div className="db-card-count">Post Piles</div>
            <div className="db-post-piles">
              {state.playerPostPiles.map((pile, i) => {
                const top = pile[pile.length - 1] ?? null;
                const isSel = selectedSource?.from === "post" && (selectedSource as { from: "post"; postIdx: number }).postIdx === i;
                return <DBCardView key={i} card={top} selected={isSel} onClick={() => handlePostClick(i)} />;
              })}
            </div>
          </div>
          {selectedSource && (
            <div style={{ fontSize: "0.8rem", color: "#ffcc02" }}>
              Selected: {selCard ? `${selCard.color} ${selCard.rank}` : "none"} — click destination
            </div>
          )}
        </div>

        <div className="db-bot-section">
          <div className="db-section-label">Bot Area</div>
          <div className="db-piles-row">
            <div>
              <div className="db-blitz-count">Blitz ({state.botBlitzPile.length})</div>
              <FaceDownCard count={state.botBlitzPile.length} />
            </div>
            <div>
              <div className="db-card-count">Post Piles</div>
              <div className="db-post-piles">
                {state.botPostPiles.map((pile, i) => {
                  const top = pile[pile.length - 1] ?? null;
                  return <DBCardView key={i} card={top} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {terminal && (
        <button className="db-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
