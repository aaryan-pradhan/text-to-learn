// Prompt templates (Milestone 8). Both demand raw JSON so the reply can be parsed directly.

function generateCoursePrompt(topic) {
  return `You are an expert curriculum designer. Create a course on: "${topic}".
Progress from foundational to advanced concepts and cover the essential subtopics.

Return ONLY raw JSON (no markdown, no extra text) in exactly this shape:
{
  "title": "Course title",
  "description": "2-3 sentence course description",
  "tags": ["tag1", "tag2", "tag3"],
  "modules": [
    { "title": "Module title", "lessons": ["Lesson title", "Lesson title", "Lesson title"] }
  ]
}
Rules: 3 to 6 modules; each module has 3 to 5 lesson titles.`;
}

function generateLessonPrompt(course, module, lesson) {
  return `You are an expert teacher writing one lesson.
Course: "${course}"
Module: "${module}"
Lesson: "${lesson}"

Return ONLY raw JSON (no markdown, no extra text) in exactly this shape:
{
  "title": "${lesson}",
  "objectives": ["Understand ...", "Identify ...", "Apply ..."],
  "keyTopics": ["topic", "topic", "topic"],
  "content": [
    { "type": "heading", "text": "..." },
    { "type": "paragraph", "text": "..." },
    { "type": "code", "language": "python", "text": "..." },
    { "type": "video", "query": "YouTube search query for this lesson" },
    { "type": "mcq", "question": "...", "options": ["...", "...", "...", "..."], "answer": 0, "explanation": "..." }
  ],
  "readings": [{ "title": "Resource name", "url": "https://..." }]
}
Rules:
- The whole JSON must stay under 3000 characters, so be concise.
- 2 headings and 3 paragraphs (each under 70 words) with a concrete example.
- Include one short code block ONLY if the lesson is about programming or technical tooling.
- Include exactly one video block with a search query, never a URL.
- End with 4 mcq blocks with short options; "answer" is the 0-based index of the correct option; explanation under 15 words.
- 2 readings from well-known, stable sources (official docs, Wikipedia, MDN, etc.).`;
}

function generateHinglishPrompt(text) {
  return `Translate this lesson explanation into Hinglish (conversational Hindi written in Roman script, mixed with English technical terms), the way a friendly Indian teacher would explain it to a student. Keep it under 250 words.

Return ONLY raw JSON: { "hinglish": "..." }

Lesson:
${text.slice(0, 4000)}`;
}

module.exports = { generateCoursePrompt, generateLessonPrompt, generateHinglishPrompt };
