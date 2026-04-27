import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreetArtQuizSettings { questions: "10" | "20" | "30"; }
export interface StreetArtQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreetArtQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Banksy is from which English city?", choices: ["London", "Bristol", "Manchester", "Birmingham"], correct: 1 },
  { question: "Jean-Michel Basquiat first tagged under the name?", choices: ["SAMO", "FAB 5", "DAZE", "RAMM"], correct: 0 },
  { question: "Keith Haring made early work in which NYC location?", choices: ["Brooklyn rooftops", "Subway stations", "Soho galleries", "Central Park"], correct: 1 },
  { question: "Shepard Fairey is famous for?", choices: ["The Obey campaign", "Lichtenstein dots", "Pop bubble portraits", "Mosaic tiles"], correct: 0 },
  { question: "JR is famous for?", choices: ["Tiny stickers", "Giant black-and-white photo paste-ups", "Spray-paint animals", "Light projections"], correct: 1 },
  { question: "Cornbread is widely credited as one of the first?", choices: ["NY taggers", "Philadelphia graffiti writers", "LA muralists", "London stencillers"], correct: 1 },
  { question: "TAKI 183 was a writer in?", choices: ["Philadelphia", "Chicago", "New York City", "Detroit"], correct: 2 },
  { question: "Style Wars (1983) is a documentary about?", choices: ["Hip hop battles", "NYC subway graffiti", "Skateboarders", "B-boys"], correct: 1 },
  { question: "The Bowery Wall mural site is in?", choices: ["Brooklyn", "Manhattan", "Queens", "The Bronx"], correct: 1 },
  { question: "5 Pointz was a famous graffiti site in?", choices: ["Brooklyn", "Long Island City (Queens)", "The Bronx", "Newark"], correct: 1 },
  { question: "Wynwood Walls are located in?", choices: ["LA", "Atlanta", "Miami", "Chicago"], correct: 2 },
  { question: "Lady Pink became famous as a teen writer in?", choices: ["LA", "NYC", "Berlin", "Tokyo"], correct: 1 },
  { question: "Os Gêmeos are twin artists from?", choices: ["Brazil", "Portugal", "Mexico", "Argentina"], correct: 0 },
  { question: "Invader is best known for using?", choices: ["Pixel mosaic tiles of game characters", "Gold leaf graffiti", "Throwies", "Foam tags"], correct: 0 },
  { question: "Blek le Rat is widely credited as the first?", choices: ["Wheatpaster", "Stencil artist (Paris)", "Tagger of trains", "Muralist of Berlin"], correct: 1 },
  { question: "ROA is famous for?", choices: ["Giant black-and-white animals", "Color portraits", "Word tags only", "3D stencils"], correct: 0 },
  { question: "POW! WOW! is a global mural festival started in?", choices: ["LA", "Honolulu", "Miami", "Dubai"], correct: 1 },
  { question: "Which Banksy work shredded itself in 2018 at auction?", choices: ["Flower Thrower", "Girl with Balloon", "Pulp Fiction", "Rage"], correct: 1 },
  { question: "Faith47 is a muralist from?", choices: ["South Africa", "Egypt", "Brazil", "Spain"], correct: 0 },
  { question: "Barry McGee was associated with which San Francisco scene?", choices: ["Mission School", "Beat poets", "MUNI culture", "Castro queer art"], correct: 0 },
  { question: "Vhils is known for?", choices: ["Carving into walls", "Light installations", "Roller graffiti", "Yarn bombing"], correct: 0 },
  { question: "Yarn bombing is?", choices: ["Crochet/knit street art", "Tag-style throwies", "Fence cutting", "Sticker slapping"], correct: 0 },
  { question: "Swoon is best known for?", choices: ["Wheatpastes of figures", "Roller bombs", "Throwies", "Stencils"], correct: 0 },
  { question: "Faile is a Brooklyn collective using?", choices: ["Mixed-media wheatpastes and prints", "Strict stencil work", "Throw-up tags only", "Sculpture only"], correct: 0 },
  { question: "Eduardo Kobra is a Brazilian muralist known for?", choices: ["Kaleidoscopic portraits", "Black/white animals", "Pop comic styles", "3D illusions"], correct: 0 },
  { question: "RETNA's signature is?", choices: ["A custom alphabet/script", "Stencils of icons", "Tags of rappers", "Pixel mosaics"], correct: 0 },
  { question: "Banksy's 2010 documentary was titled?", choices: ["Style Wars", "Beautiful Losers", "Exit Through the Gift Shop", "Bomb It"], correct: 2 },
  { question: "The Berlin Wall featured famous murals largely after?", choices: ["1961", "1989", "1990", "2000"], correct: 2 },
  { question: "DAZE rose to fame in?", choices: ["LA in the 90s", "NYC subway scene", "Berlin's RAW", "London's East End"], correct: 1 },
  { question: "FAB 5 FREDDY was central to which NYC scene?", choices: ["Punk", "Hip hop / graffiti crossover", "House", "Folk"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StreetArtQuizSettings): StreetArtQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreetArtQuizState, action: StreetArtQuizAction): StreetArtQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreetArtQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
