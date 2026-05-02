import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MorabarabaState, MorabarabaSettings } from "./state.js";
import { type MorabarabaAction, isTerminal, canRemove, ADJACENCY } from "./state.js";
import "./Game.css";

// Position coordinates on 320x320 board
// Outer square: 0-7, Middle: 8-15, Inner: 16-23
const PX = 320;
const COORDS: [number, number][] = [
  [0,0],[160,0],[320,0],[320,160],[320,320],[160,320],[0,320],[0,160],
  [40,40],[160,40],[280,40],[280,160],[280,280],[160,280],[40,280],[40,160],
  [80,80],[160,80],[240,80],[240,160],[240,240],[160,240],[80,240],[80,160],
].map(([x, y]) => [(x ?? 0) / PX * 100, (y ?? 0) / PX * 100] as [number, number]);

function Lines() {
  const pairs: [number, number][] = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],
    [8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,8],
    [16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,16],
    [1,9],[9,17],[3,11],[11,19],[5,13],[13,21],[7,15],[15,23],
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {pairs.map(([a, b], i) => (
        <line key={i}
          x1={COORDS[a]![0]} y1={COORDS[a]![1]}
          x2={COORDS[b]![0]} y2={COORDS[b]![1]}
          stroke="#5a3a10" strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}

export function Morabaraba({
  state,
  dispatch,
  onGameOver,
}: GameProps<MorabarabaState, MorabarabaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "P" && state.winner === null;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "P") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.pendingRemove) { statusText = "You formed a mill! Click an opponent piece to remove."; statusClass = "remove"; }
  else if (!isPlayerTurn) statusText = "Bot is thinking…";
  else if (state.phase === "place") statusText = `Place a cow (${state.pHand} remaining).`;
  else if (state.selected !== null) statusText = "Click an adjacent empty point to move.";
  else statusText = "Click one of your cows to select it.";

  function handleClick(pos: number) {
    if (!isPlayerTurn) return;
    if (state.pendingRemove) {
      dispatch({ type: "remove", pos } satisfies MorabarabaAction);
      return;
    }
    if (state.phase === "place") {
      dispatch({ type: "place", pos } satisfies MorabarabaAction);
      return;
    }
    if (state.phase === "move") {
      if (state.selected !== null && state.board[pos] === null) {
        dispatch({ type: "moveTo", pos } satisfies MorabarabaAction);
      } else if (state.board[pos] === "P") {
        dispatch({ type: "select", pos } satisfies MorabarabaAction);
      }
    }
  }

  function getPointClass(pos: number): string {
    if (!isPlayerTurn) return "";
    if (state.pendingRemove && canRemove(state.board, pos, "P")) return "removable";
    if (state.phase === "place" && state.board[pos] === null) return "selectable";
    if (state.phase === "move") {
      if (state.selected === pos) return "selected";
      if (state.selected !== null && state.board[pos] === null) {
        const canFly = state.board.filter((c) => c === "P").length === 3;
        if (canFly || ADJACENCY[state.selected]!.includes(pos)) return "selectable";
      }
      if (state.board[pos] === "P") return "selectable";
    }
    return "";
  }

  return (
    <div className="morabaraba">
      <div className={`morabaraba-status ${statusClass}`}>{statusText}</div>
      <div className="morabaraba-info">
        <span>Your cows: {state.board.filter((c) => c === "P").length} (hand: {state.pHand})</span>
        <span>Bot cows: {state.board.filter((c) => c === "B").length} (hand: {state.bHand})</span>
      </div>
      <div className="morabaraba-board">
        <Lines />
        {COORDS.map(([x, y], pos) => (
          <div
            key={pos}
            className={`morabaraba-point ${getPointClass(pos)}`}
            data-testid={`morabaraba-pos-${pos}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => handleClick(pos)}
          >
            {state.board[pos] === "P" && <div className="morabaraba-piece P" />}
            {state.board[pos] === "B" && <div className="morabaraba-piece B" />}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Form rows of 3 (mills) to remove opponent cows. 3 cows left = fly anywhere.
      </div>
    </div>
  );
}
