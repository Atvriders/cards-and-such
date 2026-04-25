import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TextAdventureState, TextAdventureAction } from "./state.js";
import { isTerminal, getNode } from "./state.js";
import "./Game.css";

export function TextAdventureMini({ state, dispatch, onGameOver }: GameProps<TextAdventureState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const node = getNode(state.nodeId);
  const d = (a: TextAdventureAction) => dispatch(a);

  return (
    <div className="ta-wrap">
      <div className="ta-header">
        Text Adventure
        <span className="ta-breadcrumb"> — {state.visitedIds.length} steps taken</span>
      </div>
      <div className="ta-scene">{node.text}</div>
      {state.phase === "playing" && (
        <div className="ta-choices">
          {node.choices.map((ch, i) => (
            <button key={i} className="ta-choice"
              onClick={() => d({ type: "choose", nextId: ch.next, scoreAdd: ch.scoreAdd ?? 0 })}>
              {ch.label}
            </button>
          ))}
        </div>
      )}
      {state.phase === "done" && (
        <div className="ta-done">
          <div className="ta-done-title">Adventure Complete!</div>
          <div className="ta-score">Score: {terminal?.score ?? 0}/100</div>
          <div className="ta-visited">Explored {state.visitedIds.length} scenes</div>
        </div>
      )}
    </div>
  );
}
