import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PerudoState, PerudoAction, PerudoSettings, DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./Perudo.css";

export function Perudo({
  state,
  dispatch,
  onGameOver,
}: GameProps<PerudoState, PerudoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [bidCount, setBidCount] = useState(1);
  const [bidFace, setBidFace] = useState<DieFace>(1);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, rolls, diceCounts, currentBid, turn, message, winner, lastReveal } = state;
  const playerRoll = rolls[0] ?? [];
  const totalDice = diceCounts.reduce((a, b) => a + b, 0);
  const canAct = phase === "bid" && turn === 0 && winner === null;

  function handleBid() {
    dispatch({ type: "bid", count: bidCount, face: bidFace } as PerudoAction);
  }

  function handleDudo() {
    dispatch({ type: "dudo" } as PerudoAction);
  }

  const minCount = currentBid
    ? (bidFace > currentBid.face ? currentBid.count : currentBid.count + 1)
    : 1;

  return (
    <div className="perudo">
      <div className="perudo-players">
        {diceCounts.map((count, i) => (
          <div key={i} className={`perudo-player${turn === i && phase === "bid" ? " active" : ""}`}>
            <div className="perudo-player-name">{i === 0 ? "You" : `Bot ${i}`}</div>
            <div className="perudo-dice-icons">
              {Array.from({ length: count }, (_, j) => (
                <div key={j} className="perudo-die-icon">d</div>
              ))}
              {count === 0 && <span style={{ color: "#ccc" }}>✗</span>}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#777" }}>{count} dice</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", marginBottom: 4 }}>
          Your dice (only you see these):
        </div>
        <div className="perudo-your-roll">
          {playerRoll.map((v, i) => (
            <div key={i} className={`perudo-die${v === 1 ? " wild" : ""}`}>{v}</div>
          ))}
        </div>
        <div className="perudo-wild-note">Ones are wild (count as any face)</div>
      </div>

      <div className="perudo-bid-display">
        {currentBid
          ? `Current bid: ${currentBid.count} × ${currentBid.face}s (by ${currentBid.by === 0 ? "you" : `Bot ${currentBid.by}`})`
          : "No bid yet — you go first!"}
      </div>

      {lastReveal && (
        <div style={{ fontSize: "0.85rem", color: "#555", textAlign: "center" }}>
          Actual {lastReveal.bid.face}s (incl. wilds): <strong>{lastReveal.actualCount}</strong>
          {" / "}bid was {lastReveal.bid.count}
        </div>
      )}

      {canAct && (
        <div className="perudo-bid-controls">
          <div className="perudo-bid-row">
            <label>Count:</label>
            <select
              value={bidCount}
              onChange={(e) => setBidCount(Number(e.target.value))}
            >
              {Array.from({ length: totalDice }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} disabled={n < minCount}>
                  {n}
                </option>
              ))}
            </select>
            <label>Face:</label>
            <select
              value={bidFace}
              onChange={(e) => setBidFace(Number(e.target.value) as DieFace)}
            >
              {[1, 2, 3, 4, 5, 6].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="perudo-bid-row">
            <button className="perudo-bid-btn" onClick={handleBid}>
              Bid
            </button>
            {currentBid && (
              <button className="perudo-dudo-btn" onClick={handleDudo}>
                Dudo! (Challenge)
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`perudo-message${winner === 0 ? " win" : winner !== null ? " lose" : ""}`}>
        {message}
      </div>
    </div>
  );
}
