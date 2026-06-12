import { QuizSession } from '@/types';

const HISTORY_KEY = 'quiz_history';
const MAX_HISTORY = 50;

export function saveSession(session: QuizSession): void {
  try {
    const history = getHistory();
    const filtered = history.filter(s => s.id !== session.id);
    filtered.unshift(session);
    const trimmed = filtered.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full or unavailable
  }
}

export function getHistory(): QuizSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteSession(id: string): void {
  const history = getHistory().filter(s => s.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/** Analyze weak points from history — wrong questions grouped by subject+topic */
export interface WeakPoint {
  subject: string;
  topic: string;
  wrongCount: number;
  totalCount: number;
  lastWrongAt: string;
}

export function getWeakPoints(): WeakPoint[] {
  const sessions = getHistory();
  const map = new Map<string, WeakPoint>();

  for (const session of sessions) {
    const key = `${session.subject}|||${session.topic}`;
    const existing = map.get(key);
    const wrongAnswers = session.answers.filter(a => a.isCorrect === false);
    const wrongCount = wrongAnswers.length;
    const totalCount = session.answers.length;

    if (existing) {
      existing.wrongCount += wrongCount;
      existing.totalCount += totalCount;
      if (wrongCount > 0 && session.createdAt > existing.lastWrongAt) {
        existing.lastWrongAt = session.createdAt;
      }
    } else {
      map.set(key, {
        subject: session.subject,
        topic: session.topic,
        wrongCount,
        totalCount,
        lastWrongAt: session.createdAt,
      });
    }
  }

  // Filter to only those with wrong answers, sort by wrongCount desc
  return Array.from(map.values())
    .filter(wp => wp.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount);
}

/** Generate a weak-point summary text for the AI prompt */
export function getWeakPointsPrompt(): string {
  const weakPoints = getWeakPoints();
  if (weakPoints.length === 0) return '';

  const top5 = weakPoints.slice(0, 5);
  const lines = top5.map(wp =>
    `- ${wp.subject} · ${wp.topic}：错 ${wp.wrongCount} 题（共做 ${wp.totalCount} 题，错误率 ${Math.round((wp.wrongCount / wp.totalCount) * 100)}%）`
  );

  return `\n\n【学生薄弱环节】\n${lines.join('\n')}\n请针对这些薄弱知识点，适当增加相关题目的比重，帮助学生强化练习。`;
}
