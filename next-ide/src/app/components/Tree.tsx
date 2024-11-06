"use client";
import { useEffect, useState } from "react";
import { Box, Button, Flex, Text, Input, Icon, Kbd } from "@chakra-ui/react";
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuRoot,
} from "@/components/ui/menu"
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from "@/components/ui/dialog";

import { FaPython, FaReact } from "react-icons/fa6";
import { SiTypescript, SiJavascript } from "react-icons/si";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";

import socket from "@/services/SOCKET/Socket";
import { getFullPath, getTree, RenameItem } from "@/services/REST/Porject.Service";
import { useDispatch, useSelector } from "react-redux";
import { addFile, createNewState } from "@/redux/file_slice";
import { addSelectedFile } from "@/redux/selected_file_slice";


interface fileTypes {
  name: string;
  code: string,
}

type TreeNode = {
  name: string;
  children?: TreeNode[];
};

const Tree = () => {
  const openFile = useSelector((state: { file: fileTypes[] }) => state.file)
  const selectedFile = useSelector((state: { selectedFile: string }) => state.selectedFile);

  const dispatch = useDispatch()
  const [fileTree, setFileTree] = useState<TreeNode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [renameData, setRenameData] = useState({
    itemOldPath: "",
    itemNewName: "",
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});



  const handleRename = async (itemOldPath: string) => {
    // console.log(`Rename item path in ${itemOldPath}`);

    const oldName = itemOldPath.split("/").pop() || "";
    setRenameData({
      itemOldPath,
      itemNewName: oldName,
    });
    setIsDialogOpen(true);
  };
  const handleRenamePopup = async () => {
    const response_rename = await RenameItem(renameData);
    if (response_rename.status === 200) {
      const renamedFile = {
        name: response_rename.data.itemName,
        code: "",
      };
  
      const updatedFiles = openFile.map(file =>
        file.name === renameData.itemOldPath ? renamedFile : file
      );

      dispatch(createNewState(updatedFiles)); 
      dispatch(addSelectedFile(response_rename.data.itemName)); 
      setIsDialogOpen(false);
    }
  };

  const handleCopyPath = async (itemPath: string) => {
    const response_copy_full_path = await getFullPath(itemPath);
    const fullPath = response_copy_full_path.data.fullPath;
    // console.log(`copy file path in ${fullPath}`);
    navigator.clipboard.writeText(fullPath);
  };

  
  const handleDelete = (itemPath: string) => {
    console.log(`Deleting ${itemPath}`);
  };

  const handleCreateNewFolder = (parentPath: string) => {
    // const response_create_folder = create
    console.log(`Creating new folder in ${parentPath}`);
  };

  const handleCreateNewFile = (parentPath: string) => {
    console.log(`Creating new file in ${parentPath}`);
  };


  const handleExport = async (itemPath: string) => {
    console.log(`export item from path in ${itemPath}`);
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "g") {
        event.preventDefault(); 
        if (selectedFile) {
          handleRename(selectedFile);
        }
      } else if (event.ctrlKey && event.key === "q") {
        event.preventDefault(); 
        if (selectedFile) {
          handleCopyPath(selectedFile);
        }
      } else if (event.key === "Delete") {
        event.preventDefault(); 
        if (selectedFile) {
          handleDelete(selectedFile);
        }
      } else if (event.ctrlKey && event.key === "o") {
        event.preventDefault(); 
        if (selectedFile) {
          handleExport(selectedFile);
        }
      } else if (event.ctrlKey && event.key === "n") {
        event.preventDefault(); 
        if (selectedFile) {
          handleCreateNewFolder(selectedFile);
        }
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFile, handleRename, handleCopyPath, handleCreateNewFolder]);
  

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const convertToTree = (input: Record<string, any>): TreeNode => {
    const convertHelper = (obj: Record<string, any>): TreeNode[] => {
      const tree: TreeNode[] = [];
      Object.keys(obj).forEach((key) => {
        if (obj[key] === null) {
          tree.push({ name: key });
        } else if (typeof obj[key] === "object") {
          tree.push({
            name: key,
            children: convertHelper(obj[key]),
          });
        }
      });
      return tree;
    };

    return {
      name: "__USER",
      children: convertHelper(input),
    };
  };

  const getFileTree = async () => {
    const response = await getTree();
    const resultTree = convertToTree(response.data.tree);
    setFileTree(resultTree);
  };

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  const handleContextMenu = (event: React.MouseEvent, currentPath: string) => {
    event.preventDefault();
    // console.log(`Context menu for ${currentPath}`);
  };

  const renderTree = (node: TreeNode, path: string = "") => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const fileName = node.name.split("/").pop();
    const fileExtension = fileName?.split(".").pop();
    const isSelected = currentPath === selectedFile;
    const color = isSelected ? "#ffffff" : "gray.300";
    return (
      <Box key={currentPath} ml={4}>
        <MenuRoot>
          <MenuContextTrigger w="full" onContextMenu={(e) => handleContextMenu(e, currentPath)}>
            <Flex
              alignItems="center"
              onClick={() => {
                if (node.children) {
                  toggleFolder(currentPath);
                } else {
                  handleFileOpen(currentPath);
                }
              }}
              cursor="pointer"
            >
              {node.children ? (
                expanded[currentPath] ? (
                  <Icon color={color}>
                    <BiChevronDown />
                  </Icon>
                ) : (
                  <Icon color={color}>
                  <BiChevronRight />
                </Icon>
                )
              ) : (
                fileExtension === "js" ? (
                  <Icon color={color}>
                  <SiJavascript />
                </Icon>
                ) : fileExtension === "jsx" || fileExtension === "tsx" ? (
                  <Icon color={color}>
                  <FaReact />
                </Icon>
                ) : fileExtension === "ts" ? (
                  <Icon color={color}>
                  <SiTypescript />
                </Icon>
                ) : fileExtension === "py" ? (
                  <Icon color={color}>
                  <FaPython />
                </Icon>
                ) : null
              )}
              <Text ms={2} color={color}>{node.name}</Text>
            </Flex>
          </MenuContextTrigger>
          <MenuContent>
            {node.children ? (
              <>
                <MenuItem value="new-folder" onClick={() => handleCreateNewFolder(currentPath)}>Create New Folder<Kbd>ctrl + n</Kbd></MenuItem>
                <MenuItem value="new-file" onClick={() => handleCreateNewFile(currentPath)}>Create New File<Kbd>ctrl + shift + n</Kbd></MenuItem>
                <MenuItem value="rename" onClick={() => handleRename(currentPath)}>Rename <Kbd>ctrl + g</Kbd></MenuItem>
                <MenuItem value="delete" onClick={() => handleDelete(currentPath)}>Delete <Kbd>delete</Kbd></MenuItem>
              </>
            ) : (
              <>
                <MenuItem value="rename" onClick={() => handleRename(currentPath)}>Rename <Kbd>ctrl + g</Kbd></MenuItem>
                <MenuItem value="delete" onClick={() => handleDelete(currentPath)}>Delete <Kbd>delete</Kbd></MenuItem>
                <MenuItem value="copy-path" onClick={() => handleCopyPath(currentPath)}>Copy File Path <Kbd>ctrl + q</Kbd></MenuItem>
              </>
            )}
            <MenuItem value="export" onClick={() => handleExport(currentPath)}>Export <Kbd>ctrl + o</Kbd></MenuItem>
          </MenuContent>
        </MenuRoot>
        {expanded[currentPath] &&
          node.children &&
          node.children.map((child) => renderTree(child, currentPath))}
      </Box>
    );
  };

  const handleFileOpen = (filePath: string) => {
    const isFileOpen = openFile.some((file: fileTypes) => file.name === filePath);

    if (isFileOpen) {
      console.log(`Can't open ${filePath} file multiple times`);
    } else {
      const fileObj = {
        name: filePath,
        code: "",
      };
      dispatch(addSelectedFile(filePath));
      dispatch(addFile(fileObj));
    }
  };


  return (
    <Box width="15%" height="100vh" p={4} bg={"#1c2333"} color={"#ffffff"}>
      {fileTree ? renderTree(fileTree) : null}
      <DialogRoot open={isDialogOpen} onOpenChange={(details) => setIsDialogOpen(details.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {renameData?.itemOldPath.split("/").pop() || ""}
              {renameData?.itemOldPath && renameData.itemOldPath.length !== 0 && renameData.itemOldPath.split("/").pop()?.includes(".") ? " file" : " directory"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Input value={renameData.itemNewName} placeholder="Enter a name..." onChange={(e) => setRenameData({ ...renameData, itemNewName :e.target.value})} />
          </DialogBody>
          <DialogFooter>
            <Button onClick={handleRenamePopup} disabled={renameData.itemNewName.trim() === "" ? true : false}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default Tree;
