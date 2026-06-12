import { NextRequest, NextResponse } from 'next/server';
import getDeepseek from '@/lib/deepseek';
import { GenerateRequest, Question, QuestionType } from '@/types';

const SYSTEM_PROMPT = `你是一个专业的出题老师。根据用户提供的学科、主题、难度和题型，生成高质量的题目。

核心要求：
1. 题目必须准确、严谨，符合学科知识，不能有任何事实性错误
2. 选择题必须确保有且只有一个正确答案，其余三个选项必须是合理但错误的干扰项
3. 生成每道题后，请在心中验证答案的正确性——如果无法100%确定答案正确，不要出这道题
4. 填空题用 "______" 表示空白处
5. 所有题目都必须提供详细的解析
6. 回答必须是严格的JSON格式，不要包含markdown代码块标记

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
    "explanation": "逐步推理的详细解析，用逻辑证明为什么正确答案是对的、其他选项为什么错"
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
    const note = body.note || '';

    const notePrompt = note ? `\n\n【学生的额外要求】\n${note}\n请严格遵守以上要求出题。` : '';

    const userMessage = `请生成 ${count || 5} 道${subject}方面的题目：
- 主题：${topic}
- 难度：${difficulty || 'medium'}
- 题型：${typeList}
- 要求：题目要有代表性，覆盖该主题的核心知识点${weakPointsPrompt}${notePrompt}`;

    const completion = await getDeepseek().chat.completions.create({
      model: 'deepseek-v4-flash',
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
