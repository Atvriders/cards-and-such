import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CCFState, CCFSettings, CCFAction, PlayerId } from "./state.js";
import {
  isTerminal,
  getReachable,
  rowFileOffsets,
  START_BY_PLAYER,
  GOAL_BY_PLAYER,
} from "./state.js";
import "./Game.css";

const PLAYER_NAMES = [
  "You (Red)",
  "Orange CPU",
  "Yellow CPU",
  "Green CPU",
  "Blue CPU",
  "Purple CPU",
];

const PLAYER_SHORT = ["You", "Orange", "Yellow", "Green", "Blue", "Purple"];

export function ChineseCheckersFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CCFState, CCFSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Advance CPU turns automatically.
  useEffect(() => {
    if (terminal) return;
    if (state.turn === 0) return;
    const id = setTimeout(() => {
      dispatch({ type: "advance-cpu" } as CCFAction);
    }, 380);
    return () => clearTimeout(id);
  }, [state.turn, state.cells, terminal, dispatch]);

  const reachable = useMemo<Set<number>>(() => {
    if (state.selected === null) return new Set();
    return new Set(getReachable(state.cells, state.selected, state.settings.moveMode));
  }, [state.selected, state.cells, state.settings.moveMode]);

  const humanGoalSet = useMemo(() => new Set(GOAL_BY_PLAYER[0]!), []);
  const startOwners = useMemo(() => {
    const map = new Map<number, PlayerId>();
    for (let p = 0; p < 6; p++) {
      for (const idx of START_BY_PLAYER[p]!) map.set(idx, p as PlayerId);
    }
    return map;
  }, []);

  // Precompute display rows once.
  const displayRows = useMemo(() => rowFileOffsets(), []);
  // Compute the global file extent so we can left-pad each row visually.
  const fileMin = useMemo(() => {
    let m = Infinity;
    for (const row of displayRows) {
      for (const f of row.fileOffsets) if (f < m) m = f;
    }
    return m;
  }, [displayRows]);

  function handleCellClick(idx: number) {
    if (terminal) return;
    if (state.turn !== 0) return;
    const cell = state.cells[idx];
    if (state.selected === null) {
      if (cell === 0) dispatch({ type: "select", idx } as CCFAction);
      return;
    }
    if (reachable.has(idx)) {
      dispatch({ type: "move", to: idx } as CCFAction);
      return;
    }
    if (cell === 0) {
      dispatch({ type: "select", idx } as CCFAction);
      return;
    }
    dispatch({ type: "deselect" } as CCFAction);
  }

  function cellClasses(idx: number): string {
    const cell = state.cells[idx];
    const classes = ["ccf-cell"];
    if (state.selected === idx) classes.push("selected");
    if (cell !== null && cell !== undefined) classes.push(`peg-${cell}`);
    else classes.push("empty");
    if (reachable.has(idx)) classes.push("reachable");
    const owner = startOwners.get(idx);
    if (owner !== undefined && (cell === null || cell === undefined)) classes.push(`zone-${owner}`);
    if (humanGoalSet.has(idx) && (cell === null || cell === undefined)) classes.push("human-goal");
    if (state.lastMove?.to === idx) classes.push("last-move");
    return classes.join(" ");
  }

  let status: string;
  let statusKind = "";
  if (state.winner !== null) {
    if (state.winner === 0) { status = "You win the star!"; statusKind = "win"; }
    else { status = `${PLAYER_NAMES[state.winner]} wins.`; statusKind = "loss"; }
  } else if (state.turn === 0) {
    status = state.selected === null
      ? "Your turn — pick a red peg"
      : "Choose a yellow destination";
  } else {
    status = `${PLAYER_NAMES[state.turn]} is moving…`;
  }

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="ccf-wrap fade-in">
      <div className="ccf-header">
        <div className="ccf-title">Chinese Checkers — 6-Player Star</div>
        <button
          type="button"
          className="ccf-help-btn"
          title="Toggle how-to-play rules"
          aria-label="Toggle how-to-play rules"
          onClick={() => setShowHelp((v) => !v)}
          data-testid="ccf-help"
        >
          {showHelp ? "Hide rules" : "Show rules"}
        </button>
      </div>

      <div className={`ccf-status ${statusKind} pulse`} data-testid="ccf-status">{status}</div>

      <div className="ccf-legend">
        {PLAYER_SHORT.map((n, p) => {
          const filled = GOAL_BY_PLAYER[p]!.filter((i) => state.cells[i] === p).length;
          return (
            <div
              key={p}
              className={`ccf-legend-item ${state.turn === p && !terminal ? "active" : ""}`}
              title={`${PLAYER_NAMES[p]} — ${filled} of 10 pegs in goal`}
            >
              <span className={`ccf-swatch peg-${p}`} />
              <span className="ccf-legend-name">{n}</span>
              <span className="ccf-legend-score">{filled}/10</span>
            </div>
          );
        })}
      </div>

      <div className="ccf-board" data-testid="ccf-board" role="grid" aria-label="Chinese Checkers full star board">
        {displayRows.map(({ r, cells, fileOffsets }) => {
          // Compute left margin so each row is centered on the global axis.
          const firstFile = fileOffsets[0] ?? 0;
          const offset = (firstFile - fileMin) * 22; // 22 = cell-step in CSS
          return (
            <div key={r} className="ccf-row" data-row={r} style={{ paddingLeft: `${offset}px` }}>
              {cells.map((idx) => (
                <button
                  type="button"
                  key={idx}
                  className={cellClasses(idx)}
                  onClick={() => handleCellClick(idx)}
                  title={cellTitle(idx, state)}
                  aria-label={cellTitle(idx, state)}
                  data-testid={`ccf-cell-${idx}`}
                  disabled={terminal !== null}
                />
              ))}
            </div>
          );
        })}
      </div>

      {showHelp && (
        <div className="ccf-help">
          <p><strong>Goal.</strong> Be first to move all 10 of your red pegs to the opposite (green-highlighted) star point.</p>
          <p><strong>Move.</strong> Click a red peg, then click a highlighted yellow cell. You may step to any empty neighbor, or hop over a single peg into the empty cell beyond. Chain jumps are computed for you — every empty cell you can reach in one turn lights up.</p>
          <p><strong>Setting.</strong> Mode is {state.settings.moveMode === "jump-only" ? "Jump-only (no plain steps; faster, jumpier games)" : "Jump-or-step (classic)"}. CPUs use the same rule.</p>
        </div>
      )}

      {terminal !== null && (
        <div className={`ccf-result bounce-in ${state.winner === 0 ? "win" : "loss"}`} data-testid="ccf-result">
          <div className="ccf-result-title">
            {state.winner === 0 ? "Victory!" : `${PLAYER_NAMES[state.winner!]} wins.`}
          </div>
          <div className="ccf-result-score">Score: {terminal.score}</div>
        </div>
      )}
    </div>
  );
}

function cellTitle(idx: number, state: CCFState): string {
  const cell = state.cells[idx];
  if (cell !== null && cell !== undefined) return `${PLAYER_NAMES[cell]} peg`;
  return "Empty cell";
}
