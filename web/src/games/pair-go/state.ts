import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PairGoSettings { questions: "10"; }
export interface PairGoState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PairGoAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pair Go is played by", choices: ["Two teams of two players each", "One player only", "Three players", "Five players"], correct: 0 },
  { question: "Each team consists of", choices: ["One man and one woman alternating moves", "Two players of same gender", "One player", "A team captain only"], correct: 0 },
  { question: "Players within a team", choices: ["Cannot consult each other during play", "Always discuss aloud", "Play simultaneously", "Trade stones"], correct: 0 },
  { question: "Move order is", choices: ["Strictly alternating: B-man, W-man, B-woman, W-woman", "Random", "Fastest first", "Each player plays 5 in a row"], correct: 0 },
  { question: "Pair Go is popular as", choices: ["A team event in international championships", "A solo puzzle", "A bullet variant", "A children's-only game"], correct: 0 },
  { question: "Captures and rules follow", choices: ["Standard Go", "No captures", "Drops allowed", "Promotion required"], correct: 0 },
  { question: "A key skill is", choices: ["Coordinating with your partner without speaking", "Memorizing opening trees alone", "Shouting moves", "Playing recklessly"], correct: 0 },
  { question: "Pair Go championships exist in", choices: ["Japan, Korea, China, and Europe", "Only the USA", "Nowhere", "Olympic Games only"], correct: 0 },
  { question: "The score is", choices: ["Calculated as for standard Go", "Doubled per team", "Halved", "Replaced by handicap"], correct: 0 },
  { question: "Pair Go encourages", choices: ["Reading your partner's intent through stone placement", "Long monologues", "Random moves", "Avoiding captures"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PairGoSettings): PairGoState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PairGoState, action: PairGoAction): PairGoState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PairGoState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
