import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsForm } from "./settings.js";
import type { SettingSchema } from "./types.js";

describe("SettingsForm", () => {
  it("renders a number field with min/max/step and reports parsed number on change", () => {
    const schema = {
      rounds: { kind: "number", label: "Rounds", min: 1, max: 10, step: 2, default: 3 },
    } as const satisfies SettingSchema;
    const onChange = vi.fn();

    render(
      <SettingsForm
        schema={schema}
        values={{ rounds: 3 }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Rounds")).toBeInTheDocument();
    const input = screen.getByDisplayValue("3") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "10");
    expect(input).toHaveAttribute("step", "2");

    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("rounds", 7);
  });

  it("defaults the number field's step attribute to 1 when not specified", () => {
    const schema = {
      score: { kind: "number", label: "Score", min: 0, max: 100, default: 50 },
    } as const satisfies SettingSchema;

    render(
      <SettingsForm
        schema={schema}
        values={{ score: 50 }}
        onChange={() => {}}
      />,
    );

    const input = screen.getByDisplayValue("50") as HTMLInputElement;
    expect(input).toHaveAttribute("step", "1");
  });

  it("renders an enum field with all options and reports the selected string on change", () => {
    const schema = {
      difficulty: {
        kind: "enum",
        label: "Difficulty",
        options: ["easy", "medium", "hard"] as const,
        default: "easy",
      },
    } as const satisfies SettingSchema;
    const onChange = vi.fn();

    render(
      <SettingsForm
        schema={schema}
        values={{ difficulty: "easy" }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Difficulty")).toBeInTheDocument();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("easy");

    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).toEqual(["easy", "medium", "hard"]);

    fireEvent.change(select, { target: { value: "hard" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("difficulty", "hard");
  });

  it("renders a boolean field as a checkbox and reports the new checked state on click", () => {
    const schema = {
      sound: { kind: "boolean", label: "Enable sound", default: false },
    } as const satisfies SettingSchema;
    const onChange = vi.fn();

    render(
      <SettingsForm
        schema={schema}
        values={{ sound: false }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Enable sound")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("sound", true);
  });

  it("renders an empty form (no labels/inputs) for an empty schema", () => {
    const { container } = render(
      <SettingsForm schema={{}} values={{}} onChange={() => {}} />,
    );

    const form = container.querySelector("form.settings-form");
    expect(form).not.toBeNull();
    expect(form!.children.length).toBe(0);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });
});
