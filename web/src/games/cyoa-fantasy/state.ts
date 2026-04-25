import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CyoaNode {
  id: string;
  title: string;
  text: string;
  choices: { label: string; next: string; scoreAdd?: number }[];
  score?: number;
}

const NODES: Record<string, CyoaNode> = {
  start: {
    id: "start", title: "The Prophecy",
    text: "A prophecy foretells that a hero will rise to claim the Sunstone and end the Shadow King's reign. You are summoned to the royal court. The queen asks: will you accept the quest?",
    choices: [
      { label: "Accept the quest with honor", next: "accept" },
      { label: "Ask for a reward first", next: "bargain" },
      { label: "Refuse — this isn't your fight", next: "refuse" },
    ],
  },
  accept: {
    id: "accept", title: "The Hero's Call",
    text: "You accept with honor. The queen gifts you a magical compass and sends you north to the Shattered Peaks. At the base, you meet a grizzled ranger who offers to guide you — for a price.",
    choices: [
      { label: "Hire the ranger", next: "with_ranger" },
      { label: "Travel alone", next: "alone_peaks" },
    ],
  },
  bargain: {
    id: "bargain", title: "The Deal",
    text: "The queen agrees — 100 gold on return. Armed with a map and modest supplies, you set out. You reach a crossroads: a mountain pass or a lowland road through goblin territory.",
    choices: [
      { label: "Take the mountain pass", next: "mountain_pass" },
      { label: "Risk the lowland road", next: "goblin_road" },
    ],
  },
  refuse: {
    id: "refuse", title: "The Coward's Path",
    text: "You refuse. But as you leave town, the Shadow King's agents attack. Forced to fight, you defeat them and find a map to the Sunstone among their belongings.",
    choices: [
      { label: "Follow the map anyway", next: "mountain_pass" },
    ],
  },
  with_ranger: {
    id: "with_ranger", title: "Into the Peaks",
    text: "The ranger Mira knows every secret path. She leads you to the Shadow King's fortress through hidden tunnels, avoiding patrols. You arrive at the inner sanctum.",
    choices: [
      { label: "Rush the Shadow King directly", next: "final_fight" },
      { label: "Search for the Sunstone first", next: "sunstone_search" },
    ],
  },
  alone_peaks: {
    id: "alone_peaks", title: "The Lonely Road",
    text: "Alone in the peaks, you find an ancient temple. A ghost warrior offers to train you in exchange for your compass.",
    choices: [
      { label: "Trade the compass for training", next: "ghost_trained" },
      { label: "Keep the compass and press on", next: "mountain_pass" },
    ],
  },
  ghost_trained: {
    id: "ghost_trained", title: "Warrior's Legacy",
    text: "The ghost teaches you three ancient techniques. You feel unstoppable. You navigate the peaks by starlight and reach the fortress.",
    choices: [
      { label: "Challenge the Shadow King", next: "final_fight" },
    ],
  },
  mountain_pass: {
    id: "mountain_pass", title: "The High Road",
    text: "A blizzard traps you in a mountain cave with a wounded gryphon. You tend its wounds over two days.",
    choices: [
      { label: "The gryphon carries you to the fortress", next: "gryphon_flight", scoreAdd: 10 },
    ],
  },
  gryphon_flight: {
    id: "gryphon_flight", title: "Wings of Dawn",
    text: "The gryphon drops you at the fortress gates. Guards scatter at the sight of the beast. You stride inside.",
    choices: [
      { label: "Head for the throne room", next: "final_fight" },
      { label: "Look for the Sunstone in the vaults", next: "sunstone_search" },
    ],
  },
  goblin_road: {
    id: "goblin_road", title: "Goblin Territory",
    text: "You bribe the goblin chief with your rations. He gives you a goblin war band as escort — and a shortcut through the Shadow King's mines.",
    choices: [
      { label: "Use the mine shortcut", next: "mines" },
    ],
  },
  mines: {
    id: "mines", title: "The Shadow Mines",
    text: "In the mines you find enslaved villagers. You free them, gaining fierce allies. Together you storm the fortress.",
    choices: [
      { label: "Lead the charge to the throne room", next: "final_fight" },
      { label: "Send allies ahead while you find the Sunstone", next: "sunstone_search" },
    ],
  },
  sunstone_search: {
    id: "sunstone_search", title: "The Vault",
    text: "You find the vault guarded by an enchanted golem. It poses a riddle: 'I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I?'",
    choices: [
      { label: "An echo", next: "sunstone_claimed", scoreAdd: 15 },
      { label: "A ghost", next: "golem_fight" },
    ],
  },
  sunstone_claimed: {
    id: "sunstone_claimed", title: "Sunstone in Hand",
    text: "Correct! The golem bows aside. The Sunstone blazes in your hands. You stride to the throne room empowered.",
    choices: [
      { label: "Face the Shadow King", next: "victory" },
    ],
  },
  golem_fight: {
    id: "golem_fight", title: "Iron Fists",
    text: "Wrong answer — the golem attacks! A brutal fight leaves you battered but victorious. You claim the Sunstone.",
    choices: [
      { label: "Face the Shadow King", next: "victory" },
    ],
  },
  final_fight: {
    id: "final_fight", title: "The Shadow King",
    text: "The Shadow King is powerful but not invincible. Without the Sunstone you fight with all your skill. After a fierce battle, you land the killing blow.",
    choices: [],
    score: 70,
  },
  victory: {
    id: "victory", title: "Light Restored",
    text: "You hold the Sunstone aloft. Its light shatters the Shadow King's armor. He dissolves into darkness. The realm is free. Songs will be sung of this day forever.",
    choices: [],
    score: 100,
  },
};

export interface CyoaFantasyState {
  nodeId: string;
  scoreBonus: number;
  steps: number;
  phase: "playing" | "done";
}

export type CyoaFantasyAction = { type: "choose"; nextId: string; scoreAdd: number };

export function initialState(_seed: number): CyoaFantasyState {
  return { nodeId: "start", scoreBonus: 0, steps: 0, phase: "playing" };
}

export function getNode(id: string): CyoaNode {
  return NODES[id] ?? NODES["start"]!;
}

export function reducer(state: CyoaFantasyState, action: CyoaFantasyAction): CyoaFantasyState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "choose": {
      const node = getNode(action.nextId);
      const done = node.choices.length === 0;
      return {
        ...state,
        nodeId: action.nextId,
        scoreBonus: state.scoreBonus + (action.scoreAdd || 0),
        steps: state.steps + 1,
        phase: done ? "done" : "playing",
      };
    }
  }
}

export function isTerminal(state: CyoaFantasyState): { score: number } | null {
  if (state.phase !== "done") return null;
  const node = getNode(state.nodeId);
  return { score: Math.min(100, (node.score ?? 0) + state.scoreBonus) };
}

// keep mulberry32 reference to avoid unused import warning
void mulberry32;
