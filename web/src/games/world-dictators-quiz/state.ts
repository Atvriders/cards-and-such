import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldDictatorsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldDictatorsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldDictatorsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Adolf Hitler led which party?", choices: ["Communist", "Nazi", "Fascist Italian", "Falangist"], correct: 1 },
  { question: "Mussolini ruled which country?", choices: ["Spain", "Italy", "Germany", "Portugal"], correct: 1 },
  { question: "Stalin succeeded?", choices: ["Trotsky", "Lenin", "Bukharin", "Kerensky"], correct: 1 },
  { question: "Mao founded modern?", choices: ["Japan", "China (PRC)", "Korea", "Vietnam"], correct: 1 },
  { question: "Franco ruled?", choices: ["Italy", "Portugal", "Spain", "Romania"], correct: 2 },
  { question: "Pol Pot led?", choices: ["Vietnam", "Cambodia", "Laos", "Thailand"], correct: 1 },
  { question: "Saddam Hussein ruled?", choices: ["Iran", "Iraq", "Syria", "Libya"], correct: 1 },
  { question: "Gaddafi ruled?", choices: ["Egypt", "Algeria", "Libya", "Tunisia"], correct: 2 },
  { question: "Idi Amin ruled?", choices: ["Kenya", "Uganda", "Tanzania", "Sudan"], correct: 1 },
  { question: "Mobutu ruled?", choices: ["Nigeria", "Zaire/DRC", "Ghana", "Senegal"], correct: 1 },
  { question: "Ceaușescu ruled?", choices: ["Bulgaria", "Romania", "Hungary", "Yugoslavia"], correct: 1 },
  { question: "Tito led?", choices: ["Yugoslavia", "Romania", "Albania", "Bulgaria"], correct: 0 },
  { question: "Kim Il-sung founded?", choices: ["South Korea", "North Korea", "Vietnam", "Cambodia"], correct: 1 },
  { question: "Kim Jong-un is grandson of?", choices: ["Kim Il-sung", "Kim Jong-il", "Kim Sang-il", "Kim Yong-jin"], correct: 0 },
  { question: "Castro led which Cuban revolution year?", choices: ["1949", "1959", "1969", "1979"], correct: 1 },
  { question: "Pinochet ruled?", choices: ["Argentina", "Chile", "Peru", "Brazil"], correct: 1 },
  { question: "Videla ruled?", choices: ["Argentina", "Chile", "Uruguay", "Brazil"], correct: 0 },
  { question: "Stroessner ruled?", choices: ["Paraguay", "Bolivia", "Peru", "Ecuador"], correct: 0 },
  { question: "Tito's nation broke into ___ in 1990s?", choices: ["Five states", "Six/seven states", "Two states", "Three states"], correct: 1 },
  { question: "Hitler was Chancellor in?", choices: ["1923", "1933", "1939", "1945"], correct: 1 },
  { question: "Mussolini's \"March on Rome\"?", choices: ["1920", "1922", "1925", "1930"], correct: 1 },
  { question: "Stalin died in?", choices: ["1943", "1953", "1963", "1973"], correct: 1 },
  { question: "Mao's \"Cultural Revolution\" started?", choices: ["1956", "1966", "1976", "1986"], correct: 1 },
  { question: "Khmer Rouge ruled Cambodia?", choices: ["1965-1970", "1975-1979", "1981-1985", "1991-1995"], correct: 1 },
  { question: "Saddam invaded Kuwait in?", choices: ["1980", "1985", "1990", "1995"], correct: 2 },
  { question: "Saddam was captured in?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Gaddafi was killed in?", choices: ["2008", "2011", "2014", "2017"], correct: 1 },
  { question: "Hitler's \"Mein Kampf\" was written when?", choices: ["Pre-WWI", "In prison 1924", "In office 1933", "During WW2"], correct: 1 },
  { question: "Stalin's 5-year plans focused on?", choices: ["Land redistribution", "Industrialization", "Foreign aid", "Education only"], correct: 1 },
  { question: "Berlin Wall fell in?", choices: ["1979", "1985", "1989", "1991"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldDictatorsQuizSettings): WorldDictatorsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldDictatorsQuizState, action: WorldDictatorsQuizAction): WorldDictatorsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldDictatorsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
