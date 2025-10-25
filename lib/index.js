import response from './router.js';

var index = defineChildren({
    register() {
        return {
            response,
        };
    },
    onCreated() {
        logger.info("Start OpenAI APP");
    },
});

export { index as default };
