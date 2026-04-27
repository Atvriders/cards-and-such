import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SodaBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface SodaBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SodaBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Coca-Cola was invented in?", choices: ["1856", "1886", "1906", "1926"], correct: 1 },
  { question: "Coca-Cola was created by?", choices: ["Caleb Bradham", "John Pemberton", "Asa Candler", "Charles Alderton"], correct: 1 },
  { question: "Pepsi was created by?", choices: ["John Pemberton", "Caleb Bradham", "James Vernor", "Edward Welch"], correct: 1 },
  { question: "Dr Pepper was invented in?", choices: ["Atlanta", "Waco", "Chicago", "Boston"], correct: 1 },
  { question: "7-Up originally contained which ingredient?", choices: ["Caffeine", "Lithium", "Quinine", "Cocaine"], correct: 1 },
  { question: "Mountain Dew was created in?", choices: ["Tennessee", "California", "Colorado", "Florida"], correct: 0 },
  { question: "Fanta was first developed in which country?", choices: ["USA", "Germany", "UK", "Italy"], correct: 1 },
  { question: "Sprite is owned by?", choices: ["Pepsi", "Coca-Cola", "Cadbury", "Nestlé"], correct: 1 },
  { question: "Diet Coke launched in?", choices: ["1972", "1982", "1992", "2002"], correct: 1 },
  { question: "New Coke was introduced and quickly pulled in?", choices: ["1975", "1985", "1995", "2005"], correct: 1 },
  { question: "Pepsi's parent company is?", choices: ["Coca-Cola", "PepsiCo", "Kraft", "General Mills"], correct: 1 },
  { question: "Mountain Dew is owned by?", choices: ["Coca-Cola", "PepsiCo", "Dr Pepper Snapple", "Nestlé"], correct: 1 },
  { question: "Schweppes is famous for?", choices: ["Cola", "Tonic water", "Root beer", "Energy drinks"], correct: 1 },
  { question: "Root beer A&W was founded in?", choices: ["1899", "1919", "1929", "1949"], correct: 1 },
  { question: "Crush brand is famous for?", choices: ["Cola", "Lemon-lime", "Orange soda", "Cream soda"], correct: 2 },
  { question: "Inca Kola is the leading soda of?", choices: ["Argentina", "Peru", "Chile", "Mexico"], correct: 1 },
  { question: "Irn-Bru is associated with?", choices: ["Australia", "Scotland", "Canada", "India"], correct: 1 },
  { question: "Big Red is a popular?", choices: ["Cola", "Cream soda red", "Energy drink", "Cherry brand"], correct: 1 },
  { question: "Tab was an early diet soda by?", choices: ["Pepsi", "Coca-Cola", "Dr Pepper", "7-Up"], correct: 1 },
  { question: "Faygo is from which US city?", choices: ["NYC", "Detroit", "Chicago", "Philadelphia"], correct: 1 },
  { question: "Jarritos is from?", choices: ["Spain", "Mexico", "Argentina", "Peru"], correct: 1 },
  { question: "RC Cola stands for?", choices: ["Royal Cup", "Royal Crown", "Real Cola", "Right Cola"], correct: 1 },
  { question: "Vimto is from which country?", choices: ["UK", "India", "USA", "Egypt"], correct: 0 },
  { question: "Cheerwine is a regional cherry soda from?", choices: ["Texas", "North Carolina", "Ohio", "Georgia"], correct: 1 },
  { question: "Fresca is owned by?", choices: ["Pepsi", "Coca-Cola", "A&W", "Dr Pepper Snapple"], correct: 1 },
  { question: "Mello Yello is a?", choices: ["Cherry soda", "Citrus soda", "Cola", "Cream soda"], correct: 1 },
  { question: "Surge soda was relaunched by Coke in the?", choices: ["2000s", "2010s", "2020s", "1990s"], correct: 1 },
  { question: "Slice was a fruit soda by?", choices: ["Coca-Cola", "Pepsi", "7-Up", "A&W"], correct: 1 },
  { question: "Orangina is from which country?", choices: ["Italy", "France", "Spain", "Belgium"], correct: 1 },
  { question: "Pepsi's blue/red/white logo evokes the?", choices: ["UK flag", "US flag", "French flag", "Italian flag"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SodaBrandsQuizSettings): SodaBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SodaBrandsQuizState, action: SodaBrandsQuizAction): SodaBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SodaBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
