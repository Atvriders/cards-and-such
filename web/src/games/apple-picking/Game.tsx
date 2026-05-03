import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AppleState, AppleSettings } from "./state.js";
import type { AppleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ApplePicking({ state, dispatch, onGameOver }: GameProps<AppleState, AppleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const pct = Math.min(100, Math.round((state.basket / state.goal) * 100));
  const won = state.done && state.basket >= state.goal;
  const lost = state.done && !won;

  return (
    <div className="ap-game">
      <div className={`ap-status${won ? " win" : lost ? " loss" : ""}`}>{state.message}</div>
      <div className="ap-info">
        Turns left: {state.turnsLeft} | Basket: {state.basket}/{state.goal}
      </div>

      <div className="ap-basket">🧺</div>
      <div className="ap-pbar-bg">
        <div className="ap-pbar-fill" style={{ width: `${pct}%` }} />
      </div>

      {!state.done && (
        <div className="ap-trees">
          {state.trees.map((tree) => (
            <div data-testid="hint-target-apple-picking-action"
              key={tree.id}
              className={`ap-tree${tree.apples === 0 ? " empty" : ""}`}
              onClick={() => tree.apples > 0 && dispatch({ type: "pick", treeId: tree.id } satisfies AppleAction)}
            >
              <div className="ap-tree-icon">{tree.apples > 0 ? "🍎" : "🌳"}</div>
              <div className="ap-apple-count">{tree.apples > 0 ? `${tree.apples} apples` : "Empty"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
