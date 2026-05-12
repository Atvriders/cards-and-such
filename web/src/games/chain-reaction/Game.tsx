import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChainReactionState, ChainReactionAction } from "./state.js";
import { ROWS, COLS, capacity, idx, isTerminal } from "./state.js";
import "./Game.css";

const ORB_EMOJI = ["", "●", "●●", "●●●", "●●●●"];

export function ChainReactionGame({ state, dispatch, onGameOver }: GameProps<ChainReactionState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  return (
    <div className="chain-reaction">
      <div className="chain-reaction-status">
        <span>You: 🔵 | Bot: 🔴</span>
        <span>Move: {state.moveCount}</span>
        <span>{state.turn === 0 ? "Your turn" : "Bot thinking..."}</span>
      </div>

      {terminal && (
        <div className={`chain-reaction-result${state.won ? " chain-reaction-result--won" : " chain-reaction-result--lost"}`}>
          {state.won ? "You win! All bot cells captured!" : "Bot wins!"}
        </div>
      )}

      <div
        className="chain-reaction-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 56px)` }}
      >
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const cell = state.grid[idx(r, c)]!;
            const cap = capacity(r, c);
            const isCritical = cell.orbs >= cap - 1 && cell.orbs > 0;
            let cls = "chain-reaction-cell";
            if (cell.owner === 0) cls += " chain-reaction-cell--player";
            else if (cell.owner === 1) cls += " chain-reaction-cell--bot";
            if (isCritical) cls += " chain-reaction-cell--critical";
            return (
              <div
                key={`${r},${c}`}
                className={cls}
                title={`(${r},${c}) cap:${cap} orbs:${cell.orbs}`}
                onClick={() => {
                  if (terminal || state.turn !== 0) return;
                  dispatch({ type: "place", row: r, col: c } satisfies ChainReactionAction);
                }}
              >
                {cell.orbs > 0 && (
                  <span className="chain-reaction-orbs">{ORB_EMOJI[Math.min(cell.orbs, 4)]}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ fontSize: "0.78rem", color: "#888", textAlign: "center" }}>
        Click any empty cell or your own cell (blue). Cells explode when full — chain reactions capture adjacent cells!
        Corners hold 2, edges 3, interior 4.
      </div>
    </div>
  );
}
