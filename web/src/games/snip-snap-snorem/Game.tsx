import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnipSnapState, SnipSnapSettings } from "./state.js";
import { seatName, isTerminal, canPlay, rankLabel, CALL } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function SnipSnapGame({ state, dispatch, onGameOver }: GameProps<SnipSnapState, SnipSnapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === 0 && !state.winner;
  const playerHand = state.hands[0] ?? [];
  const playableIds = new Set(playerHand.filter(c => canPlay(c, state)).map(c => c.id));

  const callWord = state.step > 0 ? CALL[state.step] ?? "" : "";

  return (
    <div className="snip-snap">
      <div className="ss-title">Snip-Snap-Snorem</div>

      <div className="ss-opponents">
        {Array.from({ length: state.seats - 1 }, (_, i) => i + 1).map(seat => (
          <div key={seat} className="ss-opponent">
            <div className="ss-opp-name">{seatName(seat)}</div>
            <div style={{ fontSize: "0.8rem" }}>{state.hands[seat]?.length ?? 0} cards</div>
          </div>
        ))}
      </div>

      <div className="ss-sequence">
        <div className="ss-seq-label">
          {state.currentRank !== null ? `Active rank: ${rankLabel(state.currentRank as import("../../engines/deck/index.js").Rank)}` : "No active rank — play any card"}
        </div>
        {state.currentRank !== null && (
          <>
            <div className="ss-call">{callWord}</div>
            <div className="ss-steps">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`ss-step${state.step >= i ? " filled" : ""}`} />
              ))}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>{4 - state.step} more to Snorem</div>
          </>
        )}
      </div>

      {state.lastPlayed && (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>Last played:</span>
          <Card card={state.lastPlayed} />
        </div>
      )}

      <div className="ss-log">{state.log}</div>

      <div className="ss-hand">
        <div className="ss-hand-label">Your hand ({playerHand.length}) — blue = playable</div>
        <div className="ss-cards">
          {[...playerHand].sort((a, b) => a.rank - b.rank || a.suit.localeCompare(b.suit)).map(c => (
            <button data-testid="hint-target-snip-snap-snorem-primary"
              key={c.id}
              className={`ss-card-btn${playableIds.has(c.id) ? " playable" : ""}`}
              disabled={!isPlayerTurn || !playableIds.has(c.id)}
              onClick={() => dispatch({ type: "play", cardId: c.id })}
              aria-label={`${c.suit}${rankLabel(c.rank)}`}
            >
              <Card card={c} />
            </button>
          ))}
        </div>
      </div>

      {!isPlayerTurn && !state.winner && (
        <div style={{ opacity: 0.7, fontStyle: "italic" }}>
          {playableIds.size === 0 ? "No cards to play — passing…" : `Waiting for ${seatName(state.turn)}…`}
        </div>
      )}

      {state.winner !== null && (
        <div className="ss-game-over">
          {state.winner === 0 ? "You win!" : `${seatName(state.winner)} wins!`}
        </div>
      )}
    </div>
  );
}
