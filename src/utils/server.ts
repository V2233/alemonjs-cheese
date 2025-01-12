import express from 'express';
import cors from 'cors'
import { join,resolve } from 'path';
import { pluginInfo } from "@src/package"
import { existsSync, mkdirSync } from 'fs'

const assetsPath = join(pluginInfo.DATA_PATH,'assets')
if(!existsSync(assetsPath)) mkdirSync(assetsPath,{recursive:true})

const port = 23333

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/',express.static(resolve(assetsPath)));

app.listen(port, () => {});

export default app
export {assetsPath,port}