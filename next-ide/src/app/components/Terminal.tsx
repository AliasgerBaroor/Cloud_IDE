"use client"
import { useEffect, useRef } from "react"

import { Terminal as XTerminal} from "@xterm/xterm"
import "@xterm/xterm/css/xterm.css"

import { Tabs, Box} from "@chakra-ui/react"

import socket from "@/services/SOCKET/Socket"
import { VscTerminal, VscTerminalCmd } from "react-icons/vsc"
import Console from "./Console"

interface TerminalTypes {
  containerId: string;
}
const Terminal: React.FC<TerminalTypes> = ({ containerId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
    const isRendered = useRef(false)
    useEffect(() => {
        if (isRendered.current) return;
        isRendered.current = true
        const term = new XTerminal({
          rows : 39,
          cols : 50,
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
      socket.emit('terminal:write', "\r")
        term.onData((data) => {
            socket.emit('terminal:write', data)
        })

        socket.on('terminal:data', (data) => {

            term.write(data)
        })
    }, [])
  return (
     <Box width={"30%"} height="100vh" bg={"#1c2333"}>
   
      <Tabs.Root defaultValue="cmd" variant="plain" loopFocus={true}>
      <Tabs.List bg="bg.muted" rounded="l3" p="1" ms={2} mt={2}>
        <Tabs.Trigger value="cmd">
          <VscTerminal />
          Command Line
        </Tabs.Trigger>
        <Tabs.Trigger value="console">
          <VscTerminalCmd />
          Console
        </Tabs.Trigger>
       
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
      <Tabs.Content value="cmd">
        <div id="terminal" ref={terminalRef}/>
      </Tabs.Content>
      <Tabs.Content value="console" color={"#ffffff"}>
        <Console />
      </Tabs.Content>
    </Tabs.Root>

    </Box>
  )
}

export default Terminal