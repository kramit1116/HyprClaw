import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { requireOpenRouterConfig } from "../config/runtime";

export function getAgentModel() {
    const { apiKey, modelId } = requireOpenRouterConfig();
    const provider = createOpenRouter({ apiKey });

    return provider(modelId);
}
