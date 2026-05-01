import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface GermanyCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GermanyCultureQuizSettings { questions: "10" | "20"; }
export interface GermanyCultureQuizState { questions: GermanyCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GermanyCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: GermanyCultureQuizQuestion[] = [
  { question: "What is the capital of Germany?", choices: ["Munich","Berlin","Hamburg","Frankfurt"], correct: 1 },
  { question: "Oktoberfest is held annually in which city?", choices: ["Berlin","Cologne","Munich","Stuttgart"], correct: 2 },
  { question: "In which year did the Berlin Wall fall?", choices: ["1985","1989","1991","1993"], correct: 1 },
  { question: "Which composer wrote the 'Ode to Joy' melody used as the EU anthem?", choices: ["Bach","Mozart","Beethoven","Brahms"], correct: 2 },
  { question: "Germany was first unified in 1871 under which chancellor?", choices: ["Otto von Bismarck","Konrad Adenauer","Angela Merkel","Helmut Schmidt"], correct: 0 },
  { question: "Which of these is a German automobile brand?", choices: ["Volvo","Renault","BMW","Fiat"], correct: 2 },
  { question: "Sauerkraut is a traditional dish made from fermented?", choices: ["Cucumber","Cabbage","Carrots","Beets"], correct: 1 },
  { question: "The Brandenburg Gate is located in which city?", choices: ["Hamburg","Berlin","Munich","Cologne"], correct: 1 },
  { question: "Which river flows through Cologne and Dusseldorf?", choices: ["Danube","Elbe","Rhine","Main"], correct: 2 },
  { question: "The Black Forest (Schwarzwald) is in which region?", choices: ["Bavaria","Baden-Wurttemberg","Saxony","Hesse"], correct: 1 },
  { question: "Which German philosopher wrote 'Critique of Pure Reason'?", choices: ["Hegel","Nietzsche","Kant","Marx"], correct: 2 },
  { question: "Bratwurst is a type of?", choices: ["Cheese","Sausage","Bread","Pastry"], correct: 1 },
  { question: "Which currency did Germany use before adopting the Euro?", choices: ["Mark","Franc","Krone","Lira"], correct: 0 },
  { question: "The Brothers Grimm are most famous for collecting?", choices: ["Operas","Folk songs","Fairy tales","Poems"], correct: 2 },
  { question: "Neuschwanstein Castle was built for which Bavarian king?", choices: ["Ludwig II","Friedrich III","Wilhelm II","Otto I"], correct: 0 },
  { question: "Which German automaker owns the Audi brand?", choices: ["BMW","Mercedes-Benz","Volkswagen","Porsche"], correct: 2 },
  { question: "Which event divided Germany into East and West after WWII?", choices: ["Treaty of Versailles","Yalta Conference","Cold War occupation","Marshall Plan"], correct: 2 },
  { question: "The Reichstag building serves as the seat of which body?", choices: ["The Bundesrat","The Bundestag","The Chancellery","The Constitutional Court"], correct: 1 },
  { question: "Pretzels (Brezeln) are particularly associated with which region?", choices: ["Saxony","Bavaria","Hesse","Lower Saxony"], correct: 1 },
  { question: "Albert Einstein was born in which German city?", choices: ["Munich","Ulm","Berlin","Hamburg"], correct: 1 },
  { question: "Which is the largest city in Germany by population?", choices: ["Hamburg","Munich","Berlin","Cologne"], correct: 2 },
  { question: "Which German invented the printing press with movable type in Europe?", choices: ["Werner von Siemens","Johannes Gutenberg","Wilhelm Conrad Roentgen","Carl Benz"], correct: 1 },
  { question: "The Autobahn is famous for sections without a general?", choices: ["Toll","Speed limit","Lane marking","Truck restriction"], correct: 1 },
  { question: "Which German chancellor served from 2005 to 2021?", choices: ["Gerhard Schroder","Angela Merkel","Helmut Kohl","Olaf Scholz"], correct: 1 },
  { question: "Which beer purity law dates from 1516?", choices: ["Bierordnung","Reinheitsgebot","Brauereirecht","Bierfreiheit"], correct: 1 },
  { question: "Which German philosopher co-wrote 'The Communist Manifesto'?", choices: ["Hegel","Schopenhauer","Marx","Heidegger"], correct: 2 },
  { question: "Lederhosen are traditional clothing from which region?", choices: ["Bavaria","Saxony","Westphalia","Schleswig-Holstein"], correct: 0 },
  { question: "Which German automaker uses a three-pointed star as its logo?", choices: ["BMW","Audi","Mercedes-Benz","Opel"], correct: 2 },
  { question: "Frankfurt is a major hub for which industry?", choices: ["Film","Finance and banking","Shipbuilding","Coal mining"], correct: 1 },
  { question: "Which German city is known as the gateway to the world for its huge port?", choices: ["Bremen","Hamburg","Kiel","Rostock"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GermanyCultureQuizSettings): GermanyCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GermanyCultureQuizState, action: GermanyCultureQuizAction): GermanyCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GermanyCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
