import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PetShopState, PetAction, PetType } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PET_EMOJI: Record<PetType, string> = {
  puppy: "🐶", kitten: "🐱", bunny: "🐰", parrot: "🦜", hamster: "🐹",
};

export function PetShopMini({
  state,
  dispatch,
  onGameOver,
}: GameProps<PetShopState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: PetAction) => dispatch(a);

  return (
    <div className="psm-wrap">
      <div className="psm-header">
        <span className="psm-title">Pet Shop Mini</span>
        <span className="psm-day">Day {state.day}/{state.totalDays}</span>
        <span className="psm-cash">${state.cash}</span>
      </div>

      {state.phase === "plan" && (
        <>
          <div className="psm-pets">
            {state.pets.map(pet => (
              <div key={pet.type} className="psm-pet-row">
                <div className="psm-pet-label">
                  <span>{PET_EMOJI[pet.type]} {pet.name}</span>
                  <span>Stock: {pet.stock} | Price: ${pet.price} | Happy: {pet.happy}%</span>
                </div>
                <div className="psm-pet-controls">
                  <span>Stock:</span>
                  <button className="psm-btn-sm" title="Decrease stock" onClick={() => d({ type: "setStock", petType: pet.type, delta: -1 })}>−</button>
                  <button className="psm-btn-sm" title="Buy one (increase stock)" onClick={() => d({ type: "setStock", petType: pet.type, delta: 1 })}>+ (${pet.cost})</button>
                  <span>Price:</span>
                  <button className="psm-btn-sm" title="Lower price by $5" onClick={() => d({ type: "setPrice", petType: pet.type, delta: -5 })}>−$5</button>
                  <button className="psm-btn-sm" title="Raise price by $5" onClick={() => d({ type: "setPrice", petType: pet.type, delta: 5 })}>+$5</button>
                  <span>Care:</span>
                  <button className="psm-btn-sm" title="Increase happiness (costs $2)" onClick={() => d({ type: "setHappy", petType: pet.type, delta: 10 })}>+10 ($2)</button>
                </div>
              </div>
            ))}
          </div>
          <div className="psm-ad-row">
            <span>Ad Budget: ${state.adBudget}</span>
            <input type="range" min={0} max={50} step={5} value={state.adBudget}
              onChange={e => d({ type: "setAdBudget", value: +e.target.value })} />
          </div>
          <button className="psm-btn" onClick={() => d({ type: "openDay" })}>Open Shop!</button>
        </>
      )}

      {state.phase === "results" && (
        <div className="psm-results">
          {state.pets.map(pet => (
            <div key={pet.type} className="psm-result-row">
              <span>{PET_EMOJI[pet.type]} {pet.name}</span>
              <span>Sold: {state.lastSold[pet.type]} → ${state.lastSold[pet.type] * pet.price}</span>
            </div>
          ))}
          <div className={`psm-profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="psm-btn" onClick={() => d({ type: "nextDay" })}>
            {state.day >= state.totalDays ? "Close Shop" : "Next Day →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="psm-done">
          <div>Final Cash: ${state.cash}</div>
          <div>{state.cash >= 800 ? "Top Pet Shop!" : state.cash >= 400 ? "Good business!" : "Keep trying!"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="psm-log">
          {[...state.log].reverse().slice(0, 5).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
