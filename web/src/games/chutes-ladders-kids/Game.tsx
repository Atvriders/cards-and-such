import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KidsState, KidsSettings } from "./state.js";
import type { KidsAction } from "./state.js";
import { isTerminal, BOARD_SIZE, CHUTES_LADDERS } from "./state.js";
import "./Game.css";

const PLAYER_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12"];
const PLAYER_LABELS = ["You", "Bot 1", "Bot 2", "Bot 3"];

function squareAt(row: number, col: number, cols: number, rows: number): number {
  const rowFromBottom = rows - 1 - row;
  if (rowFromBottom % 2 === 0) return rowFromBottom * cols + col + 1;
  return rowFromBottom * cols + (cols - 1 - col) + 1;
}

const COLS = 6;
const ROWS = 5; // 5×6 = 30

const ladderFroms = new Set(CHUTES_LADDERS.filter((x) => x.type === "ladder").map((x) => x.from));
const chuteFroms = new Set(CHUTES_LADDERS.filter((x) => x.type === "chute").map((x) => x.from));

export function ChutesLaddersKids({ state, dispatch, onGameOver }: GameProps<KidsState, KidsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canRoll = state.turn === 0 && state.winner === null;

  return (
    <div className="clk-game">
      <div className={`clk-status ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {state.message}
      </div>

      {state.lastTeleport && (
        <div className={`clk-teleport ${state.lastTeleport.type}`}>
          {PLAYER_LABELS[state.lastTeleport.player]}: {state.lastTeleport.type === "ladder" ? "🪜 Ladder!" : "🎢 Chute!"} {state.lastTeleport.from}→{state.lastTeleport.to}
        </div>
      )}

      <div className="clk-controls">
        {state.die > 0 && <div className="clk-die">{state.die}</div>}
        {canRoll && (
          <button className="clk-roll-btn" onClick={() => dispatch({ type: "roll" } satisfies KidsAction)}>
            Roll Die (d4)
          </button>
        )}
      </div>

      <div className="clk-players">
        {Array.from({ length: state.numPlayers }, (_, i) => (
          <div key={i} className="clk-player" style={{ color: PLAYER_COLORS[i] }}>
            {PLAYER_LABELS[i]}: {state.positions[i] === 0 ? "Start" : state.positions[i] === BOARD_SIZE ? "Finished!" : `Sq ${state.positions[i]}`}
          </div>
        ))}
      </div>

      <div className="clk-board">
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const sq = squareAt(row, col, COLS, ROWS);
            const playersHere = Array.from({ length: state.numPlayers }, (_, pi) =>
              state.positions[pi] === sq ? pi : -1
            ).filter((pi) => pi !== -1);
            let cls = "clk-cell";
            if (ladderFroms.has(sq)) cls += " ladder";
            if (chuteFroms.has(sq)) cls += " chute";
            return (
              <div key={`${row}-${col}`} className={cls} title={`Sq ${sq}`}>
                <span className="clk-sq-num">{sq}</span>
                {ladderFroms.has(sq) && <span>🪜</span>}
                {chuteFroms.has(sq) && <span>🎢</span>}
                <div className="clk-tokens">
                  {playersHere.map((pi) => (
                    <span key={pi} className="clk-token" style={{ background: PLAYER_COLORS[pi] }}>
                      {PLAYER_LABELS[pi]![0]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
