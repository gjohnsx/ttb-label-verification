import { createLoader } from "nuqs/server";
import { queueParsers } from "./search-params.shared";

export const loadQueueParams = createLoader(queueParsers);
