import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VideoPokerState, VideoPokerAction, VideoPokerSettings } from "./state.js";
import { isTerminal, evaluateHand } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./VideoPoker.css";

const PAYTABLE_ROWS = [
  { name: "Royal Flush", mult96: 800, mult85: 800 },
  { name: "Straight Flush", mult96: 50, mult85: 50 },
  { name: "Four of a Kind", mult96: 25, mult85: 25 },
  { name: "Full House", mult96: 9, mult85: 8 },
  { name: "Flush", mult96: 6, mult85: 5 },
  { name: "Straight", mult96: 4, mult85: 4 },
  { name: "Three of a Kind", mult96: 3, mult85: 3 },
  { name: "Two Pair", mult96: 2, mult85: 2 },
  { name: "Jacks or Better", mult96: 1, mult85: 1 },
];

export function VideoPoker({
  state,
  dispatch,
  onGameOver,
}: GameProps<VideoPokerState, VideoPokerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { phase, credits, handsPlayed, settings, hand, lastHandName, lastPayout } = state;

  function dis(a: VideoPokerAction) {
    dispatch(a);
  }

  const isHoldPhase = phase === "hold";
  const isShownPhase = phase === "shown";
  const isDealPhase = phase === "deal";

  const currentHandResult = isShownPhase && hand.length === 5
    ? evaluateHand(hand.map((hc) => hc.card), settings.paytable)
    : null;

  const highlightedHand = currentHandResult?.name || lastHandName;

  return (
    <div className="video-poker">
      <div className="vp-header">
        <span>Credits: {credits}</span>
        <span>Hand: {handsPlayed} / {settings.handsPerSession}</span>
        <span>Bet: {settings.betSize}</span>
      </div>

      <div className="vp-result">
        {isShownPhase && lastHandName && (
          <>
            {lastHandName} {lastPayout > 0 ? `+${lastPayout}` : ""}
          </>
        )}
      </div>

      <div className="vp-hand">
        {hand.length === 5 ? hand.map((hc, i) => (
          <div
            key={hc.card.id + i}
            className={`vp-card-slot${hc.held ? " held" : ""}`}
            onClick={() => isHoldPhase && dis({ type: "toggleHold", index: i })}
          >
            {isHoldPhase && <div className="vp-hold-label">{hc.held ? "Hold" : ""}</div>}
            <Card card={hc.card} />
          </div>
        )) : (
          // Empty slots
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="vp-card-slot">
              {isHoldPhase && <div className="vp-hold-label" />}
              <Card faceDown />
            </div>
          ))
        )}
      </div>

      <div className="vp-actions">
        {(isDealPhase || isShownPhase) && !terminal && (
          <button className="primary" onClick={() => dis({ type: "deal" })} disabled={credits < parseInt(settings.betSize, 10)}>
            Deal
          </button>
        )}
        {isHoldPhase && (
          <button className="primary" onClick={() => dis({ type: "draw" })}>
            Draw
          </button>
        )}
      </div>

      {terminal && (
        <div className="vp-game-over">
          Game Over — Final Credits: {terminal.score}
        </div>
      )}

      <div className="vp-paytable">
        <table>
          <thead>
            <tr>
              <th>Hand</th>
              <th>Pays</th>
            </tr>
          </thead>
          <tbody>
            {PAYTABLE_ROWS.map((row) => {
              const mult = settings.paytable === "9/6" ? row.mult96 : row.mult85;
              return (
                <tr key={row.name} className={highlightedHand === row.name ? "highlight" : ""}>
                  <td>{row.name}</td>
                  <td>{mult}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
