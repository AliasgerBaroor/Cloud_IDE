"use client"
import CodeEditor from '@/app/components/CodeEditor';
import Terminal from '@/app/components/Terminal';
import Tree from '@/app/components/Tree';

import { Box, Center, Flex, Spinner } from '@chakra-ui/react';
import { useParams } from 'next/navigation'


const Editor = () => {
    const { docker_id } = useParams();

    return (
            <Flex width={"100%"}>
                <Tree />
                <CodeEditor />
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
