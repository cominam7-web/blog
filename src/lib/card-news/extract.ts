// Gemini API를 사용하여 블로그 본문에서 카드뉴스용 핵심 포인트를 추출

export interface ExtractedPoints {
  points: { title: string; detail: string }[];
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

  const prompt = `다음 블로그 글에서 인스타그램 카드뉴스용 핵심 포인트 ${pointCount}개를 추출해줘.

규칙:
- 각 포인트는 title(15자 이내, 한 줄 핵심 키워드)과 detail(60자 이내, 설명)로 구성
- 독자가 궁금해할 만한 순서로 정렬
- 글의 가장 유용한 정보를 담기
- 반드시 JSON 형식으로만 응답 (다른 텍스트 없이)

응답 형식:
{"points":[{"title":"핵심 키워드","detail":"상세 설명"}]}

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
      return { points: parsed.points.slice(0, pointCount) };
    }
    throw new Error('Invalid response structure');
  } catch (e) {
    // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
    const match = text.match(/\{[\s\S]*"points"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { points: parsed.points.slice(0, pointCount) };
    }
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Failed to extract key points');
  }
}
