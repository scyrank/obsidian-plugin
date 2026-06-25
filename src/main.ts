import { Plugin } from "obsidian";
import { applyToSelectedLines } from "./editorCommands";
import { cycleTaskState, toggleDelegated, toggleImportant, toggleStar } from "./lineTransform";

export default class KhalaTaskMarkerPlugin extends Plugin {
  override async onload(): Promise<void> {
    this.addCommand({
      id: "cycle-task-state",
      name: "Cycle task state",
      hotkeys: [{ modifiers: ["Mod", "Alt"], key: "T" }],
      editorCallback: (editor) => {
        applyToSelectedLines(editor, cycleTaskState);
      },
    });

    this.addCommand({
      id: "toggle-important",
      name: "Toggle important",
      hotkeys: [{ modifiers: ["Mod", "Alt"], key: "H" }],
      editorCallback: (editor) => {
        applyToSelectedLines(editor, toggleImportant);
      },
    });

    this.addCommand({
      id: "toggle-star",
      name: "Toggle star",
      hotkeys: [{ modifiers: ["Mod", "Alt"], key: "S" }],
      editorCallback: (editor) => {
        applyToSelectedLines(editor, toggleStar);
      },
    });

    this.addCommand({
      id: "toggle-delegated",
      name: "Toggle delegated",
      hotkeys: [{ modifiers: ["Alt"], key: "4" }],
      editorCallback: (editor) => {
        applyToSelectedLines(editor, toggleDelegated);
      },
    });

    try {
      const { importantLineExtension } = await import("./decorations");
      this.registerEditorExtension(importantLineExtension);
    } catch (error) {
      console.warn("Khala Task Marker: important line highlighting is unavailable.", error);
    }
  }
}
