import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CarsHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface CarsHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CarsHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is credited with inventing the modern automobile in 1885-86?", choices: ["Karl Benz", "Henry Ford", "Gottlieb Daimler", "Nikolaus Otto"], correct: 0 },
  { question: "What was the first mass-produced car (1908)?", choices: ["Ford Model T", "Ford Model A", "Ford Mustang", "Cadillac Coupe"], correct: 0 },
  { question: "Who pioneered the moving assembly line in 1913?", choices: ["Henry Ford", "Ransom Olds", "Walter Chrysler", "Louis Chevrolet"], correct: 0 },
  { question: "What German company has the slogan 'Vorsprung durch Technik'?", choices: ["Audi", "BMW", "Mercedes-Benz", "Porsche"], correct: 0 },
  { question: "Where is BMW headquartered?", choices: ["Munich", "Stuttgart", "Wolfsburg", "Berlin"], correct: 0 },
  { question: "Mercedes-Benz is headquartered in?", choices: ["Stuttgart", "Munich", "Hamburg", "Frankfurt"], correct: 0 },
  { question: "Volkswagen was founded in what year?", choices: ["1937", "1945", "1928", "1955"], correct: 0 },
  { question: "What car is known as 'The People's Car' in German?", choices: ["VW Beetle", "VW Golf", "VW Passat", "VW Polo"], correct: 0 },
  { question: "Who founded Toyota?", choices: ["Kiichiro Toyoda", "Soichiro Honda", "Yutaka Katayama", "Eiji Toyoda"], correct: 0 },
  { question: "Toyota was founded in what year?", choices: ["1937", "1933", "1945", "1950"], correct: 0 },
  { question: "Who founded Honda Motor Co.?", choices: ["Soichiro Honda", "Kiichiro Toyoda", "Yutaka Katayama", "Konosuke Matsushita"], correct: 0 },
  { question: "Honda was founded in?", choices: ["1948", "1937", "1955", "1962"], correct: 0 },
  { question: "What year did Tesla Motors deliver its first Roadster?", choices: ["2008", "2003", "2010", "2012"], correct: 0 },
  { question: "Who founded Ferrari?", choices: ["Enzo Ferrari", "Ferruccio Lamborghini", "Battista Pininfarina", "Alfieri Maserati"], correct: 0 },
  { question: "Ferrari was founded in?", choices: ["1939 (Auto Avio Costruzioni); 1947 first Ferrari-badged car", "1929", "1955", "1962"], correct: 0 },
  { question: "What was the first car to break the sound barrier on land?", choices: ["ThrustSSC (1997)", "Spirit of America", "Bluebird", "Bloodhound"], correct: 0 },
  { question: "What was the world's first commercially successful electric car company today?", choices: ["Tesla", "GM", "Nissan", "BYD"], correct: 0 },
  { question: "What car holds the title for fastest production car in the early 2020s?", choices: ["SSC Tuatara/Bugatti Chiron Super Sport contenders", "Lamborghini Aventador", "Ferrari LaFerrari", "McLaren P1"], correct: 0 },
  { question: "What was Henry Ford's $5/day wage announcement year?", choices: ["1914", "1908", "1920", "1925"], correct: 0 },
  { question: "What U.S. company was founded by William C. Durant in 1908?", choices: ["General Motors", "Chrysler", "Ford", "Studebaker"], correct: 0 },
  { question: "Walter Chrysler founded Chrysler in?", choices: ["1925", "1908", "1932", "1945"], correct: 0 },
  { question: "What was Volkswagen Beetle's production run length?", choices: ["1938-2003 (original)", "1950-1990", "1945-1980", "1960-2000"], correct: 0 },
  { question: "What vehicle was the first SUV?", choices: ["Often credited to Jeep Wagoneer (1963)", "Ford Bronco", "Chevy Suburban", "Range Rover"], correct: 0 },
  { question: "What 1959 Mini was designed by?", choices: ["Alec Issigonis", "Colin Chapman", "Carroll Shelby", "Enzo Ferrari"], correct: 0 },
  { question: "Who founded Lamborghini?", choices: ["Ferruccio Lamborghini", "Enzo Ferrari", "Battista Pininfarina", "Carlo Abarth"], correct: 0 },
  { question: "Lamborghini was founded in?", choices: ["1963", "1947", "1955", "1972"], correct: 0 },
  { question: "Who designed the Volkswagen Beetle?", choices: ["Ferdinand Porsche", "Karl Benz", "Wilhelm Maybach", "Bela Barenyi"], correct: 0 },
  { question: "What was the first car with airbags as standard?", choices: ["Mercedes-Benz S-Class (1981 driver airbag)", "Volvo 240", "BMW 7 Series", "Ford Taurus"], correct: 0 },
  { question: "When was the Toyota Prius (first hybrid mass-market car) launched?", choices: ["1997 (Japan)", "2000", "2003", "1995"], correct: 0 },
  { question: "What U.S. brand made the famous Corvette since 1953?", choices: ["Chevrolet", "Ford", "Pontiac", "Dodge"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CarsHistoryQuizSettings): CarsHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CarsHistoryQuizState, action: CarsHistoryQuizAction): CarsHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CarsHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
