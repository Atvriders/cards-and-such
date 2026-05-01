import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StandUpComedyQuizSettings { questions: "10" | "20" | "30"; }
export interface StandUpComedyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StandUpComedyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is widely considered 'The King of Late Night' stand-up?", choices: ["Johnny Carson", "David Letterman", "Jay Leno", "Conan O'Brien"], correct: 0 },
  { question: "Which comedian created 'Seinfeld' with Larry David?", choices: ["Jerry Seinfeld", "Jay Leno", "Ray Romano", "Bill Maher"], correct: 0 },
  { question: "Whose 1979 stand-up film 'Live in Concert' was groundbreaking?", choices: ["Richard Pryor", "George Carlin", "Eddie Murphy", "Steve Martin"], correct: 0 },
  { question: "George Carlin's famous routine listed how many words you can't say on TV?", choices: ["Seven", "Five", "Ten", "Twelve"], correct: 0 },
  { question: "Eddie Murphy's 1987 concert film is called?", choices: ["Raw", "Delirious", "Comedy Central", "Live"], correct: 0 },
  { question: "Which comedian's HBO special 'Bring the Pain' aired in 1996?", choices: ["Chris Rock", "Dave Chappelle", "Bernie Mac", "Cedric the Entertainer"], correct: 0 },
  { question: "Who hosts 'Comedians in Cars Getting Coffee'?", choices: ["Jerry Seinfeld", "Larry David", "Ray Romano", "Jeff Garlin"], correct: 0 },
  { question: "Robin Williams was famous for his work in clubs in which city?", choices: ["San Francisco", "Los Angeles", "New York", "Chicago"], correct: 0 },
  { question: "Who pioneered observational comedy and was nicknamed 'The Great One' for one-liners?", choices: ["Rodney Dangerfield", "Henny Youngman", "Jackie Mason", "Don Rickles"], correct: 0 },
  { question: "Rodney Dangerfield's famous catchphrase?", choices: ["No respect", "Take my wife", "Why I oughta", "What's the deal"], correct: 0 },
  { question: "Who wrote and starred in 'Nanette' (2018)?", choices: ["Hannah Gadsby", "Tig Notaro", "Maria Bamford", "Wanda Sykes"], correct: 0 },
  { question: "Dave Chappelle's controversial Netflix special in 2021 was?", choices: ["The Closer", "Sticks & Stones", "Equanimity", "Deep in the Heart of Texas"], correct: 0 },
  { question: "Which comedian wrote 'The Vagina Monologues'?", choices: ["Eve Ensler", "Margaret Cho", "Sarah Silverman", "Wanda Sykes"], correct: 0 },
  { question: "Steve Martin's signature stand-up persona prop?", choices: ["Arrow through the head", "A red nose", "A fake cigar", "A magic wand"], correct: 0 },
  { question: "Lenny Bruce was prosecuted for which kind of comedy?", choices: ["Obscenity", "Libel", "Sedition", "Treason"], correct: 0 },
  { question: "Who founded the Improv comedy club chain in 1963?", choices: ["Budd Friedman", "Mitzi Shore", "Joe Piscopo", "Bob Newhart"], correct: 0 },
  { question: "The Comedy Store in LA was opened by?", choices: ["Mitzi Shore", "Sammy Shore", "Both", "Lorne Michaels"], correct: 2 },
  { question: "Who is known for 'Killin' Them Softly' (2000) special?", choices: ["Dave Chappelle", "Chris Rock", "Bernie Mac", "Eddie Murphy"], correct: 0 },
  { question: "Bo Burnham's pandemic Netflix special is called?", choices: ["Inside", "Make Happy", "what.", "Words Words Words"], correct: 0 },
  { question: "Who is the host of 'Last Week Tonight'?", choices: ["John Oliver", "Trevor Noah", "Samantha Bee", "Bill Maher"], correct: 0 },
  { question: "Mitch Hedberg was famous for?", choices: ["One-liners", "Storytelling", "Crowd work", "Music comedy"], correct: 0 },
  { question: "Which comedian's nickname was 'Mr. Warmth'?", choices: ["Don Rickles", "Buddy Hackett", "Jackie Mason", "Joan Rivers"], correct: 0 },
  { question: "Joan Rivers' catchphrase?", choices: ["Can we talk?", "Oh please", "Let me tell ya", "I kid you not"], correct: 0 },
  { question: "Who is known for 'Bigger & Blacker' HBO special (1999)?", choices: ["Chris Rock", "Dave Chappelle", "Eddie Murphy", "DL Hughley"], correct: 0 },
  { question: "Bill Hicks' famous character 'Goat Boy' came from?", choices: ["Bill Hicks", "Mitch Hedberg", "Sam Kinison", "Bill Burr"], correct: 0 },
  { question: "Who wrote 'Yes Please' and starred on Parks and Rec?", choices: ["Amy Poehler", "Tina Fey", "Mindy Kaling", "Maya Rudolph"], correct: 0 },
  { question: "Whose Netflix special is 'Tamborine' (2018)?", choices: ["Chris Rock", "Dave Chappelle", "Kevin Hart", "Bill Burr"], correct: 0 },
  { question: "Kevin Hart sold out which famous LA venue?", choices: ["The Forum", "Hollywood Bowl", "Madison Square Garden", "Staples Center"], correct: 0 },
  { question: "Who is known for 'Killin' the Chuckle' and was nicknamed Lord of the Manor?", choices: ["George Carlin", "Bill Maher", "Lewis Black", "Lewis CK"], correct: 0 },
  { question: "What annual stand-up festival is held in Montreal?", choices: ["Just for Laughs", "Edinburgh Fringe", "Comedy Cellar", "Aspen Comedy"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StandUpComedyQuizSettings): StandUpComedyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StandUpComedyQuizState, action: StandUpComedyQuizAction): StandUpComedyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StandUpComedyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
