import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { confirm, isCancel, password, text } from "@clack/prompts";

type ConfigKey = "openrouterApiKey" | "openrouterDefaultModel" | "telegramBotToken" | "telegramOwnerId";

interface StoredConfig {
  openrouterApiKey?: string;
  openrouterDefaultModel?: string;
  telegramBotToken?: string;
  telegramOwnerId?: string;
}

const CONFIG_PATH = path.join(
  process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), ".config"),
  "hyprclaw",
  "config.json",
);

const ENV_FOR_KEY: Record<ConfigKey, string> = {
  openrouterApiKey: "OPENROUTER_API_KEY",
  openrouterDefaultModel: "OPENROUTER_DEFAULT_MODEL",
  telegramBotToken: "TELEGRAM_BOT_TOKEN",
  telegramOwnerId: "TELEGRAM_OWNER_ID",
};

export class ConfigurationError extends Error {
  constructor(variable: string) {
    super(`Missing ${variable}. Run \"hyprclaw configure\" to save it once, or set ${variable} for this session.`);
    this.name = "ConfigurationError";
  }
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function readStoredConfig(): StoredConfig {
  try {
    const value: unknown = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (value && typeof value === "object" && !Array.isArray(value)) return value as StoredConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw new Error(`Could not read ${CONFIG_PATH}: ${String(error)}`);
    }
  }
  return {};
}

function writeStoredConfig(config: StoredConfig): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true, mode: 0o700 });
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  fs.chmodSync(CONFIG_PATH, 0o600);
}

export function getConfiguredValue(key: ConfigKey): string | undefined {
  return nonEmpty(process.env[ENV_FOR_KEY[key]]) ?? nonEmpty(readStoredConfig()[key]);
}

export function requireConfiguredValue(key: ConfigKey): string {
  const value = getConfiguredValue(key);
  if (!value) throw new ConfigurationError(ENV_FOR_KEY[key]);
  return value;
}

export function requireOpenRouterConfig(): { apiKey: string; modelId: string } {
  return {
    apiKey: requireConfiguredValue("openrouterApiKey"),
    modelId: getConfiguredValue("openrouterDefaultModel") ?? "openrouter/free",
  };
}

export function requireTelegramConfig(): { token: string; ownerId: string } {
  return {
    token: requireConfiguredValue("telegramBotToken"),
    ownerId: requireConfiguredValue("telegramOwnerId"),
  };
}

function interactiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function promptForValue(key: ConfigKey, message: string, secret = false): Promise<string | undefined> {
  const existing = getConfiguredValue(key);
  if (existing) return existing;
  if (!interactiveTerminal()) throw new ConfigurationError(ENV_FOR_KEY[key]);

  const response = secret
    ? await password({ message, validate: (value) => ((value ?? "").trim() ? undefined : "Required") })
    : await text({ message, validate: (value) => ((value ?? "").trim() ? undefined : "Required") });
  if (isCancel(response)) return undefined;
  return response.trim();
}

async function saveNewValues(values: StoredConfig): Promise<void> {
  const stored = readStoredConfig();
  const hasNewValue = Object.entries(values).some(
    ([key, value]) => value && !process.env[ENV_FOR_KEY[key as ConfigKey]] && stored[key as ConfigKey] !== value,
  );
  if (!hasNewValue) return;
  const shouldSave = await confirm({ message: `Save these settings to ${CONFIG_PATH}?`, initialValue: true });
  if (isCancel(shouldSave) || !shouldSave) return;
  writeStoredConfig({ ...stored, ...values });
}

export async function ensureOpenRouterConfig(): Promise<boolean> {
  const apiKey = await promptForValue("openrouterApiKey", "OpenRouter API key", true);
  if (!apiKey) return false;
  await saveNewValues({
    openrouterApiKey: apiKey,
    openrouterDefaultModel: getConfiguredValue("openrouterDefaultModel") ?? "openrouter/free",
  });
  return true;
}

export async function ensureTelegramConfig(): Promise<boolean> {
  const token = await promptForValue("telegramBotToken", "Telegram bot token", true);
  if (!token) return false;
  const ownerId = await promptForValue("telegramOwnerId", "Your Telegram user ID");
  if (!ownerId) return false;
  await saveNewValues({ telegramBotToken: token, telegramOwnerId: ownerId });
  return true;
}

export async function runConfigure(): Promise<void> {
  if (!interactiveTerminal()) throw new Error("The configure command must be run in an interactive terminal.");

  const apiKey = await password({ message: "OpenRouter API key" });
  if (isCancel(apiKey) || !apiKey.trim()) return;
  const modelId = await text({
    message: "Default OpenRouter model",
    initialValue: getConfiguredValue("openrouterDefaultModel") ?? "openrouter/free",
    validate: (value) => ((value ?? "").trim() ? undefined : "Required"),
  });
  if (isCancel(modelId)) return;
  const telegram = await confirm({ message: "Configure Telegram now?", initialValue: Boolean(getConfiguredValue("telegramBotToken")) });
  if (isCancel(telegram)) return;

  const config: StoredConfig = { ...readStoredConfig(), openrouterApiKey: apiKey.trim(), openrouterDefaultModel: modelId.trim() };
  if (telegram) {
    const token = await password({ message: "Telegram bot token" });
    if (isCancel(token) || !token.trim()) return;
    const ownerId = await text({ message: "Your Telegram user ID", initialValue: getConfiguredValue("telegramOwnerId") });
    if (isCancel(ownerId) || !ownerId.trim()) return;
    config.telegramBotToken = token.trim();
    config.telegramOwnerId = ownerId.trim();
  }
  writeStoredConfig(config);
  console.log(`Saved configuration to ${CONFIG_PATH}. Environment variables still take precedence.`);
}

export const configPath = CONFIG_PATH;
