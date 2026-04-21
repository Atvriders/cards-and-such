import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LiarsDiceState, LiarsDiceAction, LiarsDiceSettings, DieFace } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./LiarsDice.css";

const FACES: DieFace[] = [1, 2, 3, 4, 5, 6];

export function LiarsDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<LiarsDiceState, LiarsDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  const [bidCount, setBidCount] = useState(1);
  const [bidFace, setBidFace] = useState<DieFace>(1);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // When a new round starts (currentBid resets), reset bid form to one above nothing
  useEffect(() => {
    if (state.currentBid === null) {
      setBidCount(1);
      setBidFace(1);
    } else if (state.currentBid.by === 1) {
      // Bot just raised — pre-fill a reasonable raise
      const cur = state.currentBid;
      if (cur.count + 1 <= state.playerDice.length + state.botDice.length) {
        setBidCount(cur.count + 1);
        setBidFace(cur.face);
      } else {
        setBidCount(cur.count);
        const nextFace = Math.min(6, cur.face + 1) as DieFace;
        setBidFace(nextFace);
      }
    }
  }, [state.currentBid, state.playerDice.length, state.botDice.length]);

  const { playerDice, botDice, currentBid, turn, round, lastReveal, winner } = state;

  const isPlayerTurn = turn === 0 && winner === null;
  const canCall = isPlayerTurn && currentBid !== null;

  function isBidValid(): boolean {
    if (!isPlayerTurn) return false;
    if (currentBid === null) return true;
    return bidCount > currentBid.count ||
      (bidCount === currentBid.count && bidFace > currentBid.face);
  }

  function handleBid() {
    if (!isBidValid()) return;
    dispatch({ type: "bid", count: bidCount, face: bidFace } as LiarsDiceAction);
  }

  function handleCall() {
    dispatch({ type: "call" } as LiarsDiceAction);
  }

  return (
    <div className="liars-dice-wrap">
      <div className="liars-dice-header">
        Round {round} — Your dice: {playerDice.length} | Bot dice: {botDice.length}
      </div>

      {/* Bot's dice (hidden unless reveal) */}
      <div className="liars-dice-section">
        <div className="liars-dice-section-title">Bot's dice</div>
        <div className="liars-dice-row">
          {botDice.map((_, i) => (
            <div key={i} className="liars-dice-hidden" aria-label="hidden die">?</div>
          ))}
        </div>
      </div>

      {/* Player's dice */}
      <div className="liars-dice-section">
        <div className="liars-dice-section-title">Your dice</div>
        <div className="liars-dice-row">
          {playerDice.map((face, i) => (
            <Die key={i} value={face} kept={false} />
          ))}
        </div>
      </div>

      {/* Current bid */}
      <div className="liars-dice-section">
        <div className="liars-dice-section-title">Current bid</div>
        <div className="liars-dice-bid-display">
          {currentBid
            ? `${currentBid.count} × ${currentBid.face}s (by ${currentBid.by === 0 ? "You" : "Bot"})`
            : "No bid yet — you go first"}
        </div>
      </div>

      {/* Last reveal */}
      {lastReveal && (
        <div className="liars-dice-reveal">
          <strong>Last round reveal:</strong>
          <div>Your dice: <span className="liars-dice-reveal-dice-row">{lastReveal.playerDice.map((f, i) => <Die key={i} value={f} kept={false} />)}</span></div>
          <div>Bot dice: <span className="liars-dice-reveal-dice-row">{lastReveal.botDice.map((f, i) => <Die key={i} value={f} kept={false} />)}</span></div>
          <div>Actual count of {currentBid?.face ?? lastReveal.playerDice[0]}s: <strong>{lastReveal.actualCount}</strong></div>
          <div>{lastReveal.wonBy === 0 ? "You won the round!" : "Bot won the round."} {lastReveal.loserDiceLost === 0 ? "You" : "Bot"} lost a die.</div>
        </div>
      )}

      {/* Bid form */}
      {isPlayerTurn && winner === null && (
        <div className="liars-dice-bid-form">
          <div className="liars-dice-bid-row">
            <label>Count:</label>
            <input
              type="number"
              className="liars-dice-count-input"
              value={bidCount}
              min={1}
              max={playerDice.length + botDice.length}
              onChange={e => setBidCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="liars-dice-bid-row">
            <label>Face:</label>
            <div className="liars-dice-face-buttons">
              {FACES.map(f => (
                <button
                  key={f}
                  className={`liars-dice-face-btn${bidFace === f ? " selected" : ""}`}
                  onClick={() => setBidFace(f)}
                  aria-label={`Face ${f}`}
                  aria-pressed={bidFace === f}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="liars-dice-actions">
            <button
              className="bid-btn"
              onClick={handleBid}
              disabled={!isBidValid()}
            >
              Bid
            </button>
            <button
              className="call-btn"
              onClick={handleCall}
              disabled={!canCall}
            >
              Call (Liar!)
            </button>
          </div>
        </div>
      )}

      {winner !== null && (
        <div className="liars-dice-overlay">
          <div className="liars-dice-overlay-box">
            <h2>{winner === 0 ? "You win!" : "Bot wins!"}</h2>
            {winner === 0 && (
              <div>Score: {100 + playerDice.length * 50}</div>
            )}
            {winner === 1 && (
              <div>Better luck next time!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
