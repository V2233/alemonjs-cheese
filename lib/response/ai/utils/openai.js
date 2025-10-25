import OpenAI from 'openai';
import Cfg from '../../../utils/config.js';

const client = new OpenAI({
    apiKey: Cfg.getConfig('ai').api_key,
    baseURL: "https://free.v36.cm/v1"
});

export { client };
