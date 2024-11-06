import { useCallback, useEffect, useState } from "react";

import {
    DialogActionTrigger,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle
} from "@/components/ui/dialog";

import { Box, Tabs, List, Flex, Kbd, Button } from "@chakra-ui/react";
import { Status } from "@/components/ui/status";
import { EmptyState } from "@/components/ui/empty-state";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";

import { FaPython, FaReact, FaXmark } from "react-icons/fa6";
import { SiTypescript, SiJavascript } from "react-icons/si";
import { BsCodeSlash } from "react-icons/bs";

import socket from "@/services/SOCKET/Socket";
import { getFileContent } from "@/services/REST/Porject.Service";
import { useDispatch, useSelector } from "react-redux";
import { removeFile } from "@/redux/file_slice";
import { addSelectedFile } from "@/redux/selected_file_slice";

interface fileTypes {
    name: string;
    code: string;
}

interface AcknowledgementTypes {
    status: string;
    message: string;
}

const CodeEditor = () => {
    const openFile = useSelector((state: { file: fileTypes[] }) => state.file);
    const selectedFile = useSelector((state: { selectedFile: string }) => state.selectedFile);
    const dispatch = useDispatch();

    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [originalFileContents, setOriginalFileContents] = useState<Record<string, string>>({});
    const [fileStatus, setFileStatus] = useState<Record<string, boolean>>({});
    const [activeTabIndex, setActiveTabIndex] = useState("0");
    const [unsavedFile, setUnsavedFile] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // useEffect(() => {
    //     if (openFile.length > 0) {
    //         dispatch(addSelectedFile(openFile[0].name))
    //     }
    // }, [openFile]);
   

    useEffect(() => {
        const selectedIndex = openFile.findIndex((file) => file.name === selectedFile);
        if (selectedIndex !== -1) {
            setActiveTabIndex(String(selectedIndex));
        }
    }, [selectedFile, openFile]);
    
    const getFileContentFun = useCallback(async () => {
        if (!selectedFile) return;
        const response = await getFileContent(selectedFile);
        const content = response.data.content;
        setFileContents((prev) => ({ ...prev, [selectedFile]: content }));
        setOriginalFileContents((prev) => ({ ...prev, [selectedFile]: content }));
        setFileStatus((prev) => ({ ...prev, [selectedFile]: true }));
    }, [selectedFile]);

    useEffect(() => {
        if (selectedFile) getFileContentFun();
    }, [getFileContentFun, selectedFile]);

    useEffect(() => {
        if (isDialogOpen) return;

        const timer = setTimeout(() => {
            if (fileStatus[selectedFile!] === false) {
                socket.emit(
                    "file:change",
                    { path: selectedFile, content: fileContents[selectedFile!] },
                    (ack: AcknowledgementTypes) => {
                        if (ack.status === "success") {
                            setFileStatus((prev) => ({ ...prev, [selectedFile!]: true }));
                        } else {
                            console.error(ack.message);
                            alert(`Error: ${ack.message}`);
                        }
                    }
                );
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [fileContents, selectedFile, fileStatus, isDialogOpen]);

    const handleFileClick = (fileName: string) => {
        dispatch(addSelectedFile(fileName))
    };

    const handleEditorChange = (newValue: string) => {
        setFileContents((prev) => ({ ...prev, [selectedFile!]: newValue }));
        setFileStatus((prev) => ({ ...prev, [selectedFile!]: false }));
    };

    const handleFileClose = (fileName: string) => {
        if (fileStatus[fileName] === false) {
            setUnsavedFile(fileName);
            setIsDialogOpen(true);
        } else {
            dispatch(removeFile({ name: fileName }));
        }
    };

    const handleSave = () => {
        socket.emit("file:change", { path: unsavedFile, content: fileContents[unsavedFile!] }, (ack: AcknowledgementTypes) => {
            if (ack.status === "success") {
                setFileStatus((prev) => ({ ...prev, [unsavedFile!]: true }));
                dispatch(removeFile({ name: unsavedFile! }));
                setIsDialogOpen(false);
                setUnsavedFile(null);
            } else {
                alert(`Error: ${ack.message}`);
            }
        });
    };

    const handleCancel = () => {
        if (unsavedFile) {
            setFileContents((prev) => ({ ...prev, [unsavedFile]: originalFileContents[unsavedFile] }));
            dispatch(removeFile({ name: unsavedFile }));
        }
        setIsDialogOpen(false);
        setUnsavedFile(null);
    };

    return (
        <Box width={"53%"} height="100vh">
            {openFile.length > 0 ? (
                <Tabs.Root value={activeTabIndex} variant="plain" height="100%">
                    <Tabs.List bg="bg.muted" rounded="l3" p="1">
                        {openFile.map((file: fileTypes, index: number) => {
                            const fileName = file.name.split("/").pop();
                            const fileExtension = fileName?.split(".").pop();
                            return (
                                <Tabs.Trigger
                                    value={String(index)}
                                    key={index}
                                    onClick={() => handleFileClick(file.name)}
                                >
                                    {fileExtension === "js" ? (
                                        <SiJavascript />
                                    ) : fileExtension === "jsx" || fileExtension === "tsx" ? (
                                        <FaReact />
                                    ) : fileExtension === "ts" ? (
                                        <SiTypescript />
                                    ) : fileExtension === "py" ? (
                                        <FaPython />
                                    ) : null}
                                    {fileName}{" "}
                                    {!fileStatus[file.name] && <Status value="info" />}
                                    <FaXmark onClick={() => handleFileClose(file.name)} />
                                </Tabs.Trigger>
                            );
                        })}
                        <Tabs.Indicator rounded="l2" />
                    </Tabs.List>
                    {openFile.map((file: fileTypes, index: number) => (
                        <Tabs.Content
                            value={String(index)}
                            key={index}
                            height="calc(100vh - 48px)"
                        >
                            <AceEditor
                                value={fileContents[file.name] || ""}
                                mode="javascript"
                                theme="github"
                                width="100%"
                                height="100%"
                                onChange={handleEditorChange}
                                name="CodeEditor"
                            />
                        </Tabs.Content>
                    ))}
                </Tabs.Root>
            ) : (
                <Flex
                    width="100%"
                    height="100%"
                    align="center"
                    justify="center"
                    textAlign="center"
                >
                    <EmptyState
                        icon={
                            <Box fontSize="200px">
                                <BsCodeSlash />
                            </Box>
                        }
                        title=""
                    >
                        <List.Root gap={3}>
                            <List.Item display={"flex"} alignItems={"center"}>Open new empty file: <Kbd ms={2}>Ctrl + n</Kbd></List.Item>
                            <List.Item display={"flex"} alignItems={"center"}>Open extension tab: <Kbd ms={2}>Ctrl + e</Kbd></List.Item>
                            <List.Item display={"flex"} alignItems={"center"}>Open API client: <Kbd ms={2}>Ctrl + g</Kbd></List.Item>
                            <List.Item display={"flex"} alignItems={"center"}>Find in files: <Kbd ms={2}>Ctrl + f</Kbd></List.Item>
                            <List.Item display={"flex"} alignItems={"center"}>Select all: <Kbd ms={2}>Ctrl + a</Kbd></List.Item>
                        </List.Root>
                    </EmptyState>
                </Flex>
            )}
            <DialogRoot open={isDialogOpen} onOpenChange={(details) => setIsDialogOpen(details.open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save {unsavedFile && unsavedFile.split("/").pop()}?</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        Would you like to save your changes to <b>{unsavedFile && unsavedFile.split("/").pop()}</b>? 
                        Click Save to confirm, or Cancel to close the file without saving.
                    </DialogBody>
                    <DialogFooter>
                        <DialogActionTrigger asChild>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </DialogActionTrigger>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </DialogRoot>
        </Box>
    );
};

export default CodeEditor;
