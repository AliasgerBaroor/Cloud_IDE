require('dotenv').config("../");
const app = require("express");
const http = require('http');
const cors = require("cors")
const chokidar = require('chokidar');
const fs = require('fs/promises');
const pathLib = require('path');
const { Server: SocketServer } = require('socket.io');
const pty = require('node-pty');

app.use(cors())
app.use(express.json())

const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: '*',
    },
});

// Spawning a terminal process
const ptyProcess = pty.spawn("cmd.exe", [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/__USER',
    env: process.env,
});

chokidar.watch('./__USER').on('all', (event, path) => {
    io.emit("file:refresh", path);
});

ptyProcess.onData((data) => {
    io.emit("terminal:data", data);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('file:change', async ({ path, content }, ack) => {
        const fullPath = path;

        try {
            const stat = await fs.stat(fullPath);
            if (stat.isDirectory()) {
                console.error(`Cannot write to a directory: ${fullPath}`);
                ack({ status: "error", message: "Cannot write to a directory" });
                return;
            }

            await fs.writeFile(fullPath, content);
            ack({ status: "success", message: "File saved successfully" });
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(fullPath, content);
                ack({ status: "success", message: "File created and saved successfully" });
            } else {
                console.error(`Error writing file: ${error}`);
                ack({ status: "error", message: `Error writing file: ${error.message}` });
            }
        }
    });

    socket.on("terminal:write", (data) => {
        ptyProcess.write(data);
    });
});

app.get("/files/content", async (req, res) => {
    const filePath = req.query.path;
    const fullPath = filePath;
    try {
        const content = await fs.readFile(fullPath, "utf-8");
        return res.json({ content });
    } catch (error) {
        console.error(`Error reading file: ${error}`);
        return res.status(500).json({ error: "Error reading file" });
    }
});

app.get("/files", async (req, res) => {
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

app.listen("8000", () => console.log(`user container started on port: http://localhost:8000`))
