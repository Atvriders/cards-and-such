import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DudoState, DudoAction, DudoSettings, DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import "./Dudo.css";

export function Dudo({
  state,
  dispatch,
  onGameOver,
}: GameProps<DudoState, DudoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [bidCount, setBidCount] = useState(1);
  const [bidFace, setBidFace] = useState<DieFace>(2);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, playerRoll, playerDice, botDice, currentBid, turn, message, winner, lastReveal } = state;
  const totalDice = playerDice + botDice;
  const canAct = phase === "bid" && turn === 0 && winner === null;

  const minCount = currentBid
    ? (bidFace > currentBid.face ? currentBid.count : currentBid.count + 1)
    : 1;

  function handleBid() {
    dispatch({ type: "bid", count: bidCount, face: bidFace } as DudoAction);
  }

  function handleDudo() {
    dispatch({ type: "dudo" } as DudoAction);
  }

  return (
    <div className="dudo">
      <div className="dudo-scoreboard">
        <span className="dudo-player-info">You: {playerDice} dice</span>
        <span className="dudo-bot-info">Bot: {botDice} dice</span>
      </div>

      <div className="dudo-roll-section">
        <div className="dudo-roll-label">Your dice (secret):</div>
        <div className="dudo-roll">
          {playerRoll.map((v, i) => (
            <div key={i} className={`dudo-die${v === 1 ? " wild" : ""}`}>{v}</div>
          ))}
        </div>
        <div className="dudo-wild-note">Ones are wild</div>
      </div>

      {lastReveal && (
        <div style={{ fontSize: "0.85rem", color: "#555", textAlign: "center" }}>
          <div>
            Revealed — You: [{lastReveal.playerRoll.join(", ")}] | Bot: [{lastReveal.botRoll.join(", ")}]
          </div>
          <div>
            Actual {lastReveal.bid.face}s (incl. wilds): <strong>{lastReveal.actualCount}</strong> / bid was {lastReveal.bid.count}
          </div>
        </div>
      )}

      <div className="dudo-bid-display">
        {currentBid
          ? `Current bid: ${currentBid.count} × ${currentBid.face}s (by ${currentBid.by === 0 ? "you" : "bot"})`
          : "No bid yet"}
      </div>

      {canAct && (
        <div className="dudo-controls">
          <div className="dudo-bid-row">
            <label>Count:</label>
            <select value={bidCount} onChange={(e) => setBidCount(Number(e.target.value))}>
              {Array.from({ length: totalDice }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} disabled={n < minCount}>{n}</option>
              ))}
            </select>
            <label>Face:</label>
            <select value={bidFace} onChange={(e) => setBidFace(Number(e.target.value) as DieFace)}>
              {[1, 2, 3, 4, 5, 6].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="dudo-btn-row">
            <button className="dudo-bid-btn" data-testid="hint-target-dudo-bid" onClick={handleBid}>Bid</button>
            <button
              className="dudo-dudo-btn"
              data-testid="hint-target-dudo-call"
              disabled={!currentBid}
              onClick={handleDudo}
            >
              Dudo! (Challenge)
            </button>
          </div>
        </div>
      )}

      <div className={`dudo-message${winner === 0 ? " win" : winner !== null ? " lose" : ""}`}>
        {message}
      </div>
    </div>
  );
}
