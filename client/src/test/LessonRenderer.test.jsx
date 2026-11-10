import { fireEvent, render, screen } from "@testing-library/react";
import LessonRenderer from "../components/LessonRenderer";

vi.mock("../utils/api", () => ({ api: vi.fn(() => Promise.resolve([{ videoId: "abc", title: "Hooks video" }])) }));

const content = [
  { type: "heading", text: "Intro" },
  { type: "paragraph", text: "State is **memory**." },
  { type: "code", language: "js", text: "useState(0)" },
  { type: "video", query: "react hooks" },
  { type: "mcq", question: "What stores state?", options: ["useState", "useRef"], answer: 0, explanation: "useState re-renders." },
  { type: "unknown", text: "ignored" },
];

test("renders every block type and skips unknown ones", async () => {
  render(<LessonRenderer content={content} />);
  expect(screen.getByRole("heading", { name: "Intro" })).toBeInTheDocument();
  expect(screen.getByText("memory").tagName).toBe("STRONG");
  expect(screen.getByText("useState(0)")).toBeInTheDocument();
  expect(await screen.findByTitle("Hooks video")).toHaveAttribute("src", expect.stringContaining("/embed/abc"));
  expect(screen.queryByText("ignored")).not.toBeInTheDocument();
});

test("MCQ shows feedback after an answer", () => {
  render(<LessonRenderer content={content.slice(4, 5)} />);
  fireEvent.click(screen.getByRole("button", { name: "useRef" }));
  expect(screen.getByText("Not quite.")).toBeInTheDocument();
  expect(screen.getByText(/useState re-renders/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "useState" })).toBeDisabled();
});
