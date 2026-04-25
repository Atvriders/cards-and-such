import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CyoaHorrorState, CyoaHorrorAction } from "./state.js";
import { isTerminal, getNode } from "./state.js";
import "./Game.css";

export function CyoaHorror({ state, dispatch, onGameOver }: GameProps<CyoaHorrorState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const node = getNode(state.nodeId);
  const d = (a: CyoaHorrorAction) => dispatch(a);

  return (
    <div className="ch-wrap">
      <div className="ch-header">
        <div className="ch-title">Choose Your Path: Horror</div>
        <div className="ch-subtitle">A Night at Ravenwood Manor</div>
      </div>
      <div className="ch-chapter">{node.title}</div>
      <div className="ch-scene">{node.text}</div>
      {state.phase === "playing" && (
        <div className="ch-choices">
          {node.choices.map((ch, i) => (
            <button key={i} className="ch-choice"
              onClick={() => d({ type: "choose", nextId: ch.next, scoreAdd: ch.scoreAdd ?? 0 })}>
              {ch.label}
            </button>
          ))}
        </div>
      )}
      {state.phase === "done" && (
        <div className="ch-done">
          <div className="ch-done-title">{node.title}</div>
          <div className="ch-score">Survival Score: {terminal?.score ?? 0}/100</div>
          <div className="ch-steps">{state.steps} decisions made</div>
        </div>
      )}
    </div>
  );
}
