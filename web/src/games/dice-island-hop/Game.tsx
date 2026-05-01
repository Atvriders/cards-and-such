import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceIslandHopState, DiceIslandHopAction, DiceIslandHopSettings } from "./state.js";
import { isTerminal, ISLANDS, HOPS } from "./state.js";
import "./Game.css";

export function DiceIslandHopGame({ state, dispatch, onGameOver }: GameProps<DiceIslandHopState, DiceIslandHopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ih-wrap">
        <div className="ih-done">
          <h2>{state.pos >= ISLANDS ? "Made it Home" : "Marooned"}</h2>
          <div className="ih-final">{state.score} pts</div>
          <div className="ih-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const tiles: JSX.Element[] = [];
  for (let i = 1; i <= ISLANDS; i++) {
    const here = state.pos === i;
    tiles.push(<div key={i} className={`ih-island${here ? " here" : ""}`}>{here ? "*" : i}</div>);
  }

  return (
    <div className="ih-wrap">
      <div className="ih-banner">Hops {state.hops} / {HOPS} · Score {state.score}</div>
      <div className="ih-row-track">{tiles}</div>
      {state.rolls && (
        <div className="ih-row">
          <div className="ih-die">{state.rolls[0]}</div>
          <div className="ih-die">{state.rolls[1]}</div>
        </div>
      )}
      <div className="ih-log">{state.log || "Roll the surf and hop islands. Doubles award bonus."}</div>
      {state.phase === "roll" && (
        <button className="ih-btn" onClick={() => dispatch({ type: "hop" } as DiceIslandHopAction)}>Hop</button>
      )}
      {state.phase === "result" && (
        <button className="ih-btn alt" onClick={() => dispatch({ type: "next" } as DiceIslandHopAction)}>Continue</button>
      )}
    </div>
  );
}
