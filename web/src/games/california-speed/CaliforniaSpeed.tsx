import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CalSpeedState, CalSpeedSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./CaliforniaSpeed.css";

type CalSpeedAction =
  | { type: "flip" }
  | { type: "slap" }
  | { type: "bot-flip" }
  | { type: "bot-slap" }
  | { type: "restart" };

function CCard({ card, match }: { card: Card | null; match?: boolean }) {
  if (!card) return <div className="calspeed-card empty">—</div>;
  const colorClass = isRed(card.suit) ? "red-suit" : "black-suit";
  return (
    <div className={`calspeed-card ${colorClass}${match ? " match" : ""}`}>
      <div>{rankLabel(card.rank)}</div>
      <div>{card.suit}</div>
    </div>
  );
}

export function CaliforniaSpeed({ state, dispatch, onGameOver }: GameProps<CalSpeedState, CalSpeedSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const botTickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botSlapRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  // Bot auto-flip after player flips
  useEffect(() => {
    if (state.phase === "waiting" && state.playerFlipped && state.botDeck.length > 0) {
      const delay = state.settings.botReaction === "fast" ? 300 : state.settings.botReaction === "medium" ? 600 : 1200;
      botTickRef.current = setTimeout(() => {
        dispatch({ type: "bot-flip" } as CalSpeedAction);
      }, delay);
    }
    return () => { if (botTickRef.current) clearTimeout(botTickRef.current); };
  }, [state.phase, state.playerFlipped, state.botDeck.length, state.settings.botReaction, dispatch]);

  // Bot auto-slap on match
  useEffect(() => {
    if (state.phase === "slap-window") {
      const delay = state.settings.botReaction === "fast" ? 400 : state.settings.botReaction === "medium" ? 900 : 1800;
      botSlapRef.current = setTimeout(() => {
        dispatch({ type: "bot-slap" } as CalSpeedAction);
      }, delay);
    }
    return () => { if (botSlapRef.current) clearTimeout(botSlapRef.current); };
  }, [state.phase, state.matchSlots, state.settings.botReaction, dispatch]);

  function dis(a: CalSpeedAction) { dispatch(a); }

  const { table, matchSlots } = state;

  return (
    <div className="calspeed-game">
      <div className="calspeed-title">California Speed</div>
      <div className="calspeed-status">
        Your deck: <strong>{state.playerDeck.length}</strong> | Bot deck: <strong>{state.botDeck.length}</strong>
      </div>

      {terminal && (
        <div className="calspeed-game-over">
          {state.winner === "player" ? "You win!" : "Bot wins!"} — Score: {terminal.score}
        </div>
      )}

      {state.phase === "slap-window" && (
        <div className="calspeed-match-banner">MATCH! Slap now!</div>
      )}

      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div className="calspeed-label" style={{ textAlign: "center" }}>Table — matching rank cards glow</div>
        <div className="calspeed-table">
          <div style={{ textAlign: "center" }}>
            <div className="calspeed-label">Bot</div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <CCard card={table[2]} match={matchSlots !== null && matchSlots.includes(2)} />
              <CCard card={table[3]} match={matchSlots !== null && matchSlots.includes(3)} />
            </div>
          </div>
          <div className="calspeed-divider" />
          <div style={{ textAlign: "center" }}>
            <div className="calspeed-label">You</div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <CCard card={table[0]} match={matchSlots !== null && matchSlots.includes(0)} />
              <CCard card={table[1]} match={matchSlots !== null && matchSlots.includes(1)} />
            </div>
          </div>
        </div>
      </div>

      <div className="calspeed-actions">
        <button
          className="calspeed-btn"
          onClick={() => dis({ type: "flip" })}
          disabled={state.phase !== "waiting" || state.playerDeck.length === 0}
        >
          Flip Card ({state.playerDeck.length})
        </button>
        <button
          className="calspeed-btn slap"
          onClick={() => dis({ type: "slap" })}
          disabled={state.phase !== "slap-window"}
        >
          SLAP!
        </button>
      </div>

      <div style={{ fontSize: "0.8rem", color: "#ffccbc", textAlign: "center", maxWidth: "400px" }}>
        Flip your card to the table, then SLAP when any two table cards share a rank. Be faster than the bot!
      </div>

      {terminal && (
        <button className="calspeed-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
