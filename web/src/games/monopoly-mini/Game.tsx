import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonopolyState, MonopolyAction, MonopolySettings } from "./state.js";
import { isTerminal, score, BOARD_LEN, PRICES } from "./state.js";
import "./Game.css";

export function MonopolyMiniGame({ state, dispatch, onGameOver }: GameProps<MonopolyState, MonopolySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="mp-wrap">
      <div className="mp-stats">
        <div>Turn <b>{state.turn}</b></div>
        <div>You <b>${state.pCash}</b></div>
        <div>CPU <b>${state.cCash}</b></div>
      </div>
      <div className="mp-board">
        {Array.from({ length: BOARD_LEN }, (_, i) => {
          const own = state.owners[i];
          return (
            <div key={i} className={`mp-cell mp-${own}`}>
              <div>#{i}</div>
              <div className="mp-price">${PRICES[i]}</div>
              {state.pPos === i && <span className="mp-tok mp-p">P</span>}
              {state.cPos === i && <span className="mp-tok mp-c">C</span>}
            </div>
          );
        })}
      </div>
      <div className="mp-msg">{state.message}</div>
      {state.phase === "rolling" && state.isPlayer && <button className="mp-btn" onClick={() => dispatch({ type: "roll" } as MonopolyAction)}>Roll</button>}
      {state.phase === "deciding" && (
        <div className="mp-buttons">
          <button onClick={() => dispatch({ type: "buy" } as MonopolyAction)}>Buy</button>
          <button onClick={() => dispatch({ type: "skip" } as MonopolyAction)}>Skip</button>
        </div>
      )}
      {state.phase === "ai" && <button className="mp-btn alt" onClick={() => dispatch({ type: "ai" } as MonopolyAction)}>CPU Turn</button>}
      {state.phase === "done" && <div className="mp-done">{state.message} — Score: {score(state)}</div>}
    </div>
  );
}
