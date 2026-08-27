import { getConfiguredValue } from "../../config/runtime";

export const isOwner = (id: number) => String(id) === getConfiguredValue("telegramOwnerId");
