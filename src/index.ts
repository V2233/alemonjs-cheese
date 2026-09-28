import response from '@src/router';
export default defineChildren({
  register() {
    return {
      response,
    };
  },
  onCreated() {
    logger.info('[alemonjs-cheese] Loaded successfully!');
  },
});
