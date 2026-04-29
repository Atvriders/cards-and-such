import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GhostWordSpellSettings { questions: "10"; }
export interface GhostWordSpellState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GhostWordSpellAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'In Ghost players take turns?', choices: ['Adding a letter to an evolving sequence', 'Drawing cards', 'Rolling dice', 'Bidding for trump'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players want to avoid?', choices: ['Completing a real word', 'Reaching 100 points', 'Knocking', 'Capturing pieces'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Completing a word earns the player?', choices: ["A letter of the word 'GHOST'", '100 points', 'A free turn', 'A trump card'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "How many letters in 'GHOST' before being eliminated?", choices: ['Five (G, H, O, S, T)', 'Three', 'Seven', 'One'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players may also?', choices: ['Challenge an opponent to name a word starting with the prefix', 'Auction the next letter', 'Discard their letters', 'Trade letters'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Successful challenge by the challenger earns?', choices: ['The opponent a letter', 'Both players a letter', 'Nothing', '100 points'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ghost is best classified as?', choices: ['A spelling/word-building game', 'A solitaire', 'A dice game', 'A trick-taking game'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each letter added must result in a sequence?', choices: ['That is a valid prefix of at least one word', 'A complete word always', 'A random string always', 'Any letters allowed'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Variants of Ghost include?', choices: ['Superghost (allowing additions to either end)', "Hold'em-em poker", 'Bridge tournament', 'Solitaire challenge'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Ghost is best for?', choices: ['Word lovers and pencil-paper or oral play', 'Casino gambling', 'Solo strategy', 'Heavy strategic dice'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GhostWordSpellSettings): GhostWordSpellState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GhostWordSpellState, action: GhostWordSpellAction): GhostWordSpellState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GhostWordSpellState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
