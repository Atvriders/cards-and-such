import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Nineteen20sQuizSettings { questions: "10" | "15"; }
export interface Nineteen20sQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Nineteen20sQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "What U.S. Constitutional amendment banned alcohol in 1920?",
    "choices": [
      "17th",
      "18th",
      "19th",
      "20th"
    ],
    "correct": 1
  },
  {
    "question": "Who flew solo across the Atlantic in 1927?",
    "choices": [
      "Amelia Earhart",
      "Charles Lindbergh",
      "Wright Brothers",
      "Howard Hughes"
    ],
    "correct": 1
  },
  {
    "question": "Which novel by F. Scott Fitzgerald was published in 1925?",
    "choices": [
      "The Sun Also Rises",
      "The Great Gatsby",
      "Tender Is the Night",
      "This Side of Paradise"
    ],
    "correct": 1
  },
  {
    "question": "What was the cultural movement among Black Americans in 1920s New York?",
    "choices": [
      "Harlem Renaissance",
      "Bronx Boom",
      "Manhattan Movement",
      "Brooklyn Beat"
    ],
    "correct": 0
  },
  {
    "question": "What dance, full of kicks, defined the 1920s?",
    "choices": [
      "Foxtrot",
      "Charleston",
      "Lindy Hop",
      "Tango"
    ],
    "correct": 1
  },
  {
    "question": "The 19th Amendment, ratified in 1920, granted whom the right to vote?",
    "choices": [
      "18-year-olds",
      "Native Americans",
      "Women",
      "African Americans"
    ],
    "correct": 2
  },
  {
    "question": "Which baseball star hit 60 home runs in 1927?",
    "choices": [
      "Lou Gehrig",
      "Ty Cobb",
      "Babe Ruth",
      "Joe DiMaggio"
    ],
    "correct": 2
  },
  {
    "question": "What 1929 event triggered the Great Depression?",
    "choices": [
      "Pearl Harbor",
      "Stock Market Crash",
      "Dust Bowl",
      "Spanish Flu"
    ],
    "correct": 1
  },
  {
    "question": "Who was the gangster king of Chicago bootlegging?",
    "choices": [
      "Lucky Luciano",
      "Al Capone",
      "John Dillinger",
      "Bugs Moran"
    ],
    "correct": 1
  },
  {
    "question": "The first sound (talkie) feature film, 1927, was?",
    "choices": [
      "Metropolis",
      "The Jazz Singer",
      "Steamboat Willie",
      "Nosferatu"
    ],
    "correct": 1
  },
  {
    "question": "Calvin Coolidge's nickname was?",
    "choices": [
      "Silent Cal",
      "Honest Cal",
      "Lightning Cal",
      "Rough Cal"
    ],
    "correct": 0
  },
  {
    "question": "Which famous 1920s trial debated teaching evolution?",
    "choices": [
      "Lindbergh Trial",
      "Scopes Monkey Trial",
      "Sacco-Vanzetti",
      "Leopold Loeb"
    ],
    "correct": 1
  },
  {
    "question": "Who composed 'Rhapsody in Blue' in 1924?",
    "choices": [
      "Cole Porter",
      "George Gershwin",
      "Irving Berlin",
      "Duke Ellington"
    ],
    "correct": 1
  },
  {
    "question": "Which short, knee-baring fashion defined 1920s women?",
    "choices": [
      "Hoop skirt",
      "Flapper dress",
      "Bustle gown",
      "A-line"
    ],
    "correct": 1
  },
  {
    "question": "Walt Disney's first synchronized-sound cartoon (1928) starred whom?",
    "choices": [
      "Donald Duck",
      "Mickey Mouse",
      "Goofy",
      "Oswald"
    ],
    "correct": 1
  },
  {
    "question": "Which Egyptian pharaoh's tomb was opened by Howard Carter in 1922?",
    "choices": [
      "Ramses II",
      "Tutankhamun",
      "Khufu",
      "Akhenaten"
    ],
    "correct": 1
  },
  {
    "question": "Penicillin was discovered in 1928 by whom?",
    "choices": [
      "Louis Pasteur",
      "Alexander Fleming",
      "Jonas Salk",
      "Robert Koch"
    ],
    "correct": 1
  },
  {
    "question": "Which 1920s craze had owners marking down each 'flag-pole' minute?",
    "choices": [
      "Marathon dancing",
      "Flagpole sitting",
      "Goldfish swallowing",
      "Phone booth stuffing"
    ],
    "correct": 1
  },
  {
    "question": "Which Italian dictator took power in 1922?",
    "choices": [
      "Hitler",
      "Franco",
      "Mussolini",
      "Stalin"
    ],
    "correct": 2
  },
  {
    "question": "Who became Soviet leader after Lenin's 1924 death?",
    "choices": [
      "Trotsky",
      "Stalin",
      "Kamenev",
      "Khrushchev"
    ],
    "correct": 1
  },
  {
    "question": "Which 1925 Chaplin film features a dance with bread rolls?",
    "choices": [
      "Modern Times",
      "City Lights",
      "The Gold Rush",
      "The Kid"
    ],
    "correct": 2
  },
  {
    "question": "What name describes 1920s women defying traditional norms?",
    "choices": [
      "Suffragettes",
      "Flappers",
      "Bobby-soxers",
      "Beatniks"
    ],
    "correct": 1
  },
  {
    "question": "Which constitutional amendment legalized federal income tax in earlier years and stayed in force?",
    "choices": [
      "13th",
      "16th",
      "21st",
      "22nd"
    ],
    "correct": 1
  },
  {
    "question": "Who painted 'American Gothic'? (1930, but the artist rose in the 1920s)",
    "choices": [
      "Edward Hopper",
      "Grant Wood",
      "Norman Rockwell",
      "Georgia O'Keeffe"
    ],
    "correct": 1
  },
  {
    "question": "Which 1924 Olympics, held in Paris, was depicted in 'Chariots of Fire'?",
    "choices": [
      "Summer",
      "Winter",
      "Both",
      "Neither"
    ],
    "correct": 0
  },
  {
    "question": "The 1925 'Great Gatsby' is set on which fictional Long Island areas?",
    "choices": [
      "East and West Egg",
      "North and South Bay",
      "Upper and Lower Sound",
      "Pine and Oak Hills"
    ],
    "correct": 0
  },
  {
    "question": "Which radio network began broadcasting in 1926?",
    "choices": [
      "CBS",
      "NBC",
      "ABC",
      "Mutual"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'The Sun Also Rises' in 1926?",
    "choices": [
      "F. Scott Fitzgerald",
      "Ernest Hemingway",
      "John Steinbeck",
      "William Faulkner"
    ],
    "correct": 1
  },
  {
    "question": "What insulin discovery year (Banting & Best) saved diabetics?",
    "choices": [
      "1919",
      "1921",
      "1925",
      "1928"
    ],
    "correct": 1
  },
  {
    "question": "Which Russian-born composer premiered 'Rite of Spring' earlier and remained famous in the 1920s?",
    "choices": [
      "Prokofiev",
      "Stravinsky",
      "Rachmaninoff",
      "Shostakovich"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Nineteen20sQuizSettings): Nineteen20sQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Nineteen20sQuizState, action: Nineteen20sQuizAction): Nineteen20sQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Nineteen20sQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
