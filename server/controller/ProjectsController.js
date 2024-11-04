require('dotenv').config("../");
const routes = require("express").Router();
const app = require("express");
const Docker = require("dockerode")
const { generateSlug } = require("random-word-slugs");
const http = require('http');
const chokidar = require('chokidar');
const fs = require('fs/promises');
const pathLib = require('path');
const { Server: SocketServer } = require('socket.io');
const User = require("../models/User")
const pty = require('node-pty');

// Spawning a terminal process
const ptyProcess = pty.spawn("cmd.exe", [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + '/__USER',
  env: process.env,
});
// const docker = new Docker()
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
  },
});

  chokidar.watch('./__USER').on('all', (event, path) => {
    io.emit("file:refresh", path);
  });

  ptyProcess.onData((data) => {
    io.emit("terminal:data", data);
  });
  

  
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // containerId, 

    socket.on('file:change', async ({ path, content }, ack) => {
      const fullPath = path;
  
      try {
          const stat = await fs.stat(fullPath);
          if (stat.isDirectory()) {
              console.error(`Cannot write to a directory: ${fullPath}`);
              ack({ status: "error", message: "Cannot write to a directory" }); // Acknowledge with error
              return;
          }
  
          await fs.writeFile(fullPath, content);
          ack({ status: "success", message: "File saved successfully" }); // Acknowledge with success
      } catch (error) {
          if (error.code === 'ENOENT') {
              await fs.writeFile(fullPath, content);
              ack({ status: "success", message: "File created and saved successfully" });
          } else {
              console.error(`Error writing file: ${error}`);
              ack({ status: "error", message: `Error writing file: ${error.message}` }); // Acknowledge with error
          }
      }
  });
  
    // Terminal write event handling
    socket.on("terminal:write", (data) => {
      ptyProcess.write(data);
    });
});

const  PORT_TO_CONTAINERS = {}
const  CONTAINERS_TO_PORT = {}

routes.put('/open/editor', async (req, res) => {
    if(! req.headers) return;
    const _id = req.headers.authorization
    let { projectName, language, framework, repoType, stats, image = "node:latest" } = req.body

    if(projectName.trim() === "") {
        projectName = generateSlug()
    }

    await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, resolve);
        });
    });


    const availablePort = (() => {
        for (let i = 8001; i < 8102; i++) {
            if (PORT_TO_CONTAINERS[i]) continue;
            return `${i}`;
        }
        return undefined;
    })();
    
    if (!availablePort)
        return res.status(503).json({ error: "No available port" });

        const container = await docker.createContainer({ 
            Image: image,
            name : projectName,
            Cmd : ["sh"],
            AttachStdout : true,
            Tty : true,
            HostConfig : {
            PortBindings : {
                "80/tcp" : [{ HostPort : availablePort}]
            }
        }});

        await container.start()

    const newProject = {
        projectName,
        language,
        repoType,
        framework,
        dockerContainerId : container.id,
        commandHistory : [],
        stats,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
      };
    await User.updateOne({_id}, { $push: { projects: newProject } })

    const response_fetch_project = await User.findOne({_id})

    PORT_TO_CONTAINERS[availablePort] = container.id;
    CONTAINERS_TO_PORT[container.id] = availablePort

res.status(200).send({user : response_fetch_project, container_id : container.id})
})

routes.get("/files/content", async (req, res) => {
  const filePath = req.query.path;
  const fullPath = filePath;
  // const fullPath = pathLib.join('./__USER', filePath);
  try {
    const content = await fs.readFile(fullPath, "utf-8");
    return res.json({ content });
  } catch (error) {
    console.error(`Error reading file: ${error}`);
    return res.status(500).json({ error: "Error reading file" });
  }
});

routes.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./__USER");
  return res.json({ tree: fileTree });
});

const generateFileTree = async (directory) => {
  const tree = {};

  const buildTree = async (currentDir, currentTree) => {
    const files = await fs.readdir(currentDir);

    for (const file of files) {
      const filePath = pathLib.join(currentDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        currentTree[file] = {};
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  };

  await buildTree(directory, tree);
  return tree;
};


const PORT = 9000;
server.listen(PORT, () => {
    console.log(`Socket Server is running on http://localhost:${PORT}`);
});

module.exports = routes