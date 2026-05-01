import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldDictatorsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldDictatorsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldDictatorsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Adolf Hitler led which party?", choices: ["Communist", "Nazi (NSDAP)", "Fascist", "Falange"], correct: 1 },
  { question: "Year Hitler became Chancellor?", choices: ["1929", "1933", "1939", "1945"], correct: 1 },
  { question: "Joseph Stalin led which country?", choices: ["Germany", "USSR", "China", "Yugoslavia"], correct: 1 },
  { question: "Stalin succeeded?", choices: ["Lenin", "Trotsky", "Khrushchev", "Brezhnev"], correct: 0 },
  { question: "Benito Mussolini led?", choices: ["Germany", "Italy", "Spain", "Portugal"], correct: 1 },
  { question: "Mussolini's ideology was?", choices: ["Communism", "Fascism", "Anarchism", "Liberalism"], correct: 1 },
  { question: "Francisco Franco ruled?", choices: ["Italy", "Portugal", "Spain", "Argentina"], correct: 2 },
  { question: "Franco came to power after?", choices: ["WWI", "Spanish Civil War", "WWII", "Cold War"], correct: 1 },
  { question: "Mao Zedong founded?", choices: ["Republic of China", "PRC", "Taiwan", "North Korea"], correct: 1 },
  { question: "Mao's Cultural Revolution began?", choices: ["1949", "1958", "1966", "1976"], correct: 2 },
  { question: "Pol Pot led the?", choices: ["Viet Cong", "Khmer Rouge", "Pathet Lao", "Tamil Tigers"], correct: 1 },
  { question: "Pol Pot ruled which country?", choices: ["Vietnam", "Cambodia", "Laos", "Thailand"], correct: 1 },
  { question: "Kim Il-sung founded?", choices: ["South Korea", "North Korea", "Vietnam", "China"], correct: 1 },
  { question: "Saddam Hussein ruled?", choices: ["Iran", "Iraq", "Syria", "Libya"], correct: 1 },
  { question: "Saddam was overthrown in?", choices: ["1991", "2001", "2003", "2006"], correct: 2 },
  { question: "Muammar Gaddafi ruled?", choices: ["Egypt", "Libya", "Algeria", "Tunisia"], correct: 1 },
  { question: "Gaddafi was killed in?", choices: ["2009", "2011", "2013", "2015"], correct: 1 },
  { question: "Idi Amin ruled?", choices: ["Kenya", "Uganda", "Tanzania", "Rwanda"], correct: 1 },
  { question: "Augusto Pinochet ruled?", choices: ["Argentina", "Chile", "Brazil", "Peru"], correct: 1 },
  { question: "Pinochet seized power in?", choices: ["1970", "1973", "1976", "1981"], correct: 1 },
  { question: "Fidel Castro led?", choices: ["Mexico", "Cuba", "Venezuela", "Nicaragua"], correct: 1 },
  { question: "Castro overthrew?", choices: ["Somoza", "Batista", "Trujillo", "Noriega"], correct: 1 },
  { question: "Nicolae Ceausescu ruled?", choices: ["Bulgaria", "Romania", "Hungary", "Poland"], correct: 1 },
  { question: "Ceausescu was executed in?", choices: ["1985", "1989", "1991", "1995"], correct: 1 },
  { question: "Slobodan Milosevic led?", choices: ["Croatia", "Serbia", "Bosnia", "Slovenia"], correct: 1 },
  { question: "Bashar al-Assad rules?", choices: ["Iraq", "Syria", "Lebanon", "Jordan"], correct: 1 },
  { question: "Robert Mugabe ruled?", choices: ["Zambia", "Zimbabwe", "Mozambique", "Angola"], correct: 1 },
  { question: "Hitler's SS was led by?", choices: ["Goebbels", "Himmler", "Goering", "Hess"], correct: 1 },
  { question: "Mussolini was nicknamed?", choices: ["Il Duce", "Der Fuhrer", "El Caudillo", "The General"], correct: 0 },
  { question: "Stalin's real surname was?", choices: ["Dzhugashvili", "Ulyanov", "Bronstein", "Brezhnev"], correct: 0 },
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
