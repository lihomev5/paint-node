import * as path from "path"
import * as fs from "fs"
import * as express from "express"


class ApiMappings {

    constructor() {
    }

    init(router: express.Router): void {
        const apis: string[] = fs.readdirSync(path.join(__dirname, "router"))

        apis.forEach(filename => {

            if (filename.endsWith(".map")) {
                return
            }

            // logger.debug("try to load api: %s", filename)

            const api = require("./router/" + filename)

            console.debug("registerApi: %s", api)

            router.use(api.routePath, api.router)

        })
    }
}

export const apiMappings = new ApiMappings()