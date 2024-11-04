"use client"
import CodeEditor from '@/app/components/CodeEditor';
import Terminal from '@/app/components/Terminal';
import Tree from '@/app/components/Tree';

import { Flex } from '@chakra-ui/react';
import { useParams } from 'next/navigation'


const Editor = () => {
    const { docker_id } = useParams();

    return (
            <Flex width={"100%"}>
                <Tree />
                <CodeEditor />
            <Terminal containerId={docker_id} />
        </Flex>
    );
}

export default Editor;
