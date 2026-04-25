import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlotMachineProState, SlotAction, Symbol } from "./state.js";
import { isTerminal, STARTING_CREDITS, MAX_SPINS } from "./state.js";
import "./Game.css";

const SYMBOL_EMOJI: Record<Symbol, string> = {
  cherry: "🍒", lemon: "🍋", orange: "🍊", bell: "🔔", bar: "⬛", seven: "7️⃣", wild: "⭐",
};

const EMPTY_REELS: [Symbol, Symbol, Symbol] = ["cherry", "lemon", "orange"];

export function SlotMachineProGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlotMachineProState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: SlotAction) => dispatch(a);
  const reels = state.lastResult?.reels ?? EMPTY_REELS;

  return (
    <div className="slot-wrap">
      <div className="slot-header">
        <span className="slot-title">🎰 Slot Machine Pro</span>
        <span className="slot-credits">{state.credits} cr</span>
      </div>

      <div className="slot-machine">
        <div className="slot-jackpot">💰 Jackpot: {state.jackpotPool} cr</div>
        <div className="slot-reels">
          {reels.map((s, i) => (
            <div key={i} className="slot-reel">{SYMBOL_EMOJI[s]}</div>
          ))}
        </div>
        <div className="slot-line">{state.lastResult?.line ?? "Set bet and Spin!"}</div>
      </div>

      {state.phase === "idle" && (
        <div>
          <div className="slot-bet-row">
            <button className="slot-bet-btn" onClick={() => d({ type: "setBet", amount: state.bet - 1 })}>−</button>
            <span className="slot-bet-label">Bet:</span>
            <span className="slot-bet-val">{state.bet}</span>
            <button className="slot-bet-btn" onClick={() => d({ type: "setBet", amount: state.bet + 1 })}>+</button>
          </div>
          <div className="slot-spins">Spins left: {state.spinsLeft}/{MAX_SPINS}</div>
          <button
            className="slot-spin-btn"
            disabled={state.credits < state.bet || state.spinsLeft <= 0}
            onClick={() => d({ type: "spin" })}>
            SPIN!
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="slot-done">
          <div className="slot-final">Final: {state.credits} credits</div>
          <div>Started with {STARTING_CREDITS} credits</div>
          <div style={{ marginTop: 8 }}>
            {state.credits >= STARTING_CREDITS * 2 ? "🏆 High Roller!" : state.credits >= STARTING_CREDITS ? "👍 Came out ahead!" : "💸 Better luck next time!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="slot-log">
          {[...state.log].reverse().slice(0, 10).map((l, i) => <div key={i} className="slot-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
