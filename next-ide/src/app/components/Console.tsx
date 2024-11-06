"use client"
import { useEffect, useRef } from "react"

import { Terminal as XConsole} from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"

import socket from "@/services/SOCKET/Socket"


const Console = () => {

  const consoleRef = useRef<HTMLDivElement>(null);
    const isRendered = useRef(false)
    useEffect(() => {
        if (isRendered.current) return;
        isRendered.current = true
        const cons = new XConsole({
          rows : 39,
          cols : 50,
          theme: {
            background: "#1c2333",
            foreground: "#ffffff",
          },
        })
        if (consoleRef.current instanceof HTMLElement) {
          cons.open(consoleRef.current);
      } else {
          console.error("Console reference is null or invalid.");
      }
      socket.emit('console:write', "\r")
        cons.onData((data) => {
            socket.emit('console:write', data)
        })

        socket.on('console:data', (data) => {
            cons.write(data)
        })
        cons.write(`\n> [{name : "apple", colour : "red"}]`)
    }, [])
  return (
<>
<div id="console" ref={consoleRef}/>
</>
  )
}

export default Console