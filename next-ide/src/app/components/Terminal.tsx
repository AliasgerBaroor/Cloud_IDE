"use client"
import { Terminal as XTerminal} from "@xterm/xterm"
import { useEffect, useRef } from "react"
import socket from "@/services/SOCKET/Socket"

import "@xterm/xterm/css/xterm.css"
import { Box } from "@chakra-ui/react"
const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
    const isRendered = useRef(false)
    useEffect(() => {
        if (isRendered.current) return;
        isRendered.current = true
        const term = new XTerminal({
          rows : 42,
          cols : 70,
          theme: {
            background: "#1c2333",
            foreground: "#ffffff",
          },
        })
        if (terminalRef.current instanceof HTMLElement) {
          term.open(terminalRef.current);
      } else {
          console.error("Terminal reference is null or invalid.");
      }

        term.onData((data) => {
            socket.emit('terminal:write', data)
        })

        socket.on('terminal:data', (data) => {

            term.write(data)
        })
    }, [])
  return (
     <Box width={"50%"} borderLeft="1px solid white">
    <div id="terminal" ref={terminalRef}/>
    </Box>
  )
}

export default Terminal