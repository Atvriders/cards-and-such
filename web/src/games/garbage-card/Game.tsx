import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GarbageState, GarbageSettings } from "./state.js";
import { isTerminal, rankLabel, slotForRank, isWild, isGarbage } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function GarbageGame({ state, dispatch, onGameOver }: GameProps<GarbageState, GarbageSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.phase === "playerTurn" && !state.winner;
  const cc = state.currentCard;

  // Determine which slots are targetable
  function isTargetable(slot: number): boolean {
    if (!cc || !isPlayerTurn) return false;
    if (state.playerSlots[slot] !== null) return false; // already filled (face-up)
    if (isWild(cc.rank)) return state.playerSlots[slot] === null;
    return slotForRank(cc.rank) === slot;
  }

  return (
    <div className="garbage-card">
      <div className="gc-title">Garbage (Trash)</div>
      <div className="gc-score">Rounds: You {state.roundsWon[0]} – Bot {state.roundsWon[1]} (of {state.totalRounds})</div>

      {/* Bot slots */}
      <div className="gc-slots-label">Bot's Layout</div>
      <div className="gc-slots">
        {state.botSlots.map((sl, i) => (
          <div key={i} className="gc-slot">
            <div className="gc-slot-num">{i + 1}</div>
            <div className={`gc-slot-btn ${sl ? "filled" : "empty"}`}>
              {sl ? <Card card={sl} /> : <span>—</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="gc-pile">
        <span className="gc-pile-label">Draw: {state.drawPile.length}</span>
        <span className="gc-pile-label">Discard: {state.discardPile.length}</span>
      </div>

      <div className="gc-log">{state.log}</div>

      {/* Current card in hand */}
      {cc && (
        <div className="gc-current">
          <div className="gc-current-label">Card in hand: {isWild(cc.rank) ? "WILD" : isGarbage(cc.rank) ? "GARBAGE" : `Slot ${cc.rank}`}</div>
          <Card card={cc} />
          {isGarbage(cc.rank) && isPlayerTurn && (
            <button className="gc-btn secondary" onClick={() => dispatch({ type: "discard" })}>Discard</button>
          )}
          {isWild(cc.rank) && isPlayerTurn && (
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Click any empty slot to place the wild.</div>
          )}
        </div>
      )}

      {/* Player slots */}
      <div className="gc-slots-label">Your Layout — click a slot to place your card</div>
      <div className="gc-slots">
        {state.playerSlots.map((sl, i) => (
          <div key={i} className="gc-slot">
            <div className="gc-slot-num">{i + 1}</div>
            <button
              className={`gc-slot-btn${sl ? " filled" : " empty"}${isTargetable(i) ? " targetable" : ""}`}
              disabled={!isTargetable(i)}
              onClick={() => dispatch({ type: "placeCard", slot: i })}
              aria-label={sl ? `Slot ${i + 1}: ${rankLabel(sl.rank)}` : `Slot ${i + 1} empty`}
            >
              {sl ? <Card card={sl} /> : <span>{i + 1}</span>}
            </button>
          </div>
        ))}
      </div>

      <div className="gc-actions">
        {isPlayerTurn && !cc && (
          <button className="gc-btn" onClick={() => dispatch({ type: "draw" })}>Draw Card</button>
        )}
        {state.phase === "roundOver" && (
          <button className="gc-btn" onClick={() => dispatch({ type: "nextRound" })}>Next Round</button>
        )}
      </div>

      {state.winner !== null && (
        <div className="gc-game-over">
          {state.winner === 0 ? "You win the match!" : "Bot wins the match!"}
        </div>
      )}
    </div>
  );
}
