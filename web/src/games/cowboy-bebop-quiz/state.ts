import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CowboyBebopQuizSettings { questions: "10" | "20"; }
export interface CowboyBebopQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CowboyBebopQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The protagonist of Cowboy Bebop is?", choices: ["Spike Spiegel", "Jet Black", "Faye Valentine", "Vicious"], correct: 0 },
  { question: "Spike's ship is named?", choices: ["Swordfish II", "Hammerhead", "Red Tail", "Bebop"], correct: 0 },
  { question: "Jet's ship/the crew's main vessel?", choices: ["Bebop", "Swordfish", "Red Tail", "Hammerhead"], correct: 0 },
  { question: "Faye Valentine pilots?", choices: ["Red Tail", "Swordfish", "Hammerhead", "Bebop"], correct: 0 },
  { question: "The crew's onboard 'data dog' is?", choices: ["Ein", "Ed", "Tomato", "Punch"], correct: 0 },
  { question: "Ein's breed is?", choices: ["Welsh Corgi", "Beagle", "Dachshund", "Husky"], correct: 0 },
  { question: "Edward (Ed) is famously a?", choices: ["Genius hacker child", "Pilot", "Doctor", "Cook"], correct: 0 },
  { question: "Spike's nemesis throughout the series?", choices: ["Vicious", "Andy", "Pierrot Le Fou", "Mad Pierrot"], correct: 0 },
  { question: "The criminal syndicate Spike belonged to?", choices: ["Red Dragon", "Blue Lotus", "White Tiger", "Black Sun"], correct: 0 },
  { question: "The series director is?", choices: ["Shinichiro Watanabe", "Hideaki Anno", "Mamoru Oshii", "Satoshi Kon"], correct: 0 },
  { question: "Composer of the music?", choices: ["Yoko Kanno", "Joe Hisaishi", "Kenji Kawai", "Shiro Sagisu"], correct: 0 },
  { question: "The opening theme is titled?", choices: ["Tank!", "The Real Folk Blues", "Cosmic Dare", "Space Lion"], correct: 0 },
  { question: "The closing theme is titled?", choices: ["The Real Folk Blues", "Tank!", "Blue", "Space Lion"], correct: 0 },
  { question: "The series first aired in?", choices: ["1998", "1995", "2000", "1992"], correct: 0 },
  { question: "Jet's prosthetic is on his?", choices: ["Right arm", "Left arm", "Right leg", "Left eye"], correct: 0 },
  { question: "Spike's hometown was?", choices: ["Mars", "Earth", "Ganymede", "Europa"], correct: 0 },
  { question: "Jet was formerly a?", choices: ["ISSP officer", "Doctor", "Smuggler", "Astronaut"], correct: 0 },
  { question: "Faye is in massive debt due to?", choices: ["Cryogenic medical bills", "Gambling", "Taxes", "A loan shark"], correct: 0 },
  { question: "The series total episode count is?", choices: ["26", "24", "13", "52"], correct: 0 },
  { question: "Vicious wields a?", choices: ["Katana", "Pistol", "Whip", "Axe"], correct: 0 },
  { question: "Spike lost his eye in a fight with?", choices: ["Vicious", "Pierrot Le Fou", "Mad Pierrot", "Andy"], correct: 0 },
  { question: "Setting year of Cowboy Bebop?", choices: ["2071", "2050", "3000", "2199"], correct: 0 },
  { question: "Earth's surface is uninhabitable due to?", choices: ["Hyperspace gate accident", "Nuclear war", "Climate change", "Plague"], correct: 0 },
  { question: "Spike's signature martial art?", choices: ["Jeet Kune Do", "Karate", "Kung Fu", "Aikido"], correct: 0 },
  { question: "Julia is whose love interest?", choices: ["Spike", "Jet", "Vicious", "Both Spike and Vicious"], correct: 3 },
  { question: "Bounty hunters in the series are called?", choices: ["Cowboys", "Hunters", "Bounty boys", "Reapers"], correct: 0 },
  { question: "The film 'Cowboy Bebop: Knockin' on Heaven's Door' is set?", choices: ["Between episodes 22 and 23", "After ep 26", "Before ep 1", "Standalone"], correct: 0 },
  { question: "Big Shot is an in-universe?", choices: ["Bounty hunter TV show", "Pop song", "Sports league", "Fast food chain"], correct: 0 },
  { question: "The final episode is titled?", choices: ["The Real Folk Blues Part II", "Asteroid Blues", "Bohemian Rhapsody", "Cowboy Funk"], correct: 0 },
  { question: "Spike's catchphrase involves saying?", choices: ["Bang", "Whatever", "See ya", "Later"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CowboyBebopQuizSettings): CowboyBebopQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CowboyBebopQuizState, action: CowboyBebopQuizAction): CowboyBebopQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CowboyBebopQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
