import { fireEvent, render, screen } from "@testing-library/react";
import PromptForm from "../components/PromptForm";

test("submits a trimmed topic and blocks empty input", () => {
  const onSubmit = vi.fn();
  render(<PromptForm onSubmit={onSubmit} />);
  const button = screen.getByRole("button", { name: "Generate course" });
  expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Course topic"), { target: { value: "  React Hooks " } });
  fireEvent.click(button);
  expect(onSubmit).toHaveBeenCalledWith("React Hooks");
});
