import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OsQuizSettings { questions: "10" | "20" | "30"; }
export interface OsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created the Linux kernel in 1991?", choices: ["Linus Torvalds", "Richard Stallman", "Ken Thompson", "Bill Gates"], correct: 0 },
  { question: "Who are the principal creators of Unix at Bell Labs?", choices: ["Ken Thompson and Dennis Ritchie", "Linus Torvalds and Alan Cox", "Steve Wozniak and Steve Jobs", "Brian Kernighan and Bjarne Stroustrup"], correct: 0 },
  { question: "Where was Unix originally developed?", choices: ["MIT", "Bell Labs", "UC Berkeley", "Stanford"], correct: 1 },
  { question: "Who founded the GNU Project in 1983?", choices: ["Richard Stallman", "Linus Torvalds", "Donald Knuth", "Niklaus Wirth"], correct: 0 },
  { question: "Which OS family is Android primarily based on?", choices: ["Linux kernel", "BSD kernel", "Windows NT", "Mach"], correct: 0 },
  { question: "macOS is descended primarily from which family?", choices: ["BSD-derived (Darwin)", "Linux", "Windows NT", "MS-DOS"], correct: 0 },
  { question: "The Windows NT line was largely designed by whom?", choices: ["Dave Cutler", "Bill Gates", "Steve Ballmer", "Anders Hejlsberg"], correct: 0 },
  { question: "Which file system is the long-standing default on most modern Linux distributions?", choices: ["NTFS", "ext4", "HFS+", "FAT32"], correct: 1 },
  { question: "Which file system is native to modern Windows?", choices: ["NTFS", "ext4", "APFS", "ZFS"], correct: 0 },
  { question: "Which file system did Apple introduce as the default on macOS High Sierra?", choices: ["HFS+", "APFS", "ZFS", "exFAT"], correct: 1 },
  { question: "A 'kernel' in an OS is responsible for what?", choices: ["Rendering UI widgets", "Managing CPU, memory, and hardware access", "Compiling source code", "Hosting web pages"], correct: 1 },
  { question: "What does 'POSIX' refer to?", choices: ["A portable OS interface standard", "A processor architecture", "A type of file system", "A scripting language"], correct: 0 },
  { question: "Which scheduling algorithm prioritizes the shortest expected job next?", choices: ["FCFS", "Round Robin", "Shortest Job First", "Priority Aging"], correct: 2 },
  { question: "A 'page fault' occurs when what happens?", choices: ["A program references a page not in physical memory", "A CPU overheats", "A disk is full", "A user is denied access"], correct: 0 },
  { question: "Virtual memory primarily provides what?", choices: ["An address space larger than physical RAM via paging", "Faster CPU clocks", "Disk compression", "Encrypted storage"], correct: 0 },
  { question: "A deadlock requires which classic four conditions to hold?", choices: ["Mutual exclusion, hold-and-wait, no preemption, circular wait", "Paging, swapping, caching, prefetch", "Read, write, execute, append", "Fork, exec, wait, exit"], correct: 0 },
  { question: "Which command lists running processes on Linux?", choices: ["ls", "ps", "cd", "grep"], correct: 1 },
  { question: "Which signal is sent by default by 'kill <pid>' on Unix?", choices: ["SIGKILL", "SIGTERM", "SIGSTOP", "SIGHUP"], correct: 1 },
  { question: "Which signal cannot be caught or ignored?", choices: ["SIGTERM", "SIGINT", "SIGKILL", "SIGHUP"], correct: 2 },
  { question: "What is the role of init/systemd?", choices: ["Userland init system that starts and supervises services", "A bootloader stage 1", "A kernel module loader only", "A C compiler"], correct: 0 },
  { question: "Which is a popular Linux bootloader?", choices: ["GRUB", "BIND", "OpenSSH", "Samba"], correct: 0 },
  { question: "Which OS is primarily a real-time operating system used in embedded systems?", choices: ["VxWorks", "Windows 11", "macOS Ventura", "Ubuntu Desktop"], correct: 0 },
  { question: "CP/M, an influential early microcomputer OS, was created by whom?", choices: ["Gary Kildall", "Bill Gates", "Steve Wozniak", "Tim Paterson"], correct: 0 },
  { question: "MS-DOS was originally adapted from what?", choices: ["86-DOS (QDOS) by Tim Paterson", "Unix", "CP/M-86 directly", "OS/2"], correct: 0 },
  { question: "Which OS introduced the original Macintosh GUI in 1984?", choices: ["System Software 1.0 (Classic Mac OS)", "Lisa OS", "Windows 1.0", "NeXTSTEP"], correct: 0 },
  { question: "Which Unix variant from UC Berkeley produced sockets and the FFS?", choices: ["BSD", "System V", "HP-UX", "AIX"], correct: 0 },
  { question: "On Unix, the fork system call does what?", choices: ["Creates a new process by duplicating the caller", "Replaces the current process image", "Terminates a process", "Locks a file"], correct: 0 },
  { question: "On Unix, the execve system call does what?", choices: ["Replaces the current process image with a new program", "Forks a child process", "Sleeps the process", "Releases shared memory"], correct: 0 },
  { question: "Which is a microkernel-style kernel/OS?", choices: ["Linux", "Mach (and MINIX)", "FreeBSD", "Windows 95"], correct: 1 },
  { question: "Which company released OS/2 jointly with IBM in the late 1980s?", choices: ["Microsoft", "Apple", "Digital Research", "Novell"], correct: 0 },
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
