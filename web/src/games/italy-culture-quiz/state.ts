import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ItalyCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ItalyCultureQuizSettings { questions: "10" | "20"; }
export interface ItalyCultureQuizState { questions: ItalyCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ItalyCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: ItalyCultureQuizQuestion[] = [
  { question: "What is the capital of Italy?", choices: ["Milan","Naples","Rome","Florence"], correct: 2 },
  { question: "Who painted the Sistine Chapel ceiling?", choices: ["Raphael","Michelangelo","Leonardo da Vinci","Botticelli"], correct: 1 },
  { question: "Pizza Margherita originated in which city?", choices: ["Rome","Milan","Naples","Florence"], correct: 2 },
  { question: "Authentic Carbonara contains which key ingredient?", choices: ["Cream","Eggs","Tomato","Pesto"], correct: 1 },
  { question: "The Roman Empire's western half fell in approximately?", choices: ["410 CE","476 CE","527 CE","800 CE"], correct: 1 },
  { question: "Julius Caesar was assassinated in?", choices: ["49 BCE","44 BCE","27 BCE","14 CE"], correct: 1 },
  { question: "The Colosseum in Rome was completed around?", choices: ["50 BCE","80 CE","200 CE","400 CE"], correct: 1 },
  { question: "Italy was unified into a single kingdom in?", choices: ["1815","1848","1861","1871"], correct: 2 },
  { question: "Giuseppe Garibaldi is celebrated as a hero of?", choices: ["The Renaissance","Italian Unification","WWII Resistance","The Roman Republic"], correct: 1 },
  { question: "Which volcano destroyed Pompeii in 79 CE?", choices: ["Etna","Vesuvius","Stromboli","Vulcano"], correct: 1 },
  { question: "Venice is built on a lagoon in which sea?", choices: ["Tyrrhenian","Adriatic","Ionian","Ligurian"], correct: 1 },
  { question: "The Leaning Tower is located in?", choices: ["Pisa","Siena","Lucca","Bologna"], correct: 0 },
  { question: "Pesto sauce traditionally comes from which region?", choices: ["Liguria","Sicily","Tuscany","Lazio"], correct: 0 },
  { question: "Parmigiano-Reggiano cheese originates from around which city?", choices: ["Modena","Parma","Bologna","Verona"], correct: 1 },
  { question: "Tiramisu's signature flavor comes from?", choices: ["Espresso and mascarpone","Lemon and ricotta","Hazelnut and cream","Pistachio and honey"], correct: 0 },
  { question: "Risotto is a dish primarily made with?", choices: ["Pasta","Rice","Polenta","Bread"], correct: 1 },
  { question: "Which Italian poet wrote the 'Divine Comedy'?", choices: ["Petrarch","Dante Alighieri","Boccaccio","Tasso"], correct: 1 },
  { question: "The Renaissance is widely considered to have started in which city?", choices: ["Rome","Florence","Venice","Milan"], correct: 1 },
  { question: "Leonardo da Vinci's 'The Last Supper' is housed in which city?", choices: ["Rome","Milan","Florence","Venice"], correct: 1 },
  { question: "The longest river in Italy is the?", choices: ["Tiber","Arno","Po","Adige"], correct: 2 },
  { question: "Which mountain range forms Italy's spine?", choices: ["Alps","Apennines","Dolomites","Pyrenees"], correct: 1 },
  { question: "Sicily is the largest island in which sea?", choices: ["Adriatic","Mediterranean","Ionian","Aegean"], correct: 1 },
  { question: "Vatican City is located within which Italian city?", choices: ["Rome","Florence","Milan","Naples"], correct: 0 },
  { question: "Which composer wrote the operas 'Aida' and 'La Traviata'?", choices: ["Puccini","Verdi","Rossini","Donizetti"], correct: 1 },
  { question: "Sophia Loren is celebrated as an Italian?", choices: ["Painter","Actress","Designer","Singer"], correct: 1 },
  { question: "Marco Polo famously traveled to?", choices: ["The Americas","China and Asia","Africa","Australia"], correct: 1 },
  { question: "Galileo Galilei was born in which Italian city?", choices: ["Florence","Pisa","Bologna","Padua"], correct: 1 },
  { question: "Italy switched from kingdom to republic in?", choices: ["1922","1943","1946","1958"], correct: 2 },
  { question: "Espresso coffee was popularized in which country?", choices: ["France","Italy","Austria","Turkey"], correct: 1 },
  { question: "Which fashion house was founded in Florence in 1921 by Guccio?", choices: ["Prada","Versace","Gucci","Armani"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ItalyCultureQuizSettings): ItalyCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ItalyCultureQuizState, action: ItalyCultureQuizAction): ItalyCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ItalyCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
