'use client';

import { useState } from 'react';
import { Difficulty, QuestionType } from '@/types';

interface SetupFormProps {
  onStart: (config: {
    subject: string;
    topic: string;
    difficulty: Difficulty;
    count: number;
    types: QuestionType[];
    weakPointsPrompt?: string;
  }) => void;
  loading: boolean;
  hasHistory: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: '简单', color: 'bg-green-500' },
  { value: 'medium', label: '中等', color: 'bg-yellow-500' },
  { value: 'hard', label: '困难', color: 'bg-red-500' },
];

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'choice', label: '选择题', icon: '📝' },
  { value: 'fill', label: '填空题', icon: '✏️' },
  { value: 'essay', label: '大题', icon: '📄' },
];

export default function SetupForm({ onStart, loading }: SetupFormProps) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [isRandom, setIsRandom] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(5);
  const [types, setTypes] = useState<QuestionType[]>(['choice']);

  const toggleType = (type: QuestionType) => {
    setTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = isRandom ? '随机（从该课程中任意选择知识点）' : topic.trim();
    if (!subject.trim() || (!isRandom && !topic.trim()) || types.length === 0) return;
    onStart({ subject: subject.trim(), topic: finalTopic, difficulty, count, types });
  };

  const isValid = subject.trim() && (isRandom || topic.trim()) && types.length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">📚 学科 / 课程名称</label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="例如：高等数学、大学物理、数据结构、宏观经济学..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">🎯 主题 / 知识点</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={e => { setTopic(e.target.value); setIsRandom(false); }}
            placeholder="例如：拉格朗日中值定理、B+树插入删除、IS-LM模型..."
            disabled={isRandom}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            type="button"
            onClick={() => { setIsRandom(!isRandom); if (!isRandom) setTopic(''); }}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              isRandom
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎲 随机
          </button>
        </div>
        {isRandom && (
          <p className="text-xs text-indigo-500 mt-1">AI 将从该课程中随机选择知识点出题，覆盖范围更广</p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">📊 难度</label>
        <div className="flex gap-3">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                difficulty === d.value
                  ? `${d.color} text-white shadow-md`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">📋 题型（可多选）</label>
        <div className="flex gap-3">
          {QUESTION_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleType(t.value)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                types.includes(t.value)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔢 题目数量：<span className="text-indigo-600 font-bold text-lg">{count}</span> 道
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 正在出题中...
          </span>
        ) : (
          '🚀 开始生成题目'
        )}
      </button>
    </form>
  );
}
