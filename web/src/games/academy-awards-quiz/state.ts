import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AcademyAwardsQuizSettings { questions: "10" | "20"; }
export interface AcademyAwardsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AcademyAwardsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Academy Awards ceremony was held in?",
    "choices": [
      "1925",
      "1927",
      "1929",
      "1931"
    ],
    "correct": 2
  },
  {
    "question": "Who hosted the first ceremony?",
    "choices": [
      "Will Rogers",
      "Douglas Fairbanks",
      "Cecil B. DeMille",
      "Frank Capra"
    ],
    "correct": 1
  },
  {
    "question": "Best Picture winner of 1939?",
    "choices": [
      "Gone with the Wind",
      "Wizard of Oz",
      "Mr. Smith",
      "Stagecoach"
    ],
    "correct": 0
  },
  {
    "question": "First color film to win Best Picture?",
    "choices": [
      "Wizard of Oz",
      "Gone with the Wind",
      "Snow White",
      "Drums Along Mohawk"
    ],
    "correct": 1
  },
  {
    "question": "Walt Disney's record total Oscars?",
    "choices": [
      "18",
      "22",
      "26",
      "30"
    ],
    "correct": 1
  },
  {
    "question": "First African American to win Best Actor?",
    "choices": [
      "Sidney Poitier",
      "Denzel Washington",
      "Morgan Freeman",
      "James Earl Jones"
    ],
    "correct": 0
  },
  {
    "question": "Sidney Poitier won Best Actor for?",
    "choices": [
      "In the Heat of the Night",
      "Lilies of the Field",
      "To Sir with Love",
      "Guess Who's Coming"
    ],
    "correct": 1
  },
  {
    "question": "Most Best Director wins by one person?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Director with 4 Best Director wins?",
    "choices": [
      "Wyler",
      "Capra",
      "Ford",
      "Spielberg"
    ],
    "correct": 2
  },
  {
    "question": "Best Picture 1972?",
    "choices": [
      "The Godfather",
      "Cabaret",
      "Deliverance",
      "Sounder"
    ],
    "correct": 0
  },
  {
    "question": "Best Picture 1994?",
    "choices": [
      "Pulp Fiction",
      "Forrest Gump",
      "Shawshank",
      "Quiz Show"
    ],
    "correct": 1
  },
  {
    "question": "Best Picture 1997?",
    "choices": [
      "Titanic",
      "L.A. Confidential",
      "Good Will Hunting",
      "As Good as It Gets"
    ],
    "correct": 0
  },
  {
    "question": "Most acting Oscar nominations?",
    "choices": [
      "Streep",
      "Hepburn",
      "Davis",
      "Nicholson"
    ],
    "correct": 0
  },
  {
    "question": "Most Best Actress wins?",
    "choices": [
      "Streep",
      "Katharine Hepburn",
      "Bette Davis",
      "Frances McDormand"
    ],
    "correct": 1
  },
  {
    "question": "Katharine Hepburn's Best Actress wins?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Best Actor record holders with 3 wins?",
    "choices": [
      "Day-Lewis",
      "Brando",
      "Pacino",
      "Hanks"
    ],
    "correct": 0
  },
  {
    "question": "First foreign language film to win Best Picture?",
    "choices": [
      "Roma",
      "Parasite",
      "Amour",
      "Crouching Tiger"
    ],
    "correct": 1
  },
  {
    "question": "Parasite won Best Picture in?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 2
  },
  {
    "question": "First woman to win Best Director?",
    "choices": [
      "Sofia Coppola",
      "Kathryn Bigelow",
      "Jane Campion",
      "Greta Gerwig"
    ],
    "correct": 1
  },
  {
    "question": "Bigelow won Best Director for?",
    "choices": [
      "Zero Dark Thirty",
      "The Hurt Locker",
      "Point Break",
      "Strange Days"
    ],
    "correct": 1
  },
  {
    "question": "Movie with most Oscars (tied at 11)?",
    "choices": [
      "Ben-Hur",
      "Titanic",
      "LOTR: Return of the King",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "LOTR: Return of the King's Oscar record?",
    "choices": [
      "10/10",
      "11/11",
      "12/12",
      "9/11"
    ],
    "correct": 1
  },
  {
    "question": "First X-rated film to win Best Picture?",
    "choices": [
      "A Clockwork Orange",
      "Midnight Cowboy",
      "Last Tango",
      "Taxi Driver"
    ],
    "correct": 1
  },
  {
    "question": "Best Picture 1942 about an Englishwoman in WWII?",
    "choices": [
      "Random Harvest",
      "Mrs. Miniver",
      "How Green Was My Valley",
      "Casablanca"
    ],
    "correct": 1
  },
  {
    "question": "Best Picture 1942/43 release set in Morocco?",
    "choices": [
      "Casablanca",
      "Algiers",
      "Sahara",
      "Five Graves to Cairo"
    ],
    "correct": 0
  },
  {
    "question": "Hattie McDaniel was first Black Oscar winner for?",
    "choices": [
      "Imitation of Life",
      "Gone with the Wind",
      "Show Boat",
      "Pinky"
    ],
    "correct": 1
  },
  {
    "question": "Best Animated Feature was created in?",
    "choices": [
      "1995",
      "1998",
      "2001",
      "2003"
    ],
    "correct": 2
  },
  {
    "question": "First Best Animated Feature winner?",
    "choices": [
      "Toy Story",
      "Shrek",
      "Monsters Inc.",
      "Finding Nemo"
    ],
    "correct": 1
  },
  {
    "question": "EGOT means winning Emmy, Grammy, Oscar and?",
    "choices": [
      "Tony",
      "Saturn",
      "BAFTA",
      "Golden Globe"
    ],
    "correct": 0
  },
  {
    "question": "Oscar statuette's official name?",
    "choices": [
      "Academy Award of Merit",
      "Hollywood Trophy",
      "Golden Knight",
      "Silver Sword"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AcademyAwardsQuizSettings): AcademyAwardsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AcademyAwardsQuizState, action: AcademyAwardsQuizAction): AcademyAwardsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AcademyAwardsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
