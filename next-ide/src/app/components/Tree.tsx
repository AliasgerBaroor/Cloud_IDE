"use client";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FaFolder, FaJsSquare } from "react-icons/fa";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useEffect, useState } from "react";
import socket from "@/services/SOCKET/Socket";
import { getTree } from "@/services/REST/Porject.Service";
import { useDispatch, useSelector } from "react-redux";
import { addFile } from "@/redux/file_slice";


interface fileTypes {
  name : string;
  code : string,
}

type TreeNode = {
  name: string;
  children?: TreeNode[];
};

const Tree = () => {
  const openFile = useSelector((state: { file: fileTypes[] }) => state.file)
  const dispatch = useDispatch()
  const [fileTree, setFileTree] = useState<TreeNode | null>(null);
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleFolder = (path : string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const convertToTree = (input: Record<string, any>): TreeNode => {
    const convertHelper = (obj : Record<string, any>) : TreeNode[] => {
      const tree : TreeNode[] = [];
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

  const renderTree = (node : TreeNode, path : string  = "") => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    return (
      <Box key={currentPath} ml={4}>
        <Flex alignItems="center" onClick={() => {
           if (node.children) {
            toggleFolder(currentPath);
          } else {
            handleFileOpen(currentPath);
          }
        }} cursor="pointer">
          {node.children ? (
            expanded[currentPath] ? <BiChevronDown /> : <BiChevronRight />
          ) : (
            <FaJsSquare />
          )}
          <Text ms={2}>{node.name}</Text>
        </Flex>
        {expanded[currentPath] &&
          node.children &&
          node.children.map((child) => renderTree(child, currentPath))}
      </Box>
    );
  };

  const handleFileOpen = (filePath : string) => {
    const isFileOpen = openFile.some((file : fileTypes) => file.name === filePath);
    
    if (isFileOpen) {
      console.log(`Can't open ${filePath} file multiple times`);
    } else {
      const fileObj = {
        name: filePath,
        code: "",
      };
      dispatch(addFile(fileObj));
    }
  };
  return (
    <Box width="15%" p={4}>
     {fileTree ? renderTree(fileTree) : null}
    </Box>
  );
};

export default Tree;
