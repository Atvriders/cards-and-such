import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ArtHeistsQuizSettings { questions: "10" | "20"; }
export interface ArtHeistsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ArtHeistsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "Largest unsolved art theft happened at?", "choices": ["Isabella Stewart Gardner Museum", "Louvre", "MoMA", "Tate"], "correct": 0},
  {"question": "Year of Gardner Museum heist?", "choices": ["1990", "1985", "1995", "2000"], "correct": 0},
  {"question": "Gardner heist thieves dressed as?", "choices": ["Police", "Janitors", "Tourists", "Workers"], "correct": 0},
  {"question": "Stolen Vermeer in Gardner heist?", "choices": ["The Concert", "Milkmaid", "Lacemaker", "Geographer"], "correct": 0},
  {"question": "Stolen Rembrandt seascape from Gardner?", "choices": ["Storm on the Sea of Galilee", "Night Watch", "Anatomy", "Self-Portrait"], "correct": 0},
  {"question": "Mona Lisa was stolen from the Louvre in?", "choices": ["1911", "1925", "1903", "1942"], "correct": 0},
  {"question": "Mona Lisa thief?", "choices": ["Vincenzo Peruggia", "Pablo Picasso", "Apollinaire", "Adam Worth"], "correct": 0},
  {"question": "Munch's 'The Scream' was stolen in?", "choices": ["1994 and 2004", "2010", "1985", "1972"], "correct": 0},
  {"question": "Stockholm 2000 heist used what getaway?", "choices": ["Boats", "Cars", "Helicopter", "Bikes"], "correct": 0},
  {"question": "Kunsthal Rotterdam 2012 heist took works by?", "choices": ["Picasso, Monet, Matisse", "Just Picasso", "Just Monet", "Just Klimt"], "correct": 0},
  {"question": "Romanian thieves' mother allegedly burned the Kunsthal art?", "choices": ["Yes", "No", "Sold", "Ransomed"], "correct": 0},
  {"question": "Green Vault heist (2019) was in?", "choices": ["Dresden", "Berlin", "Munich", "Vienna"], "correct": 0},
  {"question": "Antwerp Diamond Heist year?", "choices": ["2003", "1995", "2010", "1989"], "correct": 0},
  {"question": "Antwerp diamond heist mastermind?", "choices": ["Leonardo Notarbartolo", "Doris Payne", "Bill Mason", "Pink Panther"], "correct": 0},
  {"question": "Pink Panthers gang origin?", "choices": ["Serbia/Montenegro", "Italy", "Russia", "Romania"], "correct": 0},
  {"question": "Adam Worth was called the 'Napoleon of'?", "choices": ["Crime", "Art", "Banking", "Heists"], "correct": 0},
  {"question": "Worth famously stole which Gainsborough?", "choices": ["Duchess of Devonshire", "Pinkie", "Blue Boy", "Mrs. Siddons"], "correct": 0},
  {"question": "Caravaggio Nativity stolen in 1969 from?", "choices": ["Palermo", "Rome", "Naples", "Venice"], "correct": 0},
  {"question": "Suspected destroyer of Caravaggio Nativity?", "choices": ["Sicilian Mafia", "Camorra", "Albanian mob", "Yakuza"], "correct": 0},
  {"question": "Edvard Munch's 'Scream' versions number how many?", "choices": ["4", "2", "1", "6"], "correct": 0},
  {"question": "Picasso 'Le Pigeon aux Petits Pois' stolen at Paris museum in?", "choices": ["2010", "2005", "2015", "2000"], "correct": 0},
  {"question": "'Salvator Mundi' (controversial Da Vinci) sold in 2017 for?", "choices": ["~$450M", "~$50M", "~$100M", "~$1B"], "correct": 0},
  {"question": "Boston Gardner reward stands at (recent)?", "choices": ["$10M", "$1M", "$25M", "$5M"], "correct": 2},
  {"question": "Which Klimt was stolen and recovered after 23 years (2019)?", "choices": ["Portrait of a Lady", "Kiss", "Adele Bloch-Bauer I", "Judith"], "correct": 0},
  {"question": "Klimt 'Portrait of a Lady' was at?", "choices": ["Ricci Oddi, Piacenza", "Vienna", "Florence", "Milan"], "correct": 0},
  {"question": "Stéphane Breitwieser stole works in?", "choices": ["European museums", "US museums", "Asia", "South America"], "correct": 0},
  {"question": "Breitwieser's mother allegedly?", "choices": ["Destroyed art", "Sold", "Hid", "Ransomed"], "correct": 0},
  {"question": "Poly Klein Cézanne theft in 1999 was in?", "choices": ["Oxford", "Cambridge", "London", "Paris"], "correct": 0},
  {"question": "Van Gogh Museum 2002 heist stole how many works?", "choices": ["2", "1", "5", "10"], "correct": 0},
  {"question": "Recovered Van Gogh works in 2016 in?", "choices": ["Italy (Camorra)", "Spain", "France", "UK"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ArtHeistsQuizSettings): ArtHeistsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ArtHeistsQuizState, action: ArtHeistsQuizAction): ArtHeistsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ArtHeistsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
