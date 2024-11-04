const routes = require("express").Router()

routes.use("/project", require("../controller/ProjectsController"))

module.exports = routes