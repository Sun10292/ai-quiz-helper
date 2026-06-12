import { NextRequest, NextResponse } from 'next/server';
import getDeepseek from '@/lib/deepseek';
import { GenerateRequest, Question, QuestionType } from '@/types';

const SYSTEM_PROMPT = `你是一个专业的出题老师。根据用户提供的学科、主题、难度和题型，生成高质量的题目。

要求：
1. 题目必须准确、严谨，符合学科知识
2. 选择题必须提供4个选项（A/B/C/D），其中只有一个正确答案
3. 填空题用 "______" 表示空白处
4. 所有题目都必须提供详细的解析
5. 回答必须是严格的JSON格式，不要包含markdown代码块标记

请返回以下JSON格式（一个数组）：
[
  {
    "type": "choice",
    "question": "题目内容",
    "options": [
      {"label": "A", "text": "选项A内容"},
      {"label": "B", "text": "选项B内容"},
      {"label": "C", "text": "选项C内容"},
      {"label": "D", "text": "选项D内容"}
    ],
    "correctAnswer": "A",
    "explanation": "详细解析，解释为什么选这个答案"
  },
  {
    "type": "fill",
    "question": "题目内容，用______表示填空",
    "correctAnswer": "正确答案",
    "explanation": "详细解析"
  },
  {
    "type": "essay",
    "question": "题目内容",
    "reference": "参考答案要点",
    "explanation": "解题思路和关键点解析"
  }
]`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { subject, topic, difficulty, count, types } = body;

    if (!subject || !topic) {
      return NextResponse.json(
        { error: '请提供学科和主题' },
        { status: 400 }
      );
    }

    const typeDescriptions: Record<QuestionType, string> = {
      choice: '选择题（4个选项，单选）',
      fill: '填空题',
      essay: '简答/大题',
    };

    const typeList = (types || ['choice']).map(t => typeDescriptions[t]).join('、');

    const weakPointsPrompt = body.weakPointsPrompt || '';

    const userMessage = `请生成 ${count || 5} 道${subject}方面的题目：
- 主题：${topic}
- 难度：${difficulty || 'medium'}
- 题型：${typeList}
- 要求：题目要有代表性，覆盖该主题的核心知识点${weakPointsPrompt}`;

    const completion = await getDeepseek().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || '[]';

    // Parse the response - handle possible markdown code blocks
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let questions: Question[];
    try {
      questions = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: '生成题目解析失败，请重试', raw: content },
        { status: 500 }
      );
    }

    // Add metadata to each question
    const enrichedQuestions: Question[] = questions.map((q, i) => ({
      ...q,
      id: `q_${Date.now()}_${i}`,
      subject,
      topic,
      difficulty: difficulty || 'medium',
    }));

    return NextResponse.json({ questions: enrichedQuestions });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || '生成题目失败' },
      { status: 500 }
    );
  }
}
