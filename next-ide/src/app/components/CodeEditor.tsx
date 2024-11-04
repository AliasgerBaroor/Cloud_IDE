import { useCallback, useEffect, useState } from "react";
import { Box, Tabs } from "@chakra-ui/react";
import { Status } from "@/components/ui/status"

import { FaJsSquare } from "react-icons/fa";
import { FaPython } from "react-icons/fa6";
import { RiNextjsLine } from "react-icons/ri";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";

import socket from "@/services/SOCKET/Socket";
import { getFileContent } from "@/services/REST/Porject.Service";
import { useSelector } from "react-redux";

interface fileTypes {
    name : string;
    code : string,
}
interface AcknowledgementTypes {
    status : string;
    message : string,
}

const CodeEditor = () => {
  const openFile = useSelector((state: { file: fileTypes[] }) => state.file)
    const [code, setCode] = useState("");
    const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
    const [selectedFileContent, setSelectedFileContent] = useState("");
    const [isSaved, setIsSaved] = useState<boolean>(true);

    useEffect(() => {
        if (openFile.length > 0) {
            setSelectedFile(openFile[0].name);
        }
    }, [openFile]);

    const getFileContentFun = useCallback(async () => {
        if (!selectedFile) return;
        const response = await getFileContent(selectedFile);
        setSelectedFileContent(response.data.content);
    }, [selectedFile]);

    useEffect(() => {
        if (selectedFile) getFileContentFun();
    }, [getFileContentFun, selectedFile]);

    useEffect(() => {
        if (selectedFileContent) {
            setCode(selectedFileContent);
            setIsSaved(true);
        }
    }, [selectedFileContent]);

    useEffect(() => {
        if (!isSaved) {
            const timer = setTimeout(() => {
                socket.emit(
                    "file:change",
                    { path: selectedFile, content: code },
                    (ack : AcknowledgementTypes) => {
                        if (ack.status === "success") {
                            console.log(ack.message); // File saved successfully
                            setIsSaved(true);
                        } else {
                            console.error(ack.message); // Display the error message
                            alert(`Error: ${ack.message}`);
                        }
                    }
                );
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [code, isSaved, selectedFile]);

    useEffect(() => {
        setIsSaved(selectedFileContent === code);
    }, [code, selectedFileContent]);


    return (
        <Box width={"55%"} height="100vh">
            {openFile.length > 0 && (
            <Tabs.Root defaultValue={"0"} variant="plain" height="100%">
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
                {openFile.map((file : fileTypes, index : number) => (
                <Tabs.Trigger value={String(index)} key={index}>
                    <FaJsSquare />
                   { file.name.includes("/") ? file.name.split("/").pop() : file.name } {isSaved ? "" : <Status value="info"></Status>}
                </Tabs.Trigger>
                ))}
                <Tabs.Indicator rounded="l2" />
            </Tabs.List>
            {openFile.map((file : fileTypes, index : number) => (
                           <Tabs.Content value={String(index)} key={index} height="calc(100vh - 48px)">
                           <AceEditor
                               value={code}
                               mode="javascript"
                               theme="github"
                               width="100%"
                               height="100%"
                               onChange={(newValue) => setCode(newValue)}
                               name="CodeEditor"
                           />
                       </Tabs.Content>
                ))}
        </Tabs.Root>
            )}
        </Box>
    );
};

export default CodeEditor;
