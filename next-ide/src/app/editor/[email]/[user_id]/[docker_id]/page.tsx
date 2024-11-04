"use client"
import CodeEditor from '@/app/components/CodeEditor';
import Terminal from '@/app/components/Terminal';
import Tree from '@/app/components/Tree';

import { Box, Center, Flex, Spinner } from '@chakra-ui/react';
import { useParams } from 'next/navigation'


const Editor = () => {
    const { docker_id } = useParams();

    return (
            <Flex width={"100%"} height="100vh">
                <Tree />
                <Box bg={"#0e1525"} height={"100%"} width={"1%"} display={"flex"} justifyContent={"center"} alignItems={"center"} cursor={"col-resize"}>
                  <Box height={"20px"} bg={"gray.400"} width={"4px"} />
                </Box>
                <CodeEditor />
                <Box bg={"#0e1525"} height={"100%"} width={"1%"} display={"flex"} justifyContent={"center"} alignItems={"center"} cursor={"col-resize"}>
                  <Box height={"20px"} bg={"gray.400"} width={"4px"} />
                </Box>
            <Terminal containerId={docker_id as string} />
            {/* <Box pos="absolute" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="gray.500" size="lg" />
        </Center>
      </Box> */}
        </Flex>
    );
}

export default Editor;
