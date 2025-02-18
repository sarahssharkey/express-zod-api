import { spawn } from "node:child_process";
import { givePort, waitFor } from "../helpers";
import { afterAll, afterEach, describe, expect, test } from "vitest";

describe("ESM Test", async () => {
  let out = "";
  const listener = (chunk: Buffer) => {
    out += chunk.toString();
  };
  const quickStart = spawn("tsx", ["quick-start.ts"], { cwd: "./tests/esm" });
  quickStart.stdout.on("data", listener);
  quickStart.stderr.on("data", listener);
  const port = givePort("example");
  await waitFor(() => out.indexOf(`Listening ${port}`) > -1);

  afterAll(async () => {
    quickStart.stdout.removeListener("data", listener);
    quickStart.stderr.removeListener("data", listener);
    quickStart.kill();
    await waitFor(() => quickStart.killed);
  });

  afterEach(() => {
    console.log(out);
    out = "";
  });

  describe("Quick Start from Readme", () => {
    test("Should handle valid GET request", async () => {
      const response = await fetch(
        `http://localhost:${port}/v1/hello?name=Rick`,
      );
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        status: "success",
        data: {
          greetings: "Hello, Rick. Happy coding!",
        },
      });
    });
  });
});
