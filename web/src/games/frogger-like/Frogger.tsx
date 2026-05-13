import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FroggerState, FroggerAction, FroggerSettings, Dir } from "./state.js";
import { isTerminal, HOME_COLS, HOME_ROW, START_ROW, ROWS, COLS } from "./state.js";
import "./Frogger.css";

const CELL = 44;

const TICK_MS = 120;

function cellType(
  row: number,
  _col: number,
): "home" | "water" | "safe" | "road" {
  if (row === HOME_ROW) return "home";
  if (row === 1 || row === 2) return "water";
  if (row === 3 || row === START_ROW) return "safe";
  return "road";
}

export function Frogger({
  state,
  dispatch,
  onGameOver,
}: GameProps<FroggerState, FroggerSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Tick interval ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      if (!stateRef.current.over && !stateRef.current.won) {
        dispatch({ type: "tick" } as FroggerAction);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [dispatch]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const dirMap: Record<string, Dir> = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
      };
      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        dispatch({ type: "move", dir } as FroggerAction);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { frogRow, frogCol, obstacles, homesFilled, lives } = state;
  const maxLives = parseInt(state.settings.lives, 10);

  // Build cell lookup
  const obstacleCells = new Map<string, "car" | "log">();
  for (const o of obstacles) {
    const left = Math.round(((o.col % COLS) + COLS) % COLS);
    const isLog = o.row === 1 || o.row === 2;
    for (let i = 0; i < o.width; i++) {
      const c = (left + i) % COLS;
      obstacleCells.set(`${o.row},${c}`, isLog ? "log" : "car");
    }
  }

  const boardWidthPx = COLS * CELL + (COLS - 1);
  const boardHeightPx = ROWS * CELL + (ROWS - 1);

  return (
    <div className="frogger-game">
      <div className="frogger-header">
        <span>Score: {state.score}</span>
        <span>Homes: {state.homesReached}/5</span>
        <div className="frogger-lives">
          {Array.from({ length: maxLives }, (_, i) => (
            <span
              key={i}
              className={`frogger-life${i >= lives ? " frogger-life--lost" : ""}`}
            />
          ))}
        </div>
      </div>

      <div
        className="frogger-board"
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
          width: boardWidthPx,
          height: boardHeightPx,
        }}
      >
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const key = `${r},${c}`;
            const isFrog = r === frogRow && c === frogCol;
            const obsType = obstacleCells.get(key);
            const type = cellType(r, c);
            const homeIdx = HOME_COLS.indexOf(c as typeof HOME_COLS[number]);
            const isHomeSpot = r === HOME_ROW && homeIdx !== -1;
            const isHomeFilled = isHomeSpot && homesFilled[homeIdx];

            let cls = "frogger-cell";
            if (isHomeFilled) cls += " frogger-cell--home-filled";
            else if (isHomeSpot) cls += " frogger-cell--home-empty";
            else if (obsType === "car") cls += " frogger-cell--car";
            else if (obsType === "log") cls += " frogger-cell--log";
            else if (type === "water") cls += " frogger-cell--water";
            else if (type === "road") cls += " frogger-cell--road";
            else cls += " frogger-cell--safe";

            return (
              <div
                key={key}
                className={cls}
                data-testid={`hint-target-frogger-${r}-${c}`}
                style={{ width: CELL, height: CELL }}
              >
                {isFrog && "🐸"}
                {isHomeFilled && !isFrog && "🐸"}
              </div>
            );
          })
        )}

        {terminal && (
          <div className="frogger-overlay">
            <h2>{state.won ? "You Win!" : "Game Over"}</h2>
            <p>Homes: {state.homesReached}/5</p>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="frogger-hint">
        Arrow keys / WASD to hop
      </div>
    </div>
  );
}
