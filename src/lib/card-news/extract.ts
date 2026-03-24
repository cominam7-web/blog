// Gemini API를 사용하여 블로그 본문에서 카드뉴스용 핵심 포인트를 추출

export interface ExtractedPoints {
  points: { title: string; detail: string; imagePrompt: string }[];
  intro: string;
  coverImagePrompt: string;
}

export async function extractKeyPoints(
  postTitle: string,
  content: string,
  pointCount: number = 4
): Promise<ExtractedPoints> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const prompt = `다음 블로그 글에서 인스타그램 카드뉴스용 데이터를 추출해줘.

규칙:
- intro: 독자의 관심을 끄는 도입부 문장 (40자 이내)
- coverImagePrompt: 표지 배경 일러스트를 위한 영어 프롬프트 (글 주제를 상징하는 미니멀한 일러스트, 예: "minimalist illustration of money savings with piggy bank and coins, flat design, warm colors")
- points: 핵심 포인트 ${pointCount}개
  - title: 15자 이내 핵심 키워드
  - detail: 60자 이내 설명
  - imagePrompt: 이 포인트를 상징하는 영어 일러스트 프롬프트 (미니멀 플랫 디자인)
- 반드시 JSON 형식으로만 응답

응답 형식:
{"intro":"도입부","coverImagePrompt":"cover illustration prompt","points":[{"title":"키워드","detail":"설명","imagePrompt":"illustration prompt"}]}

글 제목: ${postTitle}

본문:
${content.slice(0, 3000)}`;

  const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Gemini extract error:', res.status, errText);
    throw new Error(`Gemini API failed: ${res.status}`);
  }

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  try {
    const parsed = JSON.parse(text);
    if (parsed.points && Array.isArray(parsed.points)) {
      return {
        points: parsed.points.slice(0, pointCount),
        intro: parsed.intro || '',
        coverImagePrompt: parsed.coverImagePrompt || '',
      };
    }
    throw new Error('Invalid response structure');
  } catch (e) {
    const match = text.match(/\{[\s\S]*"points"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        points: parsed.points.slice(0, pointCount),
        intro: parsed.intro || '',
        coverImagePrompt: parsed.coverImagePrompt || '',
      };
    }
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to extract key points');
  }
}
