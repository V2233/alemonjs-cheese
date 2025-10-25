import { lazy } from 'alemonjs';

var response = defineResponse([
    {
        regular: /.*/,
        handler: lazy(() => import('./response/store/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/help/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/luck/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/markdown/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/marry/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/meme/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/setting/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/uni_emotions/res.js')),
    },
    {
        regular: /.*/,
        handler: lazy(() => import('./response/ai/res.js')),
    },
]);

export { response as default };
