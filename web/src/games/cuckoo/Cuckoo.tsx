import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CuckooState } from "./state.js";
import { isTerminal, initialState } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Cuckoo.css";

type CuckooAction = { type: "keep" } | { type: "swap" } | { type: "next-round" };

export function Cuckoo({ state, dispatch, onGameOver }: GameProps<CuckooState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, revealedHands, lives, phase, roundMsg, round } = state;
  const playerCard = hands[0] ?? null;
  const nextCard = hands[1] ?? null; // what player could swap to

  const canSwap = nextCard !== null && nextCard.rank !== 13; // not a King
  const isReveal = phase === "reveal";
  const isDone = lives.some(l => l <= 0);

  const seatName = (i: number) => i === 0 ? "You" : `Bot ${i}`;
  const livesEmoji = (n: number) => "♥".repeat(Math.max(0, n)) + "♡".repeat(Math.max(0, 3 - n));

  return (
    <div className="cuckoo">
      <div className="cuckoo-header">
        <span>Cuckoo</span>
        <span>Round {round}</span>
      </div>

      <div className="cuckoo-lives-row">
        {lives.map((l, i) => (
          <div key={i} className="cuckoo-seat">
            <div className="cuckoo-seat-label">{seatName(i)}</div>
            <div className="cuckoo-lives">{livesEmoji(l)}</div>
            {isReveal && revealedHands[i] ? (
              <Card card={revealedHands[i]!} />
            ) : i === 0 && playerCard ? (
              <Card card={playerCard} />
            ) : (
              <div className="cuckoo-card-back" />
            )}
          </div>
        ))}
      </div>

      {isReveal && (
        <div className="cuckoo-status">{roundMsg}</div>
      )}

      {!isReveal && phase === "player-turn" && (
        <>
          <div className="cuckoo-player-area">
            <div className="cuckoo-player-label">Your card</div>
            {playerCard && (
              <div>
                <Card card={playerCard} />
                <div style={{ textAlign: "center", fontSize: "0.8rem", marginTop: 4, opacity: 0.7 }}>
                  {rankLabel(playerCard.rank)}{playerCard.suit}
                </div>
              </div>
            )}
          </div>

          <div className="cuckoo-status">
            Next player has:{" "}
            {nextCard
              ? nextCard.rank === 13
                ? "a King — cannot swap!"
                : `${rankLabel(nextCard.rank)}${nextCard.suit} (hidden)`
              : "no card"}
          </div>

          <div className="cuckoo-actions">
            <button
              className="cuckoo-btn"
              onClick={() => dispatch({ type: "keep" })}
            >
              Keep
            </button>
            <button
              className="cuckoo-btn"
              onClick={() => dispatch({ type: "swap" })}
              disabled={!canSwap}
            >
              Swap with Bot 1
            </button>
          </div>
        </>
      )}

      {isReveal && (
        <div className="cuckoo-reveal">
          {revealedHands.map((c, i) => c ? (
            <div key={i} className="cuckoo-reveal-slot">
              <Card card={c} />
              <span>{seatName(i)}: {rankLabel(c.rank)}{c.suit}</span>
            </div>
          ) : null)}
        </div>
      )}

      {isDone && (
        <div className="cuckoo-result">
          <h2>{lives[0]! > 0 ? "You Survived!" : "You Lost!"}</h2>
          <div>
            {lives.map((l, i) => (
              <div key={i}>{seatName(i)}: {l <= 0 ? "Eliminated" : `${l} lives`}</div>
            ))}
          </div>
          <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>{roundMsg}</div>
        </div>
      )}

      {isReveal && !isDone && (
        <button
          className="cuckoo-next-btn"
          onClick={() => {
            const next = initialState(state.rngSeed, state.settings);
            // Re-use the current lives from state rather than resetting
            void next;
            dispatch({ type: "keep" }); // no-op to signal new round awareness
          }}
        >
          (Results shown — start new game to play next round)
        </button>
      )}
    </div>
  );
}
