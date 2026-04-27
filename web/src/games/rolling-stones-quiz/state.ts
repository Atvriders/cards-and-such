import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RollingStonesQuizSettings { questions: "10" | "20" | "30"; }
export interface RollingStonesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RollingStonesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Rolling Stones formed in?", choices: ["1960", "1962", "1964", "1966"], correct: 1 },
  { question: "Founder/frontman?", choices: ["Mick Jagger", "Keith Richards", "Brian Jones", "Bill Wyman"], correct: 0 },
  { question: "Lead guitarist (longtime)?", choices: ["Mick Jagger", "Keith Richards", "Brian Jones", "Charlie Watts"], correct: 1 },
  { question: "Original drummer?", choices: ["Charlie Watts", "Mick Taylor", "Keith Richards", "Bill Wyman"], correct: 0 },
  { question: "Bassist (longtime)?", choices: ["Bill Wyman", "Charlie Watts", "Brian Jones", "Ron Wood"], correct: 0 },
  { question: "Guitarist who joined in 1975?", choices: ["Ron Wood", "Mick Taylor", "Keith Richards", "Brian Jones"], correct: 0 },
  { question: "First number-one US single?", choices: ["(I Can't Get No) Satisfaction", "Honky Tonk Women", "Get Off My Cloud", "Brown Sugar"], correct: 0 },
  { question: "'Satisfaction' year?", choices: ["1963", "1965", "1967", "1969"], correct: 1 },
  { question: "'Sympathy for the Devil' year?", choices: ["1966", "1968", "1970", "1972"], correct: 1 },
  { question: "Most acclaimed album?", choices: ["Exile on Main St.", "Sticky Fingers", "Let It Bleed", "All highly acclaimed"], correct: 3 },
  { question: "'Exile on Main St.' year?", choices: ["1969", "1970", "1972", "1974"], correct: 2 },
  { question: "Tongue-and-lips logo designer?", choices: ["John Pasche", "Andy Warhol", "David Bailey", "Banksy"], correct: 0 },
  { question: "'Brown Sugar' year?", choices: ["1969", "1971", "1973", "1975"], correct: 1 },
  { question: "Stones members who died?", choices: ["Brian Jones, Charlie Watts", "Brian Jones only", "Charlie Watts only", "All deceased"], correct: 0 },
  { question: "Brian Jones died in?", choices: ["1969", "1971", "1973", "1975"], correct: 0 },
  { question: "Charlie Watts died in?", choices: ["2019", "2021", "2023", "2024"], correct: 1 },
  { question: "Stones manager early career?", choices: ["Andrew Loog Oldham", "Brian Epstein", "George Martin", "Allen Klein"], correct: 0 },
  { question: "'Let It Bleed' year?", choices: ["1968", "1969", "1971", "1973"], correct: 1 },
  { question: "Altamont concert tragedy year?", choices: ["1968", "1969", "1971", "1973"], correct: 1 },
  { question: "Mick Jagger knighthood?", choices: ["2003", "2005", "2007", "2009"], correct: 0 },
  { question: "Keith Richards' nickname?", choices: ["Keef", "Riff", "Stones", "Bones"], correct: 0 },
  { question: "Keith's autobiography title?", choices: ["Life", "Stones", "Riff", "Beggars Banquet"], correct: 0 },
  { question: "Their record label launched?", choices: ["Rolling Stones Records", "Apple", "Atlantic", "Polydor"], correct: 0 },
  { question: "'Angie' year?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "Stones residency on '76 Olympic stadium tour?", choices: ["Yes — multiple stadiums", "No", "Just Wembley", "Just Madison Square Garden"], correct: 0 },
  { question: "Album with 'Start Me Up'?", choices: ["Tattoo You", "Some Girls", "Emotional Rescue", "Steel Wheels"], correct: 0 },
  { question: "'Some Girls' year?", choices: ["1976", "1978", "1980", "1982"], correct: 1 },
  { question: "'Hackney Diamonds' year (latest album)?", choices: ["2021", "2022", "2023", "2024"], correct: 2 },
  { question: "Mick Jagger's girlfriend famously in '67?", choices: ["Marianne Faithfull", "Anita Pallenberg", "Bianca Pérez-Mora", "Jerry Hall"], correct: 0 },
  { question: "Mick Jagger's first wife?", choices: ["Bianca Jagger", "Jerry Hall", "Marianne Faithfull", "Anita Pallenberg"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RollingStonesQuizSettings): RollingStonesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RollingStonesQuizState, action: RollingStonesQuizAction): RollingStonesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RollingStonesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
