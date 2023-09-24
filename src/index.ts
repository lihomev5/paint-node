import { install as sourceMapInstall } from "source-map-support"

sourceMapInstall()

import cluster from "cluster"


const fork = function () {
    const worker = cluster.fork()

    worker.on("online", function () {

        console.info("worker " + worker.id + " online...")
    });

    worker.on("exit", function () {

        console.info("worker " + worker.id + " exit...")

        setTimeout(fork, 1000)
    })

    worker.on("unhandledRejection", (reason, promise) => {
        console.log("Unhandled Rejection at:", reason.stack || reason)
        // Recommended: send the information to sentry.io
        // or whatever crash reporting service you use
    })

}


if (cluster.isPrimary) {
    // Fork workers.
    fork()

    /**
     * 在 `TypeScript`中，return只能用于函数体内，要不会出现如下的错误：
     * A 'return' statement can only be used within a function body.ts(1108)
     * 
     * 而在`nodejs`环境中，每个模块文件本身最终其实是被包裹某个函数中执行的，这样看来此处的`return`并无不妥
     * 所以这里可以使用@ts-ignore直接忽略，继续使用`return`以防主线程继续执行不必要的模块加载动作
     */
    // @ts-ignore
    return
}


import express from "express";

import 'dotenv/config';
import http from "http";
import { registerMapping } from "./config/ApiConfig";

const basePort = process.env.BASE_PORT || 3000;
const basePath = process.env.BASE_PATH || '/'


const initialize = async() => {

    // 创建一个 express app
    const app: express.Express = express()

    app.use((err: any, req: any, res: any, next: any) => {
        console.log('----------', err)
    })

    // 创建一个 httpServer
    const server: http.Server = app.listen(basePort, () => {
        console.info("The paint-node server is running at :%d%s", basePort, basePath)
    })
    // expose global variables
    app.locals.basePort = basePort
    app.locals.basePath = basePath
    registerMapping({
        app: app,
        path: basePath,
    })
}


initialize().catch(err => console.error('err: %j %s', err, err))


