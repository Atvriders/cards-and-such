import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface InventorsQuizSettings { questions: "10" | "20" | "30"; }
export interface InventorsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type InventorsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Edison is famous for?", choices: ["Telephone", "Light bulb", "Radio", "Telegraph"], correct: 1 },
  { question: "Alexander Graham Bell invented?", choices: ["Radio", "Telephone", "Light bulb", "Telegraph"], correct: 1 },
  { question: "Marconi pioneered?", choices: ["Radio", "TV", "Phone", "Telegraph"], correct: 0 },
  { question: "Tesla pioneered?", choices: ["DC power", "AC power", "Steam engine", "Diesel"], correct: 1 },
  { question: "The Wright brothers invented?", choices: ["Helicopter", "Powered airplane", "Glider", "Hot air balloon"], correct: 1 },
  { question: "Gutenberg invented?", choices: ["Printing press", "Telescope", "Pendulum clock", "Compass"], correct: 0 },
  { question: "Watt improved the?", choices: ["Telegraph", "Steam engine", "Cotton gin", "Lightbulb"], correct: 1 },
  { question: "Eli Whitney invented?", choices: ["Cotton gin", "Sewing machine", "Telegraph", "Reaper"], correct: 0 },
  { question: "Morse invented?", choices: ["Telegraph (and code)", "Telephone", "Radio", "Phonograph"], correct: 0 },
  { question: "Daimler & Benz pioneered?", choices: ["Automobile", "Train", "Airplane", "Boat"], correct: 0 },
  { question: "Diesel invented?", choices: ["Diesel engine", "Steam engine", "Jet engine", "Electric motor"], correct: 0 },
  { question: "Goodyear vulcanized?", choices: ["Glass", "Rubber", "Steel", "Plastic"], correct: 1 },
  { question: "Pasteur pioneered?", choices: ["Germ theory & pasteurization", "X-rays", "DNA", "Penicillin"], correct: 0 },
  { question: "Fleming discovered?", choices: ["Penicillin", "Insulin", "Polio vaccine", "DNA"], correct: 0 },
  { question: "Salk created?", choices: ["Polio vaccine", "Smallpox vaccine", "Penicillin", "MMR vaccine"], correct: 0 },
  { question: "Jenner pioneered?", choices: ["Smallpox vaccine", "Polio vaccine", "Insulin", "Anesthesia"], correct: 0 },
  { question: "Berners-Lee invented?", choices: ["Email", "World Wide Web", "TCP/IP", "Wi-Fi"], correct: 1 },
  { question: "Vint Cerf is co-father of?", choices: ["HTTP", "TCP/IP", "HTML", "Wi-Fi"], correct: 1 },
  { question: "Steve Wozniak built?", choices: ["Apple I/II", "Macintosh", "iPod", "iPhone"], correct: 0 },
  { question: "Engelbart invented the?", choices: ["Floppy disk", "Mouse", "Modem", "CD"], correct: 1 },
  { question: "Lovelace is regarded as the first?", choices: ["Programmer", "Hacker", "Sysadmin", "Web designer"], correct: 0 },
  { question: "Babbage designed the?", choices: ["Analytical Engine", "ENIAC", "PDP-11", "Apple II"], correct: 0 },
  { question: "Turing helped break the?", choices: ["Enigma", "Purple", "Vigenère", "Caesar"], correct: 0 },
  { question: "Hopper coined the term?", choices: ["Computer bug", "Software", "Cache", "Pixel"], correct: 0 },
  { question: "Ford pioneered?", choices: ["Mass auto production", "Diesel engine", "Helicopter", "Telephone"], correct: 0 },
  { question: "Kettering invented?", choices: ["Electric starter", "Catalytic converter", "Disc brakes", "Airbag"], correct: 0 },
  { question: "Gillette is associated with?", choices: ["Razors", "Sewing machines", "Photography", "Eyeglasses"], correct: 0 },
  { question: "Birdseye pioneered?", choices: ["Frozen food", "Microwave", "Refrigeration", "Canning"], correct: 0 },
  { question: "Land invented the?", choices: ["Polaroid camera", "Kodak film", "Brownie box", "SLR"], correct: 0 },
  { question: "Earl Tupper invented?", choices: ["Tupperware", "Plastic bags", "Vacuum sealing", "Cling wrap"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: InventorsQuizSettings): InventorsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: InventorsQuizState, action: InventorsQuizAction): InventorsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: InventorsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
