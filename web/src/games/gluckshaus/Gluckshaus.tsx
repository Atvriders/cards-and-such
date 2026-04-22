import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GluckshausState, GAction, GluckshausSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Gluckshaus.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const SLOT_LABELS: Record<number, string> = {
  2: "2", 3: "3 (skip)", 5: "5", 6: "6", 7: "7→pot", 8: "8",
  9: "9", 10: "10", 11: "11 (skip)", 12: "12 (all!)",
};

// Slots to display: 2–12 except 4
const DISPLAY_SLOTS = [2, 3, 5, 6, 7, 8, 9, 10, 11, 12];

export function Gluckshaus({ state, dispatch, onGameOver }: GameProps<GluckshausState, GluckshausSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const lastSum = state.lastRoll ? state.lastRoll[0]! + state.lastRoll[1]! : null;

  return (
    <div className="gluck">
      <h2>Glückshaus</h2>
      <div className="gluck-info">
        <span>🪙 You: <strong>{state.playerPennies}</strong></span>
        <span>🤖 Bot: <strong>{state.botPennies}</strong></span>
        <span>Active: <strong>{state.activePlayer === "player" ? "You" : "Bot"}</strong></span>
      </div>

      <div className="gluck-wedding">
        <span>💍 Wedding Pot:</span>
        <strong>{state.weddingPot}</strong>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>(Roll 2 to take, 7 to add)</span>
      </div>

      <div className="gluck-board">
        {DISPLAY_SLOTS.map((slot) => (
          <div
            key={slot}
            className={`gluck-slot ${(state.board[slot] ?? 0) > 0 ? (slot === 7 ? "wedding" : "has-penny") : ""} ${lastSum === slot ? "last-hit" : ""}`}
          >
            <span className="gluck-slot-label">{SLOT_LABELS[slot] ?? slot}</span>
            <span className="gluck-slot-pennies">{(state.board[slot] ?? 0) > 0 ? `🪙×${state.board[slot]}` : "empty"}</span>
          </div>
        ))}
      </div>

      {state.lastRoll && (
        <div className="gluck-dice">
          <span>{DICE_FACES[state.lastRoll[0]] ?? "?"}</span>
          <span>{DICE_FACES[state.lastRoll[1]] ?? "?"}</span>
          <span style={{ fontSize: "1rem" }}>={lastSum}</span>
        </div>
      )}

      {state.lastEvent && <div className="gluck-event">{state.lastEvent}</div>}
      <div className="gluck-message">{state.message}</div>

      {state.phase === "rolling" && (
        <button className="gluck-btn" onClick={() => dispatch({ type: "roll" } as GAction)}>
          {state.activePlayer === "player" ? "Roll Dice" : "Roll for Bot..."}
        </button>
      )}

      {state.gameOver && state.winner && (
        <div className={`gluck-game-over ${state.winner === "player" ? "win" : "loss"}`}>
          {state.winner === "player" ? "Bot ran out — you win!" : "You ran out of pennies — bot wins!"}
        </div>
      )}
    </div>
  );
}
