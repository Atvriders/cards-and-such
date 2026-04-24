import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RainbowState, RainbowSettings, RainbowColor } from "./state.js";
import type { RainbowAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COLOR_BG: Record<RainbowColor, string> = {
  red: "#e74c3c",
  orange: "#e67e22",
  yellow: "#f1c40f",
  green: "#27ae60",
  blue: "#2980b9",
  purple: "#8e44ad",
};

const ALL_COLORS: RainbowColor[] = ["red", "orange", "yellow", "green", "blue", "purple"];

export function RainbowSort({ state, dispatch, onGameOver }: GameProps<RainbowState, RainbowSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const statusCls = `rs-status${state.lastCorrect === true ? " correct" : state.lastCorrect === false ? " wrong" : ""}`;

  return (
    <div className="rs-game">
      <div className={statusCls}>{state.message}</div>
      <div className="rs-progress">Round {state.roundNum}/{state.totalRounds} | Score: {state.score}</div>

      {!state.done && (
        <div className="rs-drop" style={{ background: COLOR_BG[state.current] }}>
          {state.current}
        </div>
      )}

      {!state.done && (
        <div className="rs-buckets">
          {ALL_COLORS.map(color => (
            <div
              key={color}
              className="rs-bucket"
              style={{ background: COLOR_BG[color] }}
              onClick={() => dispatch({ type: "sort", bucket: color } satisfies RainbowAction)}
            >
              {color}
            </div>
          ))}
        </div>
      )}

      {state.done && (
        <div className="rs-score">Final Score: {state.score}</div>
      )}
    </div>
  );
}
