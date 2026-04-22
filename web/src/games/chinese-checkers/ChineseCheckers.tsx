import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CCState, CCSettings } from "./state.js";
import type { CCAction } from "./state.js";
import { isTerminal, getReachable, TOTAL_CELLS, ROW_SIZES, ROW_OFFSETS, PLAYER_GOAL, BOT_GOAL } from "./state.js";
import "./ChineseCheckers.css";

export function ChineseCheckers({
  state,
  dispatch,
  onGameOver,
}: GameProps<CCState, CCSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [reachable, setReachable] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.selected !== null) {
      setReachable(new Set(getReachable(state.cells, state.selected)));
    } else {
      setReachable(new Set());
    }
  }, [state.selected, state.cells]);

  const playerGoalSet = new Set(PLAYER_GOAL);
  const botGoalSet = new Set(BOT_GOAL);

  function handleCellClick(idx: number) {
    if (terminal || state.turn !== "player") return;
    const cell = state.cells[idx];

    if (state.selected === null) {
      if (cell === "player") dispatch({ type: "select", idx } as CCAction);
    } else if (reachable.has(idx)) {
      dispatch({ type: "move", to: idx } as CCAction);
    } else if (cell === "player") {
      dispatch({ type: "select", idx } as CCAction);
    } else {
      dispatch({ type: "select", idx: -1 } as CCAction); // deselect
    }
  }

  function getCellClass(idx: number): string {
    const cell = state.cells[idx];
    const classes: string[] = ["cc-cell"];
    if (idx === state.selected) classes.push("selected");
    else if (cell === "player") classes.push("player-peg");
    else if (cell === "bot") classes.push("bot-peg");
    else if (reachable.has(idx)) classes.push("reachable");
    else if (playerGoalSet.has(idx)) classes.push("player-goal");
    else if (botGoalSet.has(idx)) classes.push("bot-goal");
    return classes.join(" ");
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "player") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "bot") { statusText = "Bot wins!"; statusClass = "loss"; }
  else { statusText = state.turn === "player" ? "Your turn (Red)" : "Bot thinking..."; }

  // Render rows
  const rows: JSX.Element[] = [];
  for (let r = 0; r < 17; r++) {
    const o = ROW_OFFSETS[r]!;
    const sz = ROW_SIZES[r]!;
    const cells: JSX.Element[] = [];
    for (let c = 0; c < sz; c++) {
      const idx = o + c;
      cells.push(
        <div key={idx} className={getCellClass(idx)} onClick={() => handleCellClick(idx)} />,
      );
    }
    rows.push(
      <div key={r} className="cc-row">{cells}</div>,
    );
  }

  return (
    <div className="cc-game">
      <div className="cc-info">Chinese Checkers — Red (you) vs Blue (bot)</div>
      <div className={`cc-status ${statusClass}`}>{statusText}</div>
      <div className="cc-board">{rows}</div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        Move all Red pegs (top) to the Blue corner (bottom) to win.
      </div>
    </div>
  );
}
