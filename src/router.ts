import { lazy } from "alemonjs";

export default defineResponse([
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/store/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/help/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/luck/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/markdown/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/marry/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/meme/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/setting/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/uni_emotions/res")),
  },
  {
    regular: /.*/,
    handler: lazy(() => import("@src/response/ai/res")),
  },
]);
