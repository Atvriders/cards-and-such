import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StudioGhibliQuizSettings { questions: "10" | "20"; }
export interface StudioGhibliQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StudioGhibliQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spirited Away's protagonist?", choices: ["Sophie", "Chihiro", "Kiki", "San"], correct: 1 },
  { question: "Totoro's smaller white companion?", choices: ["Catbus", "Mei", "Soot Sprite", "Chibi-Totoro"], correct: 3 },
  { question: "Howl's Moving Castle features which fire demon?", choices: ["Kabuto", "Calcifer", "Pyro", "Pazu"], correct: 1 },
  { question: "Kiki's pet is a black?", choices: ["Cat", "Dog", "Crow", "Bat"], correct: 0 },
  { question: "Princess Mononoke's wolf-raised heroine?", choices: ["Sophie", "Chihiro", "San", "Nausicaa"], correct: 2 },
  { question: "Castle in the Sky is named?", choices: ["Atlantis", "Laputa", "Avalon", "Lagoon"], correct: 1 },
  { question: "Director of My Neighbor Totoro?", choices: ["Takahata", "Miyazaki", "Hosoda", "Suzuki"], correct: 1 },
  { question: "Grave of the Fireflies' director?", choices: ["Miyazaki", "Takahata", "Yonebayashi", "Mizoguchi"], correct: 1 },
  { question: "Studio Ghibli was founded in?", choices: ["1979", "1985", "1990", "1995"], correct: 1 },
  { question: "The Cat Returns is set partly in?", choices: ["Cat Kingdom", "Spirit World", "Dragon Land", "Valley of Wind"], correct: 0 },
  { question: "Ponyo is what type of creature?", choices: ["Cat", "Goldfish", "Frog", "Dragon"], correct: 1 },
  { question: "Nausicaa's setting is the Valley of?", choices: ["Wind", "Mist", "Rivers", "Stars"], correct: 0 },
  { question: "The Boy and the Heron features which bird?", choices: ["Crow", "Heron", "Stork", "Sparrow"], correct: 1 },
  { question: "Lupin III: Castle of Cagliostro was directed by?", choices: ["Takahata", "Miyazaki", "Suzuki", "Yonebayashi"], correct: 1 },
  { question: "Joe Hisaishi composed for which films?", choices: ["Most Ghibli films", "Pixar films", "Disney", "DreamWorks"], correct: 0 },
  { question: "My Neighbor Totoro's setting era?", choices: ["1950s Japan", "Modern day", "Edo period", "Future"], correct: 0 },
  { question: "Whisper of the Heart features writing a?", choices: ["Symphony", "Novel", "Poem", "Movie"], correct: 1 },
  { question: "Tale of Princess Kaguya is based on?", choices: ["Genji Monogatari", "Bamboo Cutter", "Kojiki", "Heian poems"], correct: 1 },
  { question: "Only Yesterday director?", choices: ["Miyazaki", "Takahata", "Hosoda", "Yonebayashi"], correct: 1 },
  { question: "Spirited Away won which Oscar?", choices: ["Best Picture", "Best Animated Feature", "Best Foreign Film", "Best Original Score"], correct: 1 },
  { question: "Arrietty's tiny people are called?", choices: ["Borrowers", "Smalls", "Pixies", "Tinies"], correct: 0 },
  { question: "When Marnie Was There is set in?", choices: ["Tokyo", "Hokkaido", "Osaka", "Okinawa"], correct: 1 },
  { question: "Porco Rosso transformed into a?", choices: ["Wolf", "Pig", "Boar", "Eagle"], correct: 1 },
  { question: "Ghibli museum is located in?", choices: ["Tokyo Mitaka", "Kyoto", "Osaka", "Yokohama"], correct: 0 },
  { question: "Wind Rises features?", choices: ["Aircraft designer", "Train builder", "Architect", "Inventor"], correct: 0 },
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
