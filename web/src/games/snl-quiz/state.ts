import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SnlQuizSettings { questions: "10" | "20" | "30"; }
export interface SnlQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SnlQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year did Saturday Night Live premiere?", choices: ["1972", "1975", "1978", "1981"], correct: 1 },
  { question: "Who created Saturday Night Live?", choices: ["Lorne Michaels", "Dick Ebersol", "Brandon Tartikoff", "Steve Allen"], correct: 0 },
  { question: "Who hosted the very first SNL episode in October 1975?", choices: ["Richard Pryor", "George Carlin", "Robin Williams", "Steve Martin"], correct: 1 },
  { question: "Which SNL alum starred as 'Wayne' in Wayne's World?", choices: ["Dana Carvey", "Mike Myers", "Adam Sandler", "Phil Hartman"], correct: 1 },
  { question: "Who played 'Matt Foley, motivational speaker'?", choices: ["Chris Farley", "John Belushi", "Will Ferrell", "John Candy"], correct: 0 },
  { question: "Which sketch with Will Ferrell features the line 'I gotta have more cowbell'?", choices: ["Behind the Music", "More Cowbell", "BOC Tribute", "Studio 8H"], correct: 1 },
  { question: "Tina Fey became SNL head writer in what year?", choices: ["1995", "1999", "2002", "2005"], correct: 1 },
  { question: "Who played 'The Church Lady'?", choices: ["Mike Myers", "Dana Carvey", "Phil Hartman", "Jon Lovitz"], correct: 1 },
  { question: "Eddie Murphy joined the SNL cast in what year?", choices: ["1978", "1980", "1983", "1985"], correct: 1 },
  { question: "Who played the original Blues Brother 'Jake'?", choices: ["John Belushi", "Dan Aykroyd", "Bill Murray", "Chevy Chase"], correct: 0 },
  { question: "Who has hosted SNL the most times?", choices: ["Alec Baldwin", "Steve Martin", "John Goodman", "Tom Hanks"], correct: 1 },
  { question: "Andy Samberg co-founded which digital comedy group?", choices: ["The Lonely Island", "Tim and Eric", "Funny or Die", "CollegeHumor"], correct: 0 },
  { question: "Which musical guest ripped a photo of the Pope on SNL in 1992?", choices: ["Madonna", "Sinead O'Connor", "Pearl Jam", "Cypress Hill"], correct: 1 },
  { question: "Who famously impersonated Sarah Palin in 2008?", choices: ["Tina Fey", "Amy Poehler", "Kristen Wiig", "Maya Rudolph"], correct: 0 },
  { question: "Who played 'Stefon' on Weekend Update?", choices: ["Bill Hader", "Fred Armisen", "Andy Samberg", "Bobby Moynihan"], correct: 0 },
  { question: "Which cast member played 'Debbie Downer'?", choices: ["Rachel Dratch", "Cheri Oteri", "Molly Shannon", "Amy Poehler"], correct: 0 },
  { question: "Pete Davidson joined SNL in which year?", choices: ["2010", "2014", "2016", "2018"], correct: 1 },
  { question: "What is the famous opening line said before each show?", choices: ["It's Saturday Night!", "Live from New York, it's Saturday Night!", "And now, SNL!", "Welcome to 30 Rock!"], correct: 1 },
  { question: "Which Weekend Update anchor said 'I'm Chevy Chase, and you're not'?", choices: ["Chevy Chase", "Dennis Miller", "Norm Macdonald", "Jane Curtin"], correct: 0 },
  { question: "Who created and played 'The Coneheads' patriarch Beldar?", choices: ["Dan Aykroyd", "John Belushi", "Bill Murray", "Chevy Chase"], correct: 0 },
  { question: "Which two cast members played 'The Spartan Cheerleaders'?", choices: ["Will Ferrell and Cheri Oteri", "Adam Sandler and Chris Farley", "Mike Myers and Dana Carvey", "Jimmy Fallon and Horatio Sanz"], correct: 0 },
  { question: "Which SNL studio number is the show filmed in?", choices: ["6A", "8H", "1A", "30R"], correct: 1 },
  { question: "Norm Macdonald hosted which Weekend Update segment regular?", choices: ["Really!?!", "Weekend Update", "Update News", "30 Rock News"], correct: 1 },
  { question: "Which Lonely Island short featured Justin Timberlake in a holiday box?", choices: ["I'm on a Boat", "Dick in a Box", "Jack Sparrow", "YOLO"], correct: 1 },
  { question: "Who played 'Mango' the gay exotic dancer?", choices: ["Chris Kattan", "Jimmy Fallon", "Tracy Morgan", "Horatio Sanz"], correct: 0 },
  { question: "Which SNL alum starred in the film 'Anchorman'?", choices: ["Will Ferrell", "Adam Sandler", "Chris Farley", "Mike Myers"], correct: 0 },
  { question: "Eddie Murphy famously played which 'neighborhood' character?", choices: ["Mister Robinson", "Buckwheat", "Gumby", "All of these"], correct: 3 },
  { question: "Maya Rudolph is well known for impersonating which Vice President?", choices: ["Sarah Palin", "Kamala Harris", "Hillary Clinton", "Michelle Obama"], correct: 1 },
  { question: "Who created and played 'Mr. Bill', the clay figure?", choices: ["Walter Williams", "Lorne Michaels", "Al Franken", "Tom Davis"], correct: 0 },
  { question: "Which cast member starred in 2011's 'Bridesmaids' as the lead?", choices: ["Kristen Wiig", "Maya Rudolph", "Tina Fey", "Amy Poehler"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SnlQuizSettings): SnlQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SnlQuizState, action: SnlQuizAction): SnlQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SnlQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
