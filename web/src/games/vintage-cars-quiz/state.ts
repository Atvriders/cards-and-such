import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface VintageCarsQuizSettings { questions: "10" | "20" | "30"; }
export interface VintageCarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type VintageCarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is generally considered the 'vintage' era for cars?", choices: ["1919-1930", "1900-1920", "1945-1960", "1960-1975"], correct: 0 },
  { question: "Ford Model T was produced from?", choices: ["1908-1927", "1900-1920", "1915-1930", "1905-1925"], correct: 0 },
  { question: "Model T color quote attributed to Henry Ford?", choices: ["Any color so long as it is black", "Black is the new red", "Red is best", "Choose your color"], correct: 0 },
  { question: "What luxury car brand was named after a French explorer (founded 1902)?", choices: ["Cadillac", "Lincoln", "Packard", "Pierce-Arrow"], correct: 0 },
  { question: "Rolls-Royce was founded in?", choices: ["1906", "1900", "1912", "1920"], correct: 0 },
  { question: "The Rolls-Royce Silver Ghost debuted in?", choices: ["1907", "1900", "1912", "1920"], correct: 0 },
  { question: "What hood ornament is on a Rolls-Royce?", choices: ["Spirit of Ecstasy", "Winged Victory", "Flying Lady", "All names for it"], correct: 0 },
  { question: "What was Bugatti's pre-war masterpiece?", choices: ["Type 57 Atlantic", "Type 35", "Veyron", "Chiron"], correct: 0 },
  { question: "Bugatti was founded by?", choices: ["Ettore Bugatti (1909)", "Enzo Ferrari", "Karl Benz", "Ferdinand Porsche"], correct: 0 },
  { question: "Duesenberg's iconic Model J debuted in?", choices: ["1928", "1920", "1935", "1925"], correct: 0 },
  { question: "'It's a Duesy' refers to?", choices: ["Duesenberg luxury cars", "Buick Duo", "Dodge Doozy", "Generic phrase"], correct: 0 },
  { question: "Packard's slogan was?", choices: ["Ask the Man Who Owns One", "Best in Class", "Power and Style", "American Luxury"], correct: 0 },
  { question: "What is a 'roadster' body style?", choices: ["Open two-seater without fixed roof", "Sedan with sunroof", "Coupe with hardtop", "Convertible 4-seater"], correct: 0 },
  { question: "What is a 'phaeton' body style?", choices: ["Open touring car (no fixed roof, multiple seats)", "Coupe", "Sedan", "Wagon"], correct: 0 },
  { question: "Stutz Bearcat was popular in?", choices: ["1910s-1920s", "1930s", "1940s", "1950s"], correct: 0 },
  { question: "What was Cord's signature feature in the 1930s?", choices: ["Front-wheel drive", "Rear engine", "Mid engine", "AWD"], correct: 0 },
  { question: "The Cord 810/812 was designed by?", choices: ["Gordon Buehrig", "Harley Earl", "Raymond Loewy", "Virgil Exner"], correct: 0 },
  { question: "What did 'antique car' designation typically mean (US)?", choices: ["Built before 1925-ish (varies by state, often 25+ years)", "Pre-1900", "Pre-1950", "Pre-1980"], correct: 0 },
  { question: "Hispano-Suiza is known for?", choices: ["Spanish/French luxury and aero engines", "Italian sports cars", "German sedans", "British roadsters"], correct: 0 },
  { question: "Pierce-Arrow was based in?", choices: ["Buffalo, NY", "Detroit, MI", "Cleveland, OH", "Boston, MA"], correct: 0 },
  { question: "What was the iconic mascot for Lincoln in 1930s?", choices: ["Greyhound", "Lion", "Eagle", "Horse"], correct: 0 },
  { question: "What is the term for a car body without doors over the seats?", choices: ["Tonneau", "Cabriolet", "Brougham", "Limo"], correct: 0 },
  { question: "Auburn Speedster cars are from which manufacturer group?", choices: ["Auburn Automobile Company (Cord/Auburn/Duesenberg)", "Studebaker", "GM", "Hudson"], correct: 0 },
  { question: "What is a 'concours d'elegance'?", choices: ["A car beauty competition for vintage/classic cars", "A racing event", "An auction", "A maintenance show"], correct: 0 },
  { question: "Pebble Beach Concours d'Elegance is held in what U.S. state?", choices: ["California", "Florida", "New York", "Texas"], correct: 0 },
  { question: "What was the first U.S. auto show?", choices: ["New York 1900", "Chicago 1905", "Detroit 1907", "Philadelphia 1898"], correct: 0 },
  { question: "What 1930s GM design VP shaped American cars?", choices: ["Harley Earl", "Raymond Loewy", "Virgil Exner", "Bill Mitchell"], correct: 0 },
  { question: "Citroen Traction Avant pioneered what (1934)?", choices: ["Mass-production unibody with FWD", "Hybrid drive", "Disc brakes", "Air suspension"], correct: 0 },
  { question: "Mercedes-Benz 300SL Gullwing year?", choices: ["1954", "1948", "1960", "1965"], correct: 0 },
  { question: "Jaguar's first XK series sports car was?", choices: ["XK120 (1948)", "XK140", "XK150", "XKE"], correct: 0 },
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
