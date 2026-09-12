import Cfg from '@src/utils/config';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: Cfg.getConfig('ai').api_key,
  baseURL: 'https://free.v36.cm/v1',
});

export { client };
