import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StudioGhibliQuizSettings { questions: "10" | "20"; }
export interface StudioGhibliQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StudioGhibliQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spirited Away's protagonist is?", choices: ["Sophie", "Chihiro", "Kiki", "San"], correct: 1 },
  { question: "Studio Ghibli was co-founded by?", choices: ["Hayao Miyazaki", "Akira Kurosawa", "Satoshi Kon", "Mamoru Hosoda"], correct: 0 },
  { question: "Kiki's Delivery Service: Kiki's pet is a?", choices: ["Black cat (Jiji)", "Brown dog", "Crow", "Bat"], correct: 0 },
  { question: "My Neighbor Totoro features which sister duo?", choices: ["Satsuki and Mei", "Kiki and Tombo", "Sheeta and Pazu", "San and Ashitaka"], correct: 0 },
  { question: "Howl's Moving Castle's fire demon is?", choices: ["Calcifer", "Kabuto", "Pyro", "Pazu"], correct: 0 },
  { question: "Princess Mononoke's wolf-raised girl?", choices: ["San", "Sophie", "Nausicaa", "Sheeta"], correct: 0 },
  { question: "Castle in the Sky is named?", choices: ["Laputa", "Atlantis", "Cair Paravel", "Asgard"], correct: 0 },
  { question: "Nausicaa lives in the Valley of?", choices: ["The Wind", "Roses", "Echoes", "Light"], correct: 0 },
  { question: "Porco Rosso's protagonist is a?", choices: ["Pig pilot", "Cat sailor", "Dog soldier", "Frog spy"], correct: 0 },
  { question: "Ponyo's love interest is named?", choices: ["Sosuke", "Pazu", "Tombo", "Ashitaka"], correct: 0 },
  { question: "The Cat Returns sequel character?", choices: ["The Baron", "Totoro", "Calcifer", "No-Face"], correct: 0 },
  { question: "Spirited Away's bathhouse owner?", choices: ["Yubaba", "Zeniba", "Kamaji", "Lin"], correct: 0 },
  { question: "Grave of the Fireflies is set during?", choices: ["WWII Japan", "Edo Period", "Meiji Restoration", "1990s"], correct: 0 },
  { question: "Whisper of the Heart's heroine?", choices: ["Shizuku", "Kiki", "Sheeta", "Chihiro"], correct: 0 },
  { question: "Ashitaka rides a giant?", choices: ["Red elk (Yakul)", "Boar", "Wolf", "Eagle"], correct: 0 },
  { question: "From Up on Poppy Hill is set in?", choices: ["Yokohama", "Kyoto", "Tokyo", "Osaka"], correct: 0 },
  { question: "The Wind Rises is biographical of?", choices: ["Jiro Horikoshi", "Hayao Miyazaki", "Isao Takahata", "Joe Hisaishi"], correct: 0 },
  { question: "Composer for most Ghibli films?", choices: ["Joe Hisaishi", "Yoko Kanno", "Ryuichi Sakamoto", "Kenji Kawai"], correct: 0 },
  { question: "Kaguya in Tale of Princess Kaguya is found inside a?", choices: ["Bamboo stalk", "Lotus flower", "Pearl shell", "Pumpkin"], correct: 0 },
  { question: "When Marnie Was There setting?", choices: ["Hokkaido", "Tokyo", "Kyoto", "Osaka"], correct: 0 },
  { question: "Howl's Moving Castle is based on a novel by?", choices: ["Diana Wynne Jones", "Tolkien", "Le Guin", "L. Carroll"], correct: 0 },
  { question: "Earthsea adaptation directed by?", choices: ["Goro Miyazaki", "Hayao Miyazaki", "Isao Takahata", "Hiromasa Yonebayashi"], correct: 0 },
  { question: "The forest god in Mononoke is called?", choices: ["Shishigami", "Kamaji", "Yubaba", "No-Face"], correct: 0 },
  { question: "Totoro travels by which transport?", choices: ["Catbus", "Train", "Plane", "Boat"], correct: 0 },
  { question: "No-Face's first appearance is in?", choices: ["Spirited Away", "Totoro", "Ponyo", "Princess Mononoke"], correct: 0 },
  { question: "Sheeta's pendant gem is?", choices: ["Etherium / Volucite (Aetherium)", "Diamond", "Emerald", "Sapphire"], correct: 0 },
  { question: "Kiki's broom partner is named?", choices: ["Jiji", "Tombo", "Osono", "Ursula"], correct: 1 },
  { question: "Sophie is cursed into an?", choices: ["Old woman", "Young child", "Cat", "Ghost"], correct: 0 },
  { question: "Ghibli's first feature film?", choices: ["Castle in the Sky", "Nausicaa", "Totoro", "Kiki's Delivery Service"], correct: 0 },
  { question: "Studio Ghibli's mascot is?", choices: ["Totoro", "Calcifer", "No-Face", "Jiji"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StudioGhibliQuizSettings): StudioGhibliQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StudioGhibliQuizState, action: StudioGhibliQuizAction): StudioGhibliQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StudioGhibliQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
