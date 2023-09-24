import * as express from "express"
import { apiMappings } from "./../api/ApiMappings"

const cgiRouter = express.Router();

export const registerMapping = (options: paint.MappingConfig) => {

    options.app.use(options.path, cgiRouter)

    cgiRouter.get("/", (req, res) => {
        res.json({
            code: 200
        })
    })

    apiMappings.init(cgiRouter)
}