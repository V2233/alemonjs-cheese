import { pluginInfo } from "../package.js";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import express from "express";
import cors from "cors";

//#region src/utils/server.ts
const assetsPath = join(pluginInfo.DATA_PATH, "assets");
if (!existsSync(assetsPath)) mkdirSync(assetsPath, { recursive: true });
const port = 23333;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(resolve(assetsPath)));
app.listen(port, () => {});

//#endregion
export { assetsPath, app as default, port };