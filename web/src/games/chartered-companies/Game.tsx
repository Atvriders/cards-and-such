import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CharteredCompaniesState, CharteredCompaniesAction, CharteredCompaniesSettings } from "./state.js";
import { isTerminal, score, TOTAL_TURNS, ASSET_COST, HIRE_COST } from "./state.js";
import "./Game.css";

export function CharteredCompaniesGame({ state, dispatch, onGameOver }: GameProps<CharteredCompaniesState, CharteredCompaniesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="bz-cc-wrap">
      <h3 className="bz-cc-title">Chartered Companies</h3>
      <div className="bz-cc-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Cash <b>${state.cash}</b></div>
        <div>Charters <b>{state.assets}</b></div>
        <div>Director <b>{state.workers}</b></div>
      </div>
      {state.phase === "choosing" && (
        <div className="bz-cc-actions">
          <button onClick={() => dispatch({ type: "invest" } as CharteredCompaniesAction)}>Invest (${ASSET_COST})</button>
          <button onClick={() => dispatch({ type: "save" } as CharteredCompaniesAction)}>Save (5%)</button>
          <button onClick={() => dispatch({ type: "hire" } as CharteredCompaniesAction)}>Hire (${HIRE_COST})</button>
          <button onClick={() => dispatch({ type: "trade" } as CharteredCompaniesAction)}>Trade Charters</button>
        </div>
      )}
      {state.phase === "resolved" && (
        <div className="bz-cc-event">
          <div>{state.lastEvent}</div>
          <button onClick={() => dispatch({ type: "next" } as CharteredCompaniesAction)}>Next Turn</button>
        </div>
      )}
      {state.phase === "done" && (
        <div className="bz-cc-done">
          <h3>Final Net Worth: ${score(state)}</h3>
        </div>
      )}
    </div>
  );
}
