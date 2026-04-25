import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PicariaState, PicariaSettings } from "./state.js";
import { type PicariaAction, isTerminal, ADJACENCY } from "./state.js";
import "./Game.css";

// 3x3 grid, 240px
const POSITIONS: [number, number][] = [
  [0,0],[50,0],[100,0],
  [0,50],[50,50],[100,50],
  [0,100],[50,100],[100,100],
];

function Lines() {
  const pairs: [number,number][] = [
    [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],
    [0,3],[3,6],[1,4],[4,7],[2,5],[5,8],
    [0,4],[4,8],[2,4],[4,6],
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {pairs.map(([a,b],i) => (
        <line key={i}
          x1={POSITIONS[a]![0]} y1={POSITIONS[a]![1]}
          x2={POSITIONS[b]![0]} y2={POSITIONS[b]![1]}
          stroke="#7a4010" strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export function Picaria({
  state,
  dispatch,
  onGameOver,
}: GameProps<PicariaState, PicariaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "P" && state.winner === null;
  const placing = state.pPlaced < 3;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "P") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is thinking…";
  else if (placing) statusText = `Place a piece (${3 - state.pPlaced} left).`;
  else if (state.selected !== null) statusText = "Click an adjacent empty point to move.";
  else statusText = "Click one of your pieces to select it.";

  function handleClick(pos: number) {
    if (!isPlayerTurn) return;
    if (placing) { dispatch({ type: "place", pos } satisfies PicariaAction); return; }
    if (state.selected !== null && state.board[pos] === null) {
      dispatch({ type: "moveTo", pos } satisfies PicariaAction);
    } else if (state.board[pos] === "P") {
      dispatch({ type: "select", pos } satisfies PicariaAction);
    }
  }

  function getClass(pos: number): string {
    if (!isPlayerTurn) return "";
    if (placing && state.board[pos] === null) return "selectable";
    if (!placing) {
      if (state.selected === pos) return "selected";
      if (state.board[pos] === "P") return "selectable";
      if (state.selected !== null && state.board[pos] === null && ADJACENCY[state.selected]!.includes(pos)) return "target";
    }
    return "";
  }

  return (
    <div className="picaria">
      <div className={`picaria-status ${statusClass}`}>{statusText}</div>
      <div className="picaria-info">You: {state.pPlaced} placed | Bot: {state.bPlaced} placed</div>
      <div className="picaria-board">
        <Lines />
        {POSITIONS.map(([px, py], pos) => (
          <div
            key={pos}
            className={`picaria-point ${getClass(pos)}`}
            style={{ left: `${px}%`, top: `${py}%` }}
            onClick={() => handleClick(pos)}
          >
            {state.board[pos] === "P" && <div className="picaria-piece P" />}
            {state.board[pos] === "B" && <div className="picaria-piece B" />}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        3 pieces each · Get 3 in a row to win · Move along lines after placing
      </div>
    </div>
  );
}
