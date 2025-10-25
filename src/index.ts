import response from "@src/router";
export default defineChildren({
  register() {
    return {
      response,
    };
  },
  onCreated() {
    logger.info("Start OpenAI APP");
  },
});
