import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HiHoState, HiHoSettings } from "./state.js";
import type { HiHoAction } from "./state.js";
import { isTerminal, TOTAL_CHERRIES } from "./state.js";
import "./Game.css";

const LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];
const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];

const SPIN_EMOJI: Record<string, string> = {
  pick1: "🍒×1",
  pick2: "🍒×2",
  pick3: "🍒×3",
  pick4: "🍒×4",
  spill: "💦 Spill!",
  bird: "🐦 Bird!",
  dog: "🐶 Dog!",
};

export function HiHoGame({ state, dispatch, onGameOver }: GameProps<HiHoState, HiHoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canSpin = state.turn === 0 && state.winner === null;

  return (
    <div className="hiho-game">
      <div className={`hiho-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {state.message}
      </div>

      {state.lastSpin && (
        <div className="hiho-spin-result">
          {SPIN_EMOJI[state.lastSpin] ?? state.lastSpin}
        </div>
      )}

      {canSpin && (
        <button data-testid="hint-target-hi-ho-cherry-o-spin" className="hiho-spin-btn" onClick={() => dispatch({ type: "spin" } satisfies HiHoAction)}>
          Spin!
        </button>
      )}

      <div className="hiho-players">
        {state.players.map((p, i) => (
          <div key={i} className="hiho-player" style={{ borderColor: COLORS[i] }}>
            <div className="hiho-player-name" style={{ color: COLORS[i] }}>{LABELS[i]}</div>
            <div className="hiho-tree">
              <span className="hiho-label">Tree:</span>
              <div className="hiho-cherries">
                {Array.from({ length: TOTAL_CHERRIES }, (_, j) => (
                  <span key={j} className={`hiho-cherry ${j < p.tree ? "on-tree" : "gone"}`}>🍒</span>
                ))}
              </div>
            </div>
            <div className="hiho-bucket">
              <span className="hiho-label">Bucket: {p.bucket}</span>
              <div className="hiho-bucket-bar-bg">
                <div className="hiho-bucket-bar-fill" style={{ width: `${(p.bucket / TOTAL_CHERRIES) * 100}%`, background: COLORS[i] }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
