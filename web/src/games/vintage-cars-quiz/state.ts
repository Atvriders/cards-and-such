import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VintageCarsQuizSettings { questions: "10" | "20" | "30"; }
export interface VintageCarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VintageCarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year did Ford introduce the Model T?", choices: ["1905", "1908", "1912", "1915"], correct: 1 },
  { question: "Which company produced the Silver Ghost?", choices: ["Bentley", "Rolls-Royce", "Packard", "Daimler"], correct: 1 },
  { question: "Duesenberg was an American luxury brand from?", choices: ["Indianapolis", "Detroit", "Chicago", "Cleveland"], correct: 0 },
  { question: "The brass era of cars roughly ended around?", choices: ["1900", "1915", "1930", "1945"], correct: 1 },
  { question: "Which Bugatti model is called \"Atlantic\"?", choices: ["Type 35", "Type 41", "Type 57SC", "Type 13"], correct: 2 },
  { question: "Hispano-Suiza was based in which country?", choices: ["Italy", "France & Spain", "UK", "Germany"], correct: 1 },
  { question: "The Cord 810 of 1936 had what feature?", choices: ["Rear engine", "Front-wheel drive", "V12", "Air-cooled"], correct: 1 },
  { question: "Packard slogan included \"Ask the man who?\"", choices: ["Drives one", "Owns one", "Made one", "Sold one"], correct: 1 },
  { question: "Which 1930s Cadillac had a V16?", choices: ["Series 60", "Series 75", "Series 452", "Type 90"], correct: 2 },
  { question: "Auburn was made in which U.S. state?", choices: ["Indiana", "Michigan", "Ohio", "Illinois"], correct: 0 },
  { question: "The Stanley Steamer was powered by?", choices: ["Gasoline", "Steam", "Electric", "Diesel"], correct: 1 },
  { question: "Pierce-Arrow was famous for?", choices: ["Hood-mounted headlights", "Fender-mounted headlights", "Roof racks", "Removable doors"], correct: 1 },
  { question: "Which marque made the SS Jaguar 100?", choices: ["Bentley", "Jaguar (SS Cars)", "Aston Martin", "MG"], correct: 1 },
  { question: "Studebaker was based in which city?", choices: ["Detroit", "South Bend", "Toledo", "Flint"], correct: 1 },
  { question: "The Hudson Hornet dominated which racing in 1950s?", choices: ["F1", "NASCAR", "Le Mans", "Indy"], correct: 1 },
  { question: "What was a 1957 Chevy Bel Air noted for?", choices: ["Tail fins", "Steam power", "Diesel", "Gull wings"], correct: 0 },
  { question: "Edsel was a brand under?", choices: ["GM", "Ford", "Chrysler", "AMC"], correct: 1 },
  { question: "DeSoto was a brand of which company?", choices: ["Ford", "Chrysler", "GM", "Studebaker"], correct: 1 },
  { question: "Tucker 48 was famous for?", choices: ["Center headlight", "Eight wheels", "Glass roof", "Diesel engine"], correct: 0 },
  { question: "Which 1950 car had gull-wing doors?", choices: ["Mercedes 300SL", "Jaguar XK120", "Porsche 356", "Aston DB2"], correct: 0 },
  { question: "Chevrolet Corvette debuted in?", choices: ["1953", "1958", "1962", "1965"], correct: 0 },
  { question: "Ford Thunderbird first appeared in?", choices: ["1953", "1955", "1957", "1960"], correct: 1 },
  { question: "Which classic was nicknamed \"Beetle\"?", choices: ["Citroen 2CV", "VW Type 1", "Fiat 500", "Renault 4"], correct: 1 },
  { question: "Mini Cooper was originally designed by?", choices: ["Pininfarina", "Alec Issigonis", "Bertone", "Giugiaro"], correct: 1 },
  { question: "1961 Jaguar E-Type was called what in the U.S.?", choices: ["XKE", "MK1", "Sport", "D"], correct: 0 },
  { question: "Aston Martin DB5 became famous in which film?", choices: ["Bullitt", "Goldfinger", "Le Mans", "Italian Job"], correct: 1 },
  { question: "Rolls-Royce Phantom was first introduced in?", choices: ["1907", "1925", "1936", "1950"], correct: 1 },
  { question: "1932 Ford nickname?", choices: ["Deuce", "Trey", "King", "Coupe"], correct: 0 },
  { question: "Lincoln flagship 1956–60 was?", choices: ["Capri", "Mark II", "Premiere", "Cosmopolitan"], correct: 1 },
  { question: "Bentley Blower famously had?", choices: ["Diesel engine", "Roots supercharger", "Rotary engine", "Steam"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: VintageCarsQuizSettings): VintageCarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: VintageCarsQuizState, action: VintageCarsQuizAction): VintageCarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: VintageCarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
