import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceVillageState, DiceVillageAction, DiceVillageSettings, Building } from "./state.js";
import { isTerminal, TURNS, BUILDINGS } from "./state.js";
import "./Game.css";

const REQ_DESC: Record<Building, string> = {
  house: "any 1-2",
  farm: "any 3 or 4",
  mill: "any 5",
  church: "two 6s",
};

const PTS: Record<Building, number> = { house: 8, farm: 14, mill: 20, church: 36 };

function canBuild(b: Building, r: number[]): boolean {
  if (b === "house") return r.some(x => x <= 2);
  if (b === "farm") return r.some(x => x === 3 || x === 4);
  if (b === "mill") return r.some(x => x === 5);
  return r.filter(x => x === 6).length >= 2;
}

export function DiceVillageGame({ state, dispatch, onGameOver }: GameProps<DiceVillageState, DiceVillageSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="vi-wrap">
        <div className="vi-done">
          <h2>Village Founded</h2>
          <div className="vi-final">{state.score} pts</div>
          <div className="vi-log">Houses {state.built.house}, Farms {state.built.farm}, Mills {state.built.mill}, Church {state.built.church}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="vi-wrap">
      <div className="vi-banner">Turn {state.turn} / {TURNS} · Score {state.score}</div>
      <div className="vi-village">
        {BUILDINGS.map(b => (
          <div key={b} className="vi-stat">
            <div className="vi-stat-label">{b}</div>
            <div className="vi-stat-val">{state.built[b]}</div>
          </div>
        ))}
      </div>
      {state.rolls && (
        <div className="vi-row">
          {state.rolls.map((r, i) => <div key={i} className="vi-die">{r}</div>)}
        </div>
      )}
      <div className="vi-log">{state.log || "Roll three dice. Different buildings need different rolls."}</div>
      {state.phase === "roll" && (
        <button className="vi-btn" onClick={() => dispatch({ type: "roll" } as DiceVillageAction)}>Roll Workers</button>
      )}
      {state.phase === "build" && state.rolls && (
        <div className="vi-actions">
          {BUILDINGS.map(b => (
            <button
              key={b}
              className="vi-btn b"
              disabled={!canBuild(b, state.rolls!)}
              onClick={() => dispatch({ type: "build", what: b } as DiceVillageAction)}
            >{b} (+{PTS[b]}, {REQ_DESC[b]})</button>
          ))}
          <button className="vi-btn alt" onClick={() => dispatch({ type: "skip" } as DiceVillageAction)}>Skip</button>
        </div>
      )}
    </div>
  );
}
