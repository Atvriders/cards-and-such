import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DurakPodkSettings { questions: "10"; }
export interface DurakPodkState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DurakPodkAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Durak is the most popular card game of?', choices: ['Russia and former Soviet states', 'Mongolia', 'Sweden', 'Brazil'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Durak' literally means?", choices: ["'Fool'", "'King'", "'Trick'", "'Race'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'The goal of Durak is to?', choices: ['NOT be the last player with cards', 'Score 100 points', 'Take the most tricks', 'Capture all pieces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Durak uses a deck of?', choices: ['36 cards (6 through Ace)', '52 cards', '32 cards', '78 Tarot cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Trump suit in Durak is determined by?', choices: ['An upturned card from the bottom of the deck', 'Player choice', 'Bidding', 'Random shuffle'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Podkidnoy' means?", choices: ["'Thrown-in' (referring to attackers piling on)", "'Trump'", "'Fool'", "'Champion'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Maximum attacks per round in Podkidnoy is?', choices: ["Six (matching the defender's hand size limit)", 'Three', 'One', 'Twelve'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If the defender beats all attacks?', choices: ['The cards are discarded; play passes on', 'The attacker scores 100', 'Round ends with a tie', 'Defender becomes durak'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If the defender cannot beat all attacks?', choices: ['They take the cards into their hand', 'They become trump', 'They auto-win', 'Game ends'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Durak is best classified as?', choices: ['A trick-attack/defense card game', 'A solitaire', 'A trick-taking-only game', 'A bidding game'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DurakPodkSettings): DurakPodkState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DurakPodkState, action: DurakPodkAction): DurakPodkState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DurakPodkState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
