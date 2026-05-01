import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTreasureMapState, DiceTreasureMapAction, DiceTreasureMapSettings } from "./state.js";
import { isTerminal, TILES, DIGS } from "./state.js";
import "./Game.css";

export function DiceTreasureMapGame({ state, dispatch, onGameOver }: GameProps<DiceTreasureMapState, DiceTreasureMapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const tiles: JSX.Element[] = [];
  for (let i = 0; i < TILES; i++) {
    const r = state.revealed.includes(i);
    const treas = r && state.treasures.includes(i);
    const isLast = state.lastTile === i;
    tiles.push(<div key={i} className={`tm-tile${r ? " open" : ""}${treas ? " gold" : ""}${isLast ? " glow" : ""}`}>{r ? (treas ? "X" : "·") : "?"}</div>);
  }

  if (state.phase === "done") {
    return (
      <div className="tm-wrap">
        <div className="tm-grid">{tiles}</div>
        <div className="tm-done">
          <h2>Map Closed</h2>
          <div className="tm-final">{state.score} pts</div>
          <div className="tm-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-wrap">
      <div className="tm-banner">Digs left {state.digsLeft} / {DIGS} · Score {state.score}</div>
      <div className="tm-grid">{tiles}</div>
      {state.rolls && (
        <div className="tm-row">
          <div className="tm-die">{state.rolls[0]}</div>
          <div className="tm-die">{state.rolls[1]}</div>
        </div>
      )}
      <div className="tm-log">{state.log || "Roll the dice — they pinpoint a tile to dig."}</div>
      {state.phase === "choose" && (
        <button className="tm-btn" onClick={() => dispatch({ type: "dig" } as DiceTreasureMapAction)}>Dig</button>
      )}
      {state.phase === "result" && (
        <button className="tm-btn alt" onClick={() => dispatch({ type: "next" } as DiceTreasureMapAction)}>Continue</button>
      )}
    </div>
  );
}
