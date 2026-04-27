import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface GermanyCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GermanyCultureQuizSettings { questions: "10" | "20"; }
export interface GermanyCultureQuizState { questions: GermanyCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GermanyCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: GermanyCultureQuizQuestion[] = [
  { question: "What is the capital of Germany?", choices: ["Munich","Berlin","Hamburg","Frankfurt"], correct: 1 },
  { question: "Oktoberfest is held in?", choices: ["Berlin","Cologne","Munich","Stuttgart"], correct: 2 },
  { question: "The Berlin Wall fell in?", choices: ["1985","1989","1991","1993"], correct: 1 },
  { question: "Which composer wrote 'Ode to Joy'?", choices: ["Bach","Mozart","Beethoven","Brahms"], correct: 2 },
  { question: "Germany unified under which chancellor?", choices: ["Bismarck","Adenauer","Merkel","Schmidt"], correct: 0 },
  { question: "Which is a German car brand?", choices: ["Volvo","Renault","BMW","Fiat"], correct: 2 },
  { question: "Bratwurst is a?", choices: ["Beer","Sausage","Bread","Cheese"], correct: 1 },
  { question: "Which river runs through Cologne?", choices: ["Elbe","Main","Rhine","Danube"], correct: 2 },
  { question: "The Brandenburg Gate is in?", choices: ["Munich","Berlin","Hamburg","Dresden"], correct: 1 },
  { question: "Martin Luther started the?", choices: ["Renaissance","Protestant Reformation","Industrial Revolution","Enlightenment"], correct: 1 },
  { question: "Which Bavarian castle inspired Disney?", choices: ["Heidelberg","Neuschwanstein","Hohenzollern","Wartburg"], correct: 1 },
  { question: "German for 'thank you' is?", choices: ["Bitte","Danke","Hallo","Tschüss"], correct: 1 },
  { question: "Which beer style originated in Bavaria?", choices: ["IPA","Pilsner","Weissbier","Stout"], correct: 2 },
  { question: "The Bundesliga is the top league in?", choices: ["Cricket","Football","Hockey","Tennis"], correct: 1 },
  { question: "Hamburg is famous as a?", choices: ["Mountain town","Port city","Wine region","Capital"], correct: 1 },
  { question: "Goethe wrote which classic?", choices: ["Faust","Buddenbrooks","The Trial","Magic Mountain"], correct: 0 },
  { question: "Germany was reunified in?", choices: ["1989","1990","1991","1994"], correct: 1 },
  { question: "Pretzels (Brezel) are baked with what coating?", choices: ["Sugar","Lye","Butter","Honey"], correct: 1 },
  { question: "Which is a German philosopher?", choices: ["Sartre","Kant","Hume","Locke"], correct: 1 },
  { question: "Black Forest is in which region?", choices: ["Saxony","Bavaria","Baden-Württemberg","NRW"], correct: 2 },
  { question: "Which city is associated with the Bauhaus movement?", choices: ["Frankfurt","Weimar/Dessau","Cologne","Stuttgart"], correct: 1 },
  { question: "Christmas markets are called?", choices: ["Marktag","Weihnachtsmärkte","Sommerfest","Karneval"], correct: 1 },
  { question: "BMW is headquartered in?", choices: ["Stuttgart","Munich","Wolfsburg","Cologne"], correct: 1 },
  { question: "Albert Einstein was born in?", choices: ["Munich","Ulm","Berlin","Frankfurt"], correct: 1 },
  { question: "Currywurst originated in?", choices: ["Munich","Berlin","Cologne","Hamburg"], correct: 1 }
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
