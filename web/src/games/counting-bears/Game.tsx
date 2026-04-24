import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CountingState, CountingSettings } from "./state.js";
import type { CountingAction } from "./state.js";
import { isTerminal, COLOR_LABELS } from "./state.js";
import "./Game.css";

const BEAR_EMOJI: Record<string, string> = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  green: "🟢",
};

const BEAR_BG: Record<string, string> = {
  red: "#ffecec",
  blue: "#ecf4ff",
  yellow: "#fffde7",
  green: "#ecffec",
};

export function CountingBears({ state, dispatch, onGameOver }: GameProps<CountingState, CountingSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const statusCls = `cb-status${state.lastCorrect === true ? " correct" : state.lastCorrect === false ? " wrong" : ""}`;

  return (
    <div className="cb-game">
      <div className={statusCls}>{state.message}</div>
      <div className="cb-progress">Round {state.roundNum}/{state.totalRounds} | Score: {state.score}</div>

      <div className="cb-bears">
        {state.round.bears.map((color, i) => (
          <div key={i} className="cb-bear" style={{ background: BEAR_BG[color] ?? "#f5f5f5" }}>
            {BEAR_EMOJI[color] ?? "🐻"}
          </div>
        ))}
      </div>

      {!state.done && (
        <div className="cb-choices">
          {state.round.choices.map((n) => (
            <button
              key={n}
              className="cb-choice-btn"
              onClick={() => dispatch({ type: "pick", value: n } satisfies CountingAction)}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {state.done && (
        <div style={{ marginTop: 12, fontSize: "1.1rem", fontWeight: "bold", color: "#155724" }}>
          Game Over! Score: {state.score}/100
        </div>
      )}
    </div>
  );
}
