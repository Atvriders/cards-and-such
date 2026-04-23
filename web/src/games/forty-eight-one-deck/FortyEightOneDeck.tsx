import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortyEightOneDeckState, FortyEightOneDeckAction, FortyEightOneDeckSettings } from "./state.js";
import { Card as CardComponent } from "../../engines/deck/Card.js";
import "./FortyEightOneDeck.css";

const TABLEAU_IDS = ["t1", "t2", "t3", "t4"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"];

export function FortyEightOneDeck({ state, dispatch, onGameOver }: GameProps<FortyEightOneDeckState, FortyEightOneDeckSettings>): JSX.Element {
  if (state.won) onGameOver(state.score);
  const [selected, setSelected] = useState<string | null>(null);

  const send = (action: FortyEightOneDeckAction) => dispatch(action);

  const handlePileClick = (pileId: string) => {
    if (!selected) {
      setSelected(pileId);
      return;
    }
    if (selected === pileId) { setSelected(null); return; }
    // Attempt move from selected → this pile
    send({ type: "move", fromPile: selected, toPile: pileId, count: 1 } as FortyEightOneDeckAction);
    setSelected(null);
  };

  const pile = (id: string) => state.piles.find((p) => p.id === id);

  return (
    <div className="fe1d">
      <div className="fe1d-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="fe1d-top">
        <div className="fe1d-area">
          <span>Stock ({pile("stock")?.cards.length ?? 0})</span>
          {(pile("stock")?.cards.length ?? 0) > 0 ? (
            <CardComponent faceDown onClick={() => send({ type: "draw" })} />
          ) : (
            <div className="fe1d-placeholder">Empty</div>
          )}
          <button className="fe1d-btn" onClick={() => send({ type: "draw" })} disabled={(pile("stock")?.cards.length ?? 0) === 0}>Draw</button>
        </div>
        <div className="fe1d-area">
          <span>Waste</span>
          {(() => { const w = pile("waste"); const top = w?.cards[w.cards.length - 1]; return top ? <CardComponent card={top} onClick={() => handlePileClick("waste")} className={selected === "waste" ? "selected" : ""} /> : <div className="fe1d-placeholder">Empty</div>; })()}
        </div>
        <div>
          <div className="fe1d-area" style={{ marginBottom: 4 }}>Foundations</div>
          <div className="fe1d-freecells">
            {FOUNDATION_IDS.map((fid) => {
              const p = pile(fid);
              const top = p?.cards[p.cards.length - 1];
              return (
                <div key={fid} className="fe1d-area" onClick={() => handlePileClick(fid)}>
                  {top ? <CardComponent card={top} className={selected === fid ? "selected" : ""} /> : <div className="fe1d-placeholder">A</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="fe1d-area" style={{ marginBottom: 4 }}>Free Cells</div>
          <div className="fe1d-freecells">
            {FREECELL_IDS.map((fcid) => {
              const p = pile(fcid);
              const top = p?.cards[p.cards.length - 1];
              return (
                <div key={fcid} className="fe1d-area" onClick={() => handlePileClick(fcid)}>
                  {top ? <CardComponent card={top} className={selected === fcid ? "selected" : ""} /> : <div className="fe1d-placeholder">FC</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fe1d-area" style={{ alignItems: "flex-start" }}>Tableau</div>
      <div className="fe1d-tableau">
        {TABLEAU_IDS.map((tid) => {
          const p = pile(tid);
          const cards = p?.cards ?? [];
          return (
            <div key={tid} className="fe1d-col" onClick={() => handlePileClick(tid)}>
              {cards.length === 0 ? <div className="fe1d-placeholder">Empty</div> : cards.map((card) => (
                <CardComponent key={card.id} card={card} className={selected === tid ? "selected" : ""} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
