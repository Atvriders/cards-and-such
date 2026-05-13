import { useState, useEffect, useRef, useMemo } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  LiarsDiceFullState,
  LiarsDiceFullAction,
  LiarsDiceFullSettings,
  DieFace,
} from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

const FACES: DieFace[] = [1, 2, 3, 4, 5, 6];
const SEAT_LABELS = ["You", "Bot Ada", "Bot Bex", "Bot Cal"] as const;

export function LiarsDiceFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<LiarsDiceFullState, LiarsDiceFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Drive bot turns with a short delay so the human can observe action.
  useEffect(() => {
    if (state.winner !== null) return;
    if (state.turn === 0) return;
    const id = window.setTimeout(() => {
      dispatch({ type: "botTick" } as LiarsDiceFullAction);
    }, 600);
    return () => window.clearTimeout(id);
  }, [state.turn, state.currentBid, state.winner, dispatch, state.round]);

  const totalDice = useMemo(() => {
    let n = 0;
    for (const arr of state.diceBySeat) n += arr.length;
    return n;
  }, [state.diceBySeat]);

  // Bid form state — reset / suggest a reasonable raise each time bid changes
  const [bidCount, setBidCount] = useState(1);
  const [bidFace, setBidFace] = useState<DieFace>(2);

  useEffect(() => {
    if (state.currentBid === null) {
      setBidCount(2);
      setBidFace(2);
    } else {
      const cur = state.currentBid;
      if (cur.count + 1 <= totalDice) {
        setBidCount(cur.count + 1);
        setBidFace(cur.face);
      } else if (cur.face < 6) {
        setBidCount(cur.count);
        setBidFace((cur.face + 1) as DieFace);
      } else {
        setBidCount(cur.count + 1);
        setBidFace(cur.face);
      }
    }
  }, [state.currentBid, totalDice, state.round]);

  const isPlayerTurn = state.turn === 0 && state.winner === null;
  const canCall = isPlayerTurn && state.currentBid !== null;

  const isBidValid = (): boolean => {
    if (!isPlayerTurn) return false;
    if (bidCount < 1 || bidCount > totalDice) return false;
    if (bidFace < 1 || bidFace > 6) return false;
    if (state.currentBid === null) return true;
    return (
      bidCount > state.currentBid.count ||
      (bidCount === state.currentBid.count && bidFace > state.currentBid.face)
    );
  };

  const handleBid = (): void => {
    if (!isBidValid()) return;
    dispatch({ type: "bid", count: bidCount, face: bidFace } as LiarsDiceFullAction);
  };

  const handleCall = (): void => {
    if (!canCall) return;
    dispatch({ type: "call" } as LiarsDiceFullAction);
  };

  const reveal = state.lastReveal;

  return (
    <div className="ldf-wrap fade-in">
      <div className="ldf-header">
        <span className="ldf-round">Round {state.round}</span>
        <span className="ldf-status pulse">
          {state.winner !== null
            ? state.winner === 0
              ? "You win!"
              : `${SEAT_LABELS[state.winner]} wins`
            : isPlayerTurn
              ? "Your move"
              : `${SEAT_LABELS[state.turn]} is thinking…`}
        </span>
      </div>

      {/* Seats — bots show backs of dice, human shows pips. */}
      <div className="ldf-seats">
        {state.diceBySeat.map((dice, seat) => {
          const active = dice.length > 0;
          const isTurn = state.turn === seat && state.winner === null;
          return (
            <div
              key={seat}
              className={`ldf-seat ${seat === 0 ? "ldf-seat-human" : "ldf-seat-bot"} ${
                active ? "" : "ldf-seat-out"
              } ${isTurn ? "ldf-seat-turn" : ""}`}
            >
              <div className="ldf-seat-label">
                {SEAT_LABELS[seat]}{" "}
                <span className="ldf-seat-count">
                  {active ? `${dice.length} dice` : "out"}
                </span>
              </div>
              <div className="ldf-seat-dice">
                {seat === 0
                  ? dice.map((face, i) => <Die key={i} value={face} kept={false} />)
                  : dice.map((_, i) => (
                      <div key={i} className="ldf-hidden-die" aria-label="hidden die">
                        ?
                      </div>
                    ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current bid display */}
      <div className="ldf-bid-display">
        {state.currentBid ? (
          <>
            <strong>{SEAT_LABELS[state.currentBid.by]}</strong> bid{" "}
            <span className="ldf-bid-num">{state.currentBid.count}</span> ×{" "}
            <span className="ldf-bid-face">{state.currentBid.face}s</span>
          </>
        ) : (
          <em>No bid yet — opening round</em>
        )}
      </div>

      {/* Reveal panel (last challenge) */}
      {reveal && (
        <div className="ldf-reveal bounce-in">
          <div className="ldf-reveal-title">
            {SEAT_LABELS[reveal.caller]} called {SEAT_LABELS[reveal.bidder]}'s bid of{" "}
            {reveal.bidCount} × {reveal.bidFace}s
          </div>
          <div className="ldf-reveal-rows">
            {reveal.diceBySeat.map((dice, seat) => (
              <div key={seat} className="ldf-reveal-row">
                <span className="ldf-reveal-name">{SEAT_LABELS[seat]}:</span>
                <span className="ldf-reveal-dice">
                  {dice.map((f, i) => (
                    <Die key={i} value={f} kept={false} />
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="ldf-reveal-summary">
            Actual count of {reveal.bidFace}s (including 1 wildcards):{" "}
            <strong>{reveal.actualCount}</strong>
            {" — "}
            <strong>{SEAT_LABELS[reveal.loser]}</strong> lost a die
            {reveal.eliminated ? " and is eliminated!" : "."}
          </div>
        </div>
      )}

      {/* Action panel */}
      {isPlayerTurn && state.winner === null && (
        <div className="ldf-actions">
          <div className="ldf-bid-form">
            <div className="ldf-bid-row">
              <label htmlFor="ldf-count">Count:</label>
              <input
                id="ldf-count"
                type="number"
                className="ldf-count-input"
                value={bidCount}
                min={1}
                max={totalDice}
                onChange={(e) =>
                  setBidCount(Math.max(1, Math.min(totalDice, parseInt(e.target.value) || 1)))
                }
                data-testid="liars-dice-full-bid-count"
              />
            </div>
            <div className="ldf-bid-row">
              <label>Face:</label>
              <div className="ldf-face-buttons">
                {FACES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`ldf-face-btn${bidFace === f ? " selected" : ""}`}
                    onClick={() => setBidFace(f)}
                    aria-label={`Pick face ${f}${f === 1 ? " (wildcard)" : ""}`}
                    aria-pressed={bidFace === f}
                    title={f === 1 ? "Face 1 (wilds disabled when bidding 1s)" : `Face ${f}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="ldf-buttons">
            <button
              type="button"
              className="ldf-btn ldf-btn-bid"
              onClick={handleBid}
              disabled={!isBidValid()}
              data-testid="liars-dice-full-bid-submit"
              title="Submit a higher bid"
            >
              Bid {bidCount} × {bidFace}s
            </button>
            <button
              type="button"
              className="ldf-btn ldf-btn-call"
              onClick={handleCall}
              disabled={!canCall}
              data-testid="liars-dice-full-call"
              title="Call the current bidder a liar"
            >
              Liar!
            </button>
          </div>
        </div>
      )}

      {state.winner !== null && (
        <div className="ldf-overlay">
          <div className="ldf-overlay-box bounce-in">
            <h2>{state.winner === 0 ? "You win the match!" : `${SEAT_LABELS[state.winner]} wins`}</h2>
            {state.winner === 0 ? (
              <div className="ldf-score">
                Score: {200 + state.diceBySeat[0]!.length * 60}
              </div>
            ) : (
              <div className="ldf-score">Better luck next time.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
