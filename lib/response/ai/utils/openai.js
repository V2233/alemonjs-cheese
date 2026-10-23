import config_default from "../../../utils/config.js";
import OpenAI from "openai";

// src/response/ai/utils/openai.ts
const client = new OpenAI({
	apiKey: config_default.getConfig("ai").api_key,
	baseURL: "https://free.v36.cm/v1"
});

export { client };