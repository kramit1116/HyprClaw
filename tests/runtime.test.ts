import { describe, expect, test } from "bun:test";
import { ConfigurationError, requireConfiguredValue } from "../config/runtime";

describe("runtime configuration", () => {
  test("uses an environment variable when present", () => {
    const previous = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "test-key";
    expect(requireConfiguredValue("openrouterApiKey")).toBe("test-key");
    if (previous === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = previous;
  });

  test("uses a clear validation error", () => {
    const error = new ConfigurationError("TELEGRAM_BOT_TOKEN");
    expect(error.message).toContain("hyprclaw configure");
    expect(error.message).toContain("TELEGRAM_BOT_TOKEN");
  });
});
