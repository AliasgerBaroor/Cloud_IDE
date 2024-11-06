const routes = require("express").Router()

routes.use("/api/v1/project", require("../controller/ProjectsController"))

module.exports = routes