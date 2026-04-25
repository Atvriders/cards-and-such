import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CyoaFantasyState, CyoaFantasyAction } from "./state.js";
import { isTerminal, getNode } from "./state.js";
import "./Game.css";

export function CyoaFantasy({ state, dispatch, onGameOver }: GameProps<CyoaFantasyState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const node = getNode(state.nodeId);
  const d = (a: CyoaFantasyAction) => dispatch(a);

  return (
    <div className="cf-wrap">
      <div className="cf-header">
        <div className="cf-title">Choose Your Path: Fantasy</div>
        <div className="cf-subtitle">The Quest for the Sunstone</div>
      </div>
      <div className="cf-chapter">{node.title}</div>
      <div className="cf-scene">{node.text}</div>
      {state.phase === "playing" && (
        <div className="cf-choices">
          {node.choices.map((ch, i) => (
            <button key={i} className="cf-choice"
              onClick={() => d({ type: "choose", nextId: ch.next, scoreAdd: ch.scoreAdd ?? 0 })}>
              {ch.label}
            </button>
          ))}
        </div>
      )}
      {state.phase === "done" && (
        <div className="cf-done">
          <div className="cf-done-title">{node.title}</div>
          <div className="cf-score">Score: {terminal?.score ?? 0}/100</div>
          <div className="cf-steps">Completed in {state.steps} choices</div>
        </div>
      )}
    </div>
  );
}
