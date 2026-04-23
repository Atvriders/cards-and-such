import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeSuperSolverState, KlondikeSuperSolverAction, KlondikeSuperSolverSettings } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./KlondikeSuperSolver.css";

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];

export function KlondikeSuperSolver({ state, dispatch, onGameOver }: GameProps<KlondikeSuperSolverState, KlondikeSuperSolverSettings>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const send = useCallback((action: KlondikeSuperSolverAction) => dispatch(action), [dispatch]);

  const waste = state.piles.find((p) => p.id === "waste");
  const stock = state.piles.find((p) => p.id === "stock");
  const wasteTop = waste ? waste.cards[waste.cards.length - 1] : undefined;

  return (
    <div className="kss">
      <div className="kss-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Redeals: {state.redealsUsed}</span>
      </div>
      {state.hint && <div className="kss-hint">Hint: {state.hint}</div>}
      <div className="kss-btns">
        <button className="kss-btn" onClick={() => send({ type: "draw" })} disabled={!stock || stock.cards.length === 0}>Draw</button>
        <button className="kss-btn" onClick={() => send({ type: "redeal" })} disabled={!stock || stock.cards.length > 0 || !waste || waste.cards.length === 0}>Redeal</button>
        <button className="kss-btn" onClick={() => send({ type: "auto-move-to-foundation" })}>Auto→Found</button>
        <button className="kss-btn" onClick={() => send({ type: "hint" })}>Hint</button>
      </div>
      <div className="kss-top">
        <div className="kss-area">
          <span>Stock ({stock?.cards.length ?? 0})</span>
          {stock && stock.cards.length > 0 ? <Card faceDown onClick={() => send({ type: "draw" })} /> : <div className="kss-placeholder">Empty</div>}
        </div>
        <div className="kss-area">
          <span>Waste</span>
          {wasteTop ? <Card card={wasteTop} onClick={() => {
            // Try auto-move waste top to foundation
            for (const fid of FOUNDATION_IDS) {
              send({ type: "move", fromPile: "waste", toPile: fid, count: 1 });
            }
          }} /> : <div className="kss-placeholder">Empty</div>}
        </div>
        <div className="kss-foundations">
          {FOUNDATION_IDS.map((fid) => {
            const pile = state.piles.find((p) => p.id === fid);
            const top = pile ? pile.cards[pile.cards.length - 1] : undefined;
            return (
              <div key={fid} className="kss-area">
                <span>{fid}</span>
                {top ? <Card card={top} /> : <div className="kss-placeholder">F</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="kss-tableau">
        {TABLEAU_IDS.map((tid) => {
          const pile = state.piles.find((p) => p.id === tid);
          if (!pile) return null;
          const faceUp = pile.faceUpCount ?? 0;
          const totalCards = pile.cards.length;
          const faceDownCount = totalCards - faceUp;
          return (
            <div key={tid} className="kss-col" onClick={() => {
              if (pile.cards.length === 0) return;
              // Try moving top card to foundation
              for (const fid of FOUNDATION_IDS) {
                send({ type: "move", fromPile: tid, toPile: fid, count: 1 });
              }
              // Try moving to another tableau
              for (const other of TABLEAU_IDS) {
                if (other !== tid) send({ type: "move", fromPile: tid, toPile: other, count: 1 });
              }
            }}>
              {pile.cards.length === 0 && <div className="kss-placeholder">K</div>}
              {pile.cards.map((card, i) => {
                const isFaceUp = i >= faceDownCount;
                return isFaceUp
                  ? <Card key={card.id} card={card} />
                  : <Card key={card.id} faceDown />;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
