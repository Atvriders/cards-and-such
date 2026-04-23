import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CandyState, CandySettings } from "./state.js";
import type { CandyAction } from "./state.js";
import { isTerminal, PATH_COLORS, BOARD_SIZE } from "./state.js";
import "./Game.css";

const PLAYER_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];
const PLAYER_LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];
const COLOR_BG: Record<string, string> = {
  red: "#ff6b6b",
  orange: "#ffa94d",
  yellow: "#ffe066",
  green: "#69db7c",
  blue: "#74c0fc",
  purple: "#cc5de8",
};

export function CandyLand({ state, dispatch, onGameOver }: GameProps<CandyState, CandySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canDraw = state.turn === 0 && state.winner === null;

  return (
    <div className="cl-game">
      <div className={`cl-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {state.message}
      </div>

      {state.lastCard && (
        <div className="cl-card" style={{ background: COLOR_BG[state.lastCard] ?? "#ccc" }}>
          {state.lastCard === "double-red" ? "Double Red!" :
           state.lastCard === "gumdrop-pass" ? "Gumdrop Pass!" :
           state.lastCard === "gloppys-swamp" ? "Gloppy's Swamp!" :
           state.lastCard.charAt(0).toUpperCase() + state.lastCard.slice(1)}
        </div>
      )}

      <div className="cl-players">
        {Array.from({ length: state.numPlayers }, (_, i) => (
          <div key={i} className="cl-player" style={{ color: PLAYER_COLORS[i] }}>
            <strong>{PLAYER_LABELS[i] ?? `P${i}`}</strong>: sq {state.positions[i] === 0 ? "Start" : (state.positions[i] ?? 0) > BOARD_SIZE ? "Finished!" : state.positions[i]}
            <div className="cl-pbar-bg">
              <div className="cl-pbar-fill" style={{ width: `${Math.min(100, (state.positions[i]! / BOARD_SIZE) * 100)}%`, background: PLAYER_COLORS[i] }} />
            </div>
          </div>
        ))}
      </div>

      {canDraw && (
        <button className="cl-draw-btn" onClick={() => dispatch({ type: "draw" } satisfies CandyAction)}>
          Draw Card
        </button>
      )}

      <div className="cl-path">
        {PATH_COLORS.map((color, i) => {
          const sq = i + 1;
          const playersHere = Array.from({ length: state.numPlayers }, (_, pi) =>
            state.positions[pi] === sq ? pi : -1
          ).filter((pi) => pi !== -1);
          return (
            <div key={sq} className="cl-square" style={{ background: COLOR_BG[color] }} title={`Sq ${sq}`}>
              <span className="cl-sq-num">{sq}</span>
              {playersHere.map((pi) => (
                <span key={pi} className="cl-token" style={{ background: PLAYER_COLORS[pi] }}>
                  {PLAYER_LABELS[pi]![0]}
                </span>
              ))}
            </div>
          );
        })}
        <div className="cl-square cl-finish" title="Finish">
          <span className="cl-sq-num">🏁</span>
          {Array.from({ length: state.numPlayers }, (_, pi) =>
            state.positions[pi]! > BOARD_SIZE ? (
              <span key={pi} className="cl-token" style={{ background: PLAYER_COLORS[pi] }}>
                {PLAYER_LABELS[pi]![0]}
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
