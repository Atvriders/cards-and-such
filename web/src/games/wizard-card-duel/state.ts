import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WizardCardDuelSettings {
  handSize: "4" | "5" | "6";
}

export type SpellType = "fire" | "ice" | "lightning" | "shield" | "drain";

export interface SpellCard {
  id: number;
  name: string;
  type: SpellType;
  power: number;
}

export interface WizardCardDuelState {
  settings: WizardCardDuelSettings;
  rngSeed: number;
  playerHp: number;
  opponentHp: number;
  playerHand: SpellCard[];
  opponentHand: SpellCard[];
  deck: SpellCard[];
  selectedIdx: number | null;
  lastPlayerCard: SpellCard | null;
  lastOpponentCard: SpellCard | null;
  log: string[];
  round: number;
  gameOver: boolean;
  playerWon: boolean;
  playerShield: boolean;
  opponentShield: boolean;
}

export type WizardCardDuelAction =
  | { type: "select"; idx: number }
  | { type: "play" }
  | { type: "restart" };

const SPELL_TEMPLATES: { name: string; type: SpellType; power: number }[] = [
  { name: "Fireball", type: "fire", power: 8 },
  { name: "Inferno", type: "fire", power: 12 },
  { name: "Blizzard", type: "ice", power: 7 },
  { name: "Frostbite", type: "ice", power: 5 },
  { name: "Thunder", type: "lightning", power: 10 },
  { name: "Bolt", type: "lightning", power: 6 },
  { name: "Shield Wall", type: "shield", power: 0 },
  { name: "Mirror", type: "shield", power: 0 },
  { name: "Soul Drain", type: "drain", power: 6 },
  { name: "Life Tap", type: "drain", power: 4 },
];

function buildDeck(seed: number): SpellCard[] {
  const rng = mulberry32(seed);
  const cards: SpellCard[] = [];
  for (let i = 0; i < 20; i++) {
    const template = SPELL_TEMPLATES[Math.floor(rng() * SPELL_TEMPLATES.length)]!;
    cards.push({ id: i, ...template });
  }
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function dealHand(deck: SpellCard[], size: number): { hand: SpellCard[]; remaining: SpellCard[] } {
  return { hand: deck.slice(0, size), remaining: deck.slice(size) };
}

export function initialState(seed: number, settings: WizardCardDuelSettings): WizardCardDuelState {
  const handSize = parseInt(settings.handSize, 10);
  const deck = buildDeck(seed);
  const { hand: playerHand, remaining: r1 } = dealHand(deck, handSize);
  const { hand: opponentHand, remaining: deck2 } = dealHand(r1, handSize);
  return {
    settings,
    rngSeed: seed,
    playerHp: 30,
    opponentHp: 30,
    playerHand,
    opponentHand,
    deck: deck2,
    selectedIdx: null,
    lastPlayerCard: null,
    lastOpponentCard: null,
    log: ["The duel begins! Choose a spell."],
    round: 1,
    gameOver: false,
    playerWon: false,
    playerShield: false,
    opponentShield: false,
  };
}

function typeAdvantage(attacker: SpellType, defender: SpellType): number {
  // fire beats ice, ice beats lightning, lightning beats fire; shield and drain are neutral
  if (attacker === "fire" && defender === "ice") return 4;
  if (attacker === "ice" && defender === "lightning") return 4;
  if (attacker === "lightning" && defender === "fire") return 4;
  return 0;
}

export function reducer(state: WizardCardDuelState, action: WizardCardDuelAction): WizardCardDuelState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "select") {
    if (action.idx < 0 || action.idx >= state.playerHand.length) return state;
    return { ...state, selectedIdx: action.idx };
  }

  if (action.type === "play") {
    if (state.selectedIdx === null) return state;
    const playerCard = state.playerHand[state.selectedIdx];
    if (!playerCard) return state;

    const rng = mulberry32(state.rngSeed + state.round * 17);
    const oppIdx = Math.floor(rng() * state.opponentHand.length);
    const oppCard = state.opponentHand[oppIdx] ?? state.opponentHand[0];
    if (!oppCard) return state;

    let playerHp = state.playerHp;
    let opponentHp = state.opponentHp;
    let playerShield = false;
    let opponentShield = state.opponentShield;
    let logEntry = `Round ${state.round}: You played ${playerCard.name} vs ${oppCard.name}. `;

    // Opponent shield
    if (oppCard.type === "shield") {
      opponentShield = true;
      logEntry += `${oppCard.name} shields opponent. `;
    }

    // Player shield
    if (playerCard.type === "shield") {
      playerShield = true;
      logEntry += `${playerCard.name} shields you. `;
    }

    // Player attack
    if (playerCard.type !== "shield") {
      const bonus = typeAdvantage(playerCard.type, oppCard.type);
      let dmg = playerCard.power + bonus;
      if (playerCard.type === "drain") {
        playerHp = Math.min(30, playerHp + Math.floor(dmg / 2));
      }
      if (opponentShield && playerCard.type !== "drain") {
        logEntry += `Blocked by opponent shield! `;
        opponentShield = false;
        dmg = 0;
      }
      opponentHp -= dmg;
      if (dmg > 0) logEntry += `Dealt ${dmg} dmg to opponent. `;
    }

    // Opponent attack
    if (oppCard.type !== "shield") {
      const bonus = typeAdvantage(oppCard.type, playerCard.type);
      let dmg = oppCard.power + bonus;
      if (oppCard.type === "drain") {
        opponentHp = Math.min(30, opponentHp + Math.floor(dmg / 2));
      }
      if (playerShield && oppCard.type !== "drain") {
        logEntry += `Your shield blocked opponent! `;
        dmg = 0;
      }
      playerHp -= dmg;
      if (dmg > 0) logEntry += `Opponent dealt ${dmg} dmg to you. `;
    }

    // Draw new cards
    const handSize = parseInt(state.settings.handSize, 10);
    let deck = [...state.deck];
    let playerHand = state.playerHand.filter((_, i) => i !== state.selectedIdx);
    let opponentHand = state.opponentHand.filter((_, i) => i !== oppIdx);

    if (deck.length > 0 && playerHand.length < handSize) {
      playerHand = [...playerHand, deck[0]!];
      deck = deck.slice(1);
    }
    if (deck.length > 0 && opponentHand.length < handSize) {
      opponentHand = [...opponentHand, deck[0]!];
      deck = deck.slice(1);
    }

    playerHp = Math.max(0, playerHp);
    opponentHp = Math.max(0, opponentHp);

    const gameOver = playerHp <= 0 || opponentHp <= 0 || (playerHand.length === 0 && opponentHand.length === 0);
    const playerWon = opponentHp <= 0 || (gameOver && playerHp > opponentHp);

    return {
      ...state,
      playerHp,
      opponentHp,
      playerHand,
      opponentHand,
      deck,
      selectedIdx: null,
      lastPlayerCard: playerCard,
      lastOpponentCard: oppCard,
      log: [...state.log, logEntry].slice(-6),
      round: state.round + 1,
      gameOver,
      playerWon,
      playerShield,
      opponentShield,
    };
  }

  return state;
}

export function isTerminal(state: WizardCardDuelState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.playerWon) return { score: Math.min(100, 50 + state.playerHp) };
  return { score: Math.max(0, state.playerHp * 2) };
}
