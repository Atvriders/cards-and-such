import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BohnanzaState, BohnanzaAction, BohnanzaSettings, BeanKind } from "./state.js";
import {
  BEANS,
  isTerminal,
  coinsForField,
  DECK_CYCLES_TO_END,
} from "./state.js";
import "./Game.css";

function BeanCard({ bean, small }: { bean: BeanKind; small?: boolean }): JSX.Element {
  const info = BEANS[bean];
  return (
    <span
      className={`bz-bean${small ? " bz-bean-sm" : ""}`}
      style={{ background: info.color }}
      title={`${info.name} bean (count in deck: ${info.count})`}
      data-testid={`bz-bean-${bean}`}
    >
      {info.name}
    </span>
  );
}

function FieldView({
  field,
  fieldIdx,
  player,
  onHarvest,
  onPlant,
  canPlant,
}: {
  field: { bean: BeanKind | null; count: number };
  fieldIdx: number;
  player: number;
  onHarvest?: () => void;
  onPlant?: () => void;
  canPlant?: boolean;
}): JSX.Element {
  const info = field.bean ? BEANS[field.bean] : null;
  const coins = field.bean && field.count > 0 ? coinsForField(field.bean, field.count) : 0;
  const bg = info ? info.color : "#3a3a3a";
  return (
    <div className="bz-field" style={{ background: bg }} data-testid={`bz-field-p${player}-${fieldIdx}`}>
      <div className="bz-field-header">
        <span className="bz-field-name">{info ? info.name : "Empty field"}</span>
        <span className="bz-field-count">{field.bean ? `${field.count} | ${coins}c` : "-"}</span>
      </div>
      <div className="bz-field-actions">
        {onPlant && canPlant && (
          <button
            type="button"
            className="bz-mini-btn"
            onClick={onPlant}
            title="Plant the pending bean into this field"
          >
            Plant here
          </button>
        )}
        {player === 0 && onHarvest && field.bean !== null && (
          <button
            type="button"
            className="bz-mini-btn"
            onClick={onHarvest}
            title="Harvest this field to convert it into coins"
          >
            Harvest
          </button>
        )}
      </div>
    </div>
  );
}

export function BohnanzaFullGame(props: GameProps<BohnanzaState, BohnanzaSettings>): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-step CPU
  useEffect(() => {
    if (state.phase === "cpuTurn") {
      const id = setTimeout(() => {
        dispatch({ type: "cpuStep" } as BohnanzaAction);
      }, 450);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, state.current, dispatch]);

  const me = state.players[0]!;
  const terminal = isTerminal(state);

  const canChooseField = state.pendingPlant !== null && state.current === 0;
  const isHumanTurn = state.current === 0 && state.phase !== "cpuTurn" && state.phase !== "done";

  const onPlantFirst = (): void => dispatch({ type: "plantFirst" } as BohnanzaAction);
  const onSkipSecond = (): void => dispatch({ type: "skipSecondPlant" } as BohnanzaAction);
  const onPlantInto = (fieldIndex: number): void =>
    dispatch({ type: "plantInto", fieldIndex } as BohnanzaAction);
  const onPlantRevealedInto = (fieldIndex: number): void =>
    dispatch({ type: "plantRevealedInto", fieldIndex } as BohnanzaAction);
  const onSkipRevealed = (): void => dispatch({ type: "skipRevealedPlant" } as BohnanzaAction);
  const onEndTurn = (): void => dispatch({ type: "endTurn" } as BohnanzaAction);
  const onHarvest = (fieldIndex: number): void =>
    dispatch({ type: "harvestField", fieldIndex } as BohnanzaAction);

  return (
    <div className="bz-wrap fade-in" data-testid="bohnanza-full-root">
      <header className="bz-header">
        <div className="bz-title">Bohnanza</div>
        <div className="bz-stats">
          <span className="pulse" data-testid="bz-coins">Coins: {me.coins}</span>
          <span>Deck: {state.deck.length}</span>
          <span>Cycle: {state.deckCyclesUsed + 1}/{DECK_CYCLES_TO_END}</span>
          <span>Turn: P{state.current + 1}</span>
        </div>
      </header>

      <div className="bz-message" data-testid="bz-message">{state.message}</div>

      <section className="bz-cpu-row">
        {state.players.slice(1).map((p, idx) => {
          const realIdx = idx + 1;
          return (
            <div className="bz-cpu" key={realIdx} data-testid={`bz-cpu-${realIdx}`}>
              <div className="bz-cpu-head">P{realIdx + 1} (CPU) - {p.coins}c - {p.hand.length} cards</div>
              <div className="bz-fields-row">
                {p.fields.map((f, fi) => (
                  <FieldView key={fi} field={f} fieldIdx={fi} player={realIdx} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="bz-me-row">
        <div className="bz-me-head">Your fields</div>
        <div className="bz-fields-row">
          {me.fields.map((f, fi) => (
            <FieldView
              key={fi}
              field={f}
              fieldIdx={fi}
              player={0}
              {...(isHumanTurn ? { onHarvest: () => onHarvest(fi) } : {})}
              {...(state.phase === "plantRevealed"
                ? { onPlant: () => onPlantRevealedInto(fi), canPlant: true }
                : canChooseField
                ? { onPlant: () => onPlantInto(fi), canPlant: true }
                : {})}
            />
          ))}
        </div>
      </section>

      <section className="bz-hand">
        <div className="bz-hand-head">Hand ({me.hand.length}) - leftmost plants first</div>
        <div className="bz-hand-cards" data-testid="bz-hand">
          {me.hand.map((b, i) => (
            <div key={i} className={`bz-hand-card ${i === 0 ? "bz-hand-front" : ""}`}>
              <BeanCard bean={b} />
            </div>
          ))}
          {me.hand.length === 0 && <span className="bz-empty">(empty)</span>}
        </div>
      </section>

      {state.revealed.length > 0 && (
        <section className="bz-revealed">
          <div className="bz-revealed-head">Revealed for trade / planting</div>
          <div className="bz-revealed-cards">
            {state.revealed.map((b, i) => (
              <div key={i} className={`bz-hand-card ${i === 0 ? "bz-hand-front" : ""}`}>
                <BeanCard bean={b} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bz-actions">
        {state.phase === "plantFirst" && state.pendingPlant === null && (
          <button
            type="button"
            data-testid="hint-target-bohnanza-full-primary"
            onClick={onPlantFirst}
            title="Plant the front card of your hand"
          >
            Plant first card
          </button>
        )}
        {state.phase === "plantSecondOptional" && state.pendingPlant === null && (
          <>
            <button
              type="button"
              data-testid="hint-target-bohnanza-full-primary"
              onClick={onPlantFirst}
              title="Plant the next card from your hand"
            >
              Plant next card
            </button>
            <button type="button" onClick={onSkipSecond} title="Skip the optional second plant and reveal trade cards">
              Skip and reveal
            </button>
          </>
        )}
        {state.phase === "tradePhase" && (
          <button
            type="button"
            data-testid="hint-target-bohnanza-full-primary"
            onClick={onEndTurn}
            title="Accept and proceed to plant revealed cards (no trades made)"
          >
            Accept revealed
          </button>
        )}
        {state.phase === "plantRevealed" && state.revealed.length > 0 && (
          <button
            type="button"
            data-testid="hint-target-bohnanza-full-primary"
            onClick={onSkipRevealed}
            title="Discard the next revealed card instead of planting it"
          >
            Discard revealed
          </button>
        )}
        {state.phase === "drawEnd" && (
          <button
            type="button"
            data-testid="hint-target-bohnanza-full-primary"
            onClick={onEndTurn}
            title="Draw 3 cards and end your turn"
          >
            End turn (draw 3)
          </button>
        )}
        {state.phase === "cpuTurn" && (
          <button type="button" disabled title="A CPU is taking its turn">CPU thinking...</button>
        )}
      </section>

      {terminal && (
        <div className="bz-done bounce-in" data-testid="bz-done">
          <h3>Game over</h3>
          <ul>
            {state.players.map((p, i) => (
              <li key={i}>
                P{i + 1}{i === 0 ? " (You)" : ""}: {p.coins} coins
              </li>
            ))}
          </ul>
          <div>Final score: {terminal.score}</div>
        </div>
      )}

      <details className="bz-log">
        <summary>Recent events</summary>
        <ul>
          {state.log.slice(-12).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
