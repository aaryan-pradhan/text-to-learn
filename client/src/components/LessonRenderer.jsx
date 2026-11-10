import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import CodeBlock from "./blocks/CodeBlock";
import VideoBlock from "./blocks/VideoBlock";
import MCQBlock from "./blocks/MCQBlock";

const BLOCKS = { heading: HeadingBlock, paragraph: ParagraphBlock, code: CodeBlock, video: VideoBlock, mcq: MCQBlock };

// Renders the lesson's content array, picking a component by each block's "type".
export default function LessonRenderer({ content }) {
  const firstQuiz = content.findIndex((b) => b.type === "mcq");
  return content.map((block, i) => {
    const Block = BLOCKS[block.type];
    if (!Block) return null;
    return (
      <div key={i}>
        {i === firstQuiz && <h2 className="mt-10 mb-2 text-xl font-semibold text-slate-900">Check your understanding</h2>}
        <Block {...block} />
      </div>
    );
  });
}
