'use client';

import { useState, useEffect } from 'react';
import { QuizSession } from '@/types';
import { getHistory, deleteSession, clearHistory } from '@/lib/storage';

interface HistoryPanelProps {
  onLoad: (session: QuizSession) => void;
  onClose: () => void;
}

export default function HistoryPanel({ onLoad, onClose }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setSessions(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleClear = () => {
    clearHistory();
    setSessions([]);
    setConfirmClear(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const difficultyLabel: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  const difficultyColor: Record<string, string> = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">📋 历史记录</h2>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              confirmClear ? (
                <>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    确认清空
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  清空全部
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">📭</span>
              <p>还没有做题记录</p>
              <p className="text-sm mt-1">完成一次练习后会自动保存</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => {
                const score = session.score ?? 0;
                const total = session.totalQuestions;
                const pct = Math.round((score / total) * 100);

                return (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onLoad(session)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {session.subject} · {session.topic}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[session.difficulty] || ''}`}>
                          {difficultyLabel[session.difficulty] || session.difficulty}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                          title="删除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className={`font-bold ${
                        pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score}/{total}（{pct}%）
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">
                        {total} 题 · {session.questions[0]?.type === 'choice' ? '选择题' : session.questions.map(q => q.type).filter((v, i, a) => a.indexOf(v) === i).join('/')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-center text-xs text-gray-400">
          点击记录可查看详情 · 数据保存在浏览器本地
        </div>
      </div>
    </div>
  );
}
