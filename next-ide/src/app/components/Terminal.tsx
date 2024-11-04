"use client"
import { Terminal as XTerminal} from "@xterm/xterm"
import { useEffect, useRef } from "react"
import socket from "@/services/SOCKET/Socket"

import "@xterm/xterm/css/xterm.css"
import { Box } from "@chakra-ui/react"

interface TerminalCasting  {
  containerId : string,
}
const Terminal: React.FC<TerminalCasting> = ({containerId}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
    const isRendered = useRef(false)
    useEffect(() => {
        if (isRendered.current) return;
        isRendered.current = true
        const term = new XTerminal({
          rows : 43,
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
          socket.emit("terminal:write", { containerId, data });
        })
        
        term.onKey(({ key, domEvent }) => {
          if (domEvent.key === "Enter") {
              // Append newline when Enter is pressed
              socket.emit("terminal:write", { containerId, data: "\n" });
          }
      });

        socket.on('terminal:data', (data) => {
            term.write(data)
        })
    }, [])
  return (
    <Box width={"30%"}>
    <Box id="terminal" ref={terminalRef}/>
    </Box>
  )
}

export default Terminal