import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", function () {
  test("Test if extension is activated", async () => {
    const extension =
      vscode.extensions.getExtension(
        "pulko.pomodoing"
      );
    await extension?.activate();

    assert.ok(
      extension?.isActive,
      "Extension is not activated"
    );
  });

  test("Test if start command is registered", async () => {
    const commands =
      await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes("pomodoro.startTimer"),
      "Command is not registered"
    );
  });

  test("Test if pause command is registered", async () => {
    const commands =
      await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes("pomodoro.pauseTimer"),
      "Command is not registered"
    );
  });

  test("Test if reset command is registered", async () => {
    const commands =
      await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes("pomodoro.resetTimer"),
      "Command is not registered"
    );
  });
});
