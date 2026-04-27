import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OsQuizSettings { questions: "10" | "20" | "30"; }
export interface OsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created the Linux kernel?", choices: ["Linus Torvalds", "Richard Stallman", "Ken Thompson", "Bill Gates"], correct: 0 },
  { question: "Who created Unix?", choices: ["Thompson and Ritchie", "Linus Torvalds", "Steve Wozniak", "Bjarne Stroustrup"], correct: 0 },
  { question: "Where was Unix invented?", choices: ["MIT", "Bell Labs", "Berkeley", "Stanford"], correct: 1 },
  { question: "Who founded the GNU Project?", choices: ["Stallman", "Torvalds", "Knuth", "Wirth"], correct: 0 },
  { question: "What does GNU stand for?", choices: ["GNU's Not Unix", "Great New Unix", "General Network Utility", "Guarded Native Unit"], correct: 0 },
  { question: "Which is a popular Linux distribution?", choices: ["Ubuntu", "ChromeOS", "Both", "Both (and many more)"], correct: 3 },
  { question: "What command lists files in Unix?", choices: ["dir", "list", "ls", "show"], correct: 2 },
  { question: "What is a kernel?", choices: ["Application", "Core OS managing hardware", "User shell", "File system"], correct: 1 },
  { question: "Which OS was based on NeXTSTEP?", choices: ["Windows", "macOS", "Linux", "Solaris"], correct: 1 },
  { question: "Which Microsoft OS preceded Windows 95?", choices: ["Windows 3.1/MS-DOS", "Windows NT", "Windows 98", "Windows 2000"], correct: 0 },
  { question: "What year did Windows 95 release?", choices: ["1990", "1995", "1998", "2000"], correct: 1 },
  { question: "Which is Apple's mobile OS?", choices: ["iOS", "Android", "WebOS", "Symbian"], correct: 0 },
  { question: "Which is Google's mobile OS?", choices: ["iOS", "Android", "Windows Phone", "Symbian"], correct: 1 },
  { question: "What kernel does Android use?", choices: ["Linux", "BSD", "NT", "Mach"], correct: 0 },
  { question: "What does POSIX define?", choices: ["OS API standards", "Network protocol", "File format", "Encryption"], correct: 0 },
  { question: "What is bash?", choices: ["Web browser", "Unix shell", "Compiler", "Editor"], correct: 1 },
  { question: "Which is a process scheduler concept?", choices: ["Round Robin", "Round File", "Linear Square", "Cluster Pool"], correct: 0 },
  { question: "Which file system does Windows use today?", choices: ["NTFS", "ext4", "HFS+", "ZFS"], correct: 0 },
  { question: "Which file system is default on macOS today?", choices: ["HFS+", "APFS", "ext4", "NTFS"], correct: 1 },
  { question: "What does PID mean?", choices: ["Process ID", "Personal ID", "Page Index", "Privilege ID"], correct: 0 },
  { question: "Which Linux distro is known for stability and Debian-base?", choices: ["Ubuntu", "Fedora", "Arch", "Slackware"], correct: 0 },
  { question: "Which Linux distro is rolling release and minimalist?", choices: ["Ubuntu", "Fedora", "Arch", "Mint"], correct: 2 },
  { question: "Which OS family is FreeBSD part of?", choices: ["BSD Unix", "Linux", "Windows", "Solaris"], correct: 0 },
  { question: "What does VFS stand for?", choices: ["Virtual File System", "Verified File Storage", "Volume File Setup", "Variable File Selector"], correct: 0 },
  { question: "Which package manager is for Debian?", choices: ["apt", "yum", "pacman", "brew"], correct: 0 },
  { question: "Which package manager is for Red Hat / Fedora?", choices: ["apt", "yum/dnf", "pacman", "brew"], correct: 1 },
  { question: "What is the Windows command prompt also called?", choices: ["bash", "cmd.exe", "csh", "tcsh"], correct: 1 },
  { question: "What does the 'sudo' command do?", choices: ["Save document", "Run as superuser", "Show users", "Set up domain"], correct: 1 },
  { question: "Which Apple OS preceded macOS?", choices: ["System 7", "Classic Mac OS", "Both (Mac OS Classic)", "iOS"], correct: 2 },
  { question: "Which OS is open-source like Linux?", choices: ["Windows 11", "macOS", "FreeBSD", "Solaris (proprietary)"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OsQuizSettings): OsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OsQuizState, action: OsQuizAction): OsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
