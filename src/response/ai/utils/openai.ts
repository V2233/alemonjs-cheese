import OpenAI from 'openai'
import Cfg from '@src/utils/config'

const client = new OpenAI({
  apiKey: Cfg.getConfig('ai').api_key,
  baseURL: "https://free.v36.cm/v1"
});

export { client }




