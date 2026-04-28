import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface UtaGarutaSettings { questions: "10"; }
export interface UtaGarutaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UtaGarutaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The 'Uta' in Uta Garuta refers to?", choices: ["Songs/poems", "Numbers", "Animals", "Battles"], correct: 0 },
  { question: "Uta Garuta is a category that includes?", choices: ["Hanafuda", "Hwatu", "Hyakunin Isshu", "Mahjong"], correct: 2 },
  { question: "Uta Garuta is primarily a?", choices: ["Trick-taking game", "Reading-and-grabbing game", "Bidding game", "Solitaire"], correct: 1 },
  { question: "The reader announces each poem in?", choices: ["English", "Modern Japanese", "Classical Japanese", "Korean"], correct: 2 },
  { question: "Uta Garuta most resembles which Western party game?", choices: ["Pictionary", "Bingo", "Speed/snap match", "Charades"], correct: 2 },
  { question: "Players grab cards bearing?", choices: ["Player names", "The latter half of the poem", "Random images", "Numbers"], correct: 1 },
  { question: "Players who grab the wrong card?", choices: ["Score double", "Get a 'foul' and lose a card", "Skip turn", "Read next"], correct: 1 },
  { question: "A fast 'one-syllable' (Ichiji-kimari) card is one decided by?", choices: ["Last word", "First syllable only", "Suit", "Color"], correct: 1 },
  { question: "Uta Garuta is most commonly held during?", choices: ["New Year", "Tanabata", "Obon", "Setsubun"], correct: 0 },
  { question: "Uta Garuta sets typically include how many cards?", choices: ["50", "75", "100", "200"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: UtaGarutaSettings): UtaGarutaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UtaGarutaState, action: UtaGarutaAction): UtaGarutaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UtaGarutaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
