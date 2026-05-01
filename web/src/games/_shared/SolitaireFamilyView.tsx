/**
 * Reusable React view for the Klondike/Yukon family games defined by
 * `solitaire-family-engine.ts`.  A per-game wrapper picks the layout, CSS
 * prefix and handful of buttons; everything else (drag/drop, click-auto-move,
 * score readout, foundation helper) is provided here.
 */
import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import type {
  KlondikeFamilyAction,
  KlondikeFamilyConfig,
  KlondikeFamilyState,
} from "./solitaire-family-engine.js";
import type { Ruleset } from "../../engines/tableau/types.js";

interface Props extends GameProps<KlondikeFamilyState, unknown> {
  cfg: KlondikeFamilyConfig;
  ruleset: Ruleset;
  prefix: string;          // CSS class prefix unique per game
}

export function SolitaireFamilyView({
  state,
  dispatch,
  onGameOver,
  cfg,
  ruleset,
  prefix,
}: Props): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KlondikeFamilyAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUp =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUp) return;
      const target = findAutoMove(state.piles, pileId, count, ruleset);
      if (target) {
        dispatch({
          type: "move",
          fromPile: pileId,
          toPile: target,
          count,
        } as KlondikeFamilyAction);
      }
    },
    [state.piles, dispatch, ruleset],
  );

  const handleStockClick = useCallback(() => {
    if (!cfg.hasStock) return;
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as KlondikeFamilyAction);
    } else {
      dispatch({ type: "draw" } as KlondikeFamilyAction);
    }
  }, [state.piles, dispatch, cfg.hasStock]);

  if (state.won) onGameOver(state.score);

  const get = (id: string) => state.piles.find((p) => p.id === id);
  const tableauIds = Array.from({ length: cfg.numTableau }, (_, i) => `t${i + 1}`);
  const foundationIds = Array.from(
    { length: cfg.numFoundations },
    (_, i) => `f${i + 1}`,
  );

  return (
    <div className={`${prefix}-root${state.won ? " has-won" : ""}`}>
      <div className={`${prefix}-info`}>
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        {cfg.redealsAllowed >= 0 && (
          <span>Redeals: {state.redealsRemaining}</span>
        )}
        <button
          className={`${prefix}-auto`}
          type="button"
          onClick={() =>
            dispatch({ type: "auto-move-to-foundation" } as KlondikeFamilyAction)
          }
        >
          Auto-move
        </button>
      </div>

      <div className={`${prefix}-top`}>
        {cfg.hasStock && (
          <div className={`${prefix}-stock`} onClick={handleStockClick}>
            <Pile
              pile={get("stock")!}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        )}
        {cfg.hasWaste && (
          <div className={`${prefix}-waste`}>
            <Pile
              pile={get("waste")!}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        )}
        <div className={`${prefix}-spacer`} />
        {foundationIds.map((id) => (
          <div key={id} className={`${prefix}-foundation`}>
            <Pile
              pile={get(id)!}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className={`${prefix}-tableau`}>
        {tableauIds.map((id) => (
          <div key={id} className={`${prefix}-col`}>
            <Pile
              pile={get(id)!}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
