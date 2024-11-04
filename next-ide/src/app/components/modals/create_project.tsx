"use client"
import { Button } from "@/components/ui/button"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Box, Input, Flex, HStack, Text, createListCollection, Icon  } from "@chakra-ui/react"

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { Field } from "@/components/ui/field"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar } from "@/components/ui/avatar"
import { Tag } from "@/components/ui/tag"

import { useState } from "react"
import { RiAddFill, RiHeart2Line, RiNextjsLine, RiNodejsLine, RiSvelteLine } from "react-icons/ri"
import { FaAngular, FaFlask, FaJava, FaPython, FaReact, FaVuejs } from "react-icons/fa6"
import { DiDjango } from "react-icons/di"
import { SiCsharp } from "react-icons/si"

import { createProject } from "@/services/REST/Porject.Service"
import { useRouter } from "next/navigation"

const iconMap: Record<string, React.ElementType> = {
  RiNextjsLine,
  RiNodejsLine,
  FaReact,
  FaVuejs,
  FaAngular,
  RiSvelteLine,
  DiDjango,
  FaFlask,
  FaJava,
  SiCsharp,
  FaPython,
};


const CreateProjectPage = () => {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [template, setTemplate] = useState<string>("");
  const [repoType, setRepoType] = useState<string>("public");
  const [isSubmited, setIsSubmited] = useState(false)
  const [projectsLeft, setProjectsLeft] = useState(0)
  const [project, setProject] = useState(0)

  const handleCreate = async () => {
    const newProject = {
      projectName : title,
      image : template,
      language : template,
      repoType : repoType,
      stats : {
        likes : 25,
        downloads : 65,
      },
    }

    const response = await createProject(newProject, "671773ad4649cbf1dd60c386")
    if(response.status === 200) {
      const project_local = response.data
      setProjectsLeft(project_local.user.projects.length)
      setProject(project_local.user)
      router.push(`/editor/${project_local.user.email}/${project_local.container_id}`)

    }
  }
  return (
    <Box mt={4}>
      <DialogRoot>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Create Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a template</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <Flex direction="row" gap="4" justify="center">
  <Box flex="1" display="flex" flexDirection="column" justifyContent="space-between">
    <SelectRoot collection={frameworks} size="sm" width="100%">
      <SelectLabel>Template</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder="Search Framework" />
      </SelectTrigger>
      <SelectContent style={{ zIndex: 9999, position: 'relative' }}>
        {frameworks.items.map((framework) => (
          <SelectItem item={framework} key={framework.value} onClick={() => setTemplate(framework.value)}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
    {frameworks.items.map((framework) => {
      // iconMap["RiNextjsLine"]
      return (
          <Box key={framework.value}>
          {template === framework.value && (
            <Flex direction="column" justify="space-between" height="100%">
          <Flex justify="space-between" alignItems="center" mt={4}>
        <Icon style={{ width: "32px", height: "32px" }}>
          <RiNextjsLine />
        </Icon>
            {/* <Avatar name="p y" shape="rounded" size="md" /> */}
            <Tag size="sm" colorPalette={"purple"}>
                {framework.tag}
              </Tag>
          </Flex>
          <Text fontSize="2xl" mt={2}>{framework.label}</Text>
          <Box>
    
          <Text fontSize="sm" mt={10} color="gray.500">
          {framework.description}
          </Text>
         <Flex alignItems={"center"} justify={"space-between"} mt={2}>
         <Flex alignItems={"center"} >
          <Avatar
            name="Dan Abramov"
            src="https://bit.ly/dan-abramov"
            shape="full"
            size="xs"
            />
              <Text fontSize="sm" color="gray.500" ms={2}>
            Aliasger
          </Text>
            </Flex>
            <Flex>
            <Flex alignItems={"center"} me={1}>
         <RiHeart2Line  />
              <Text fontSize="xs" color="gray.500">
              {framework.likes}
          </Text>
            </Flex>
            <Flex alignItems={"center"}>
         <RiAddFill  />
              <Text fontSize="xs" color="gray.500">
              {framework.downloads}
          </Text>
            </Flex>
            </Flex>
    
         </Flex>
          </Box>
        </Flex>
          )}
    
        </Box>
         )}
      )
    }
  </Box>
  <Box flex="1" display="flex" flexDirection="column" justifyContent="space-between">
    <Field label="Title" required invalid={title.length === 0 && isSubmited} errorText="This field is required">
      <Input value={title} placeholder="Enter your Title" onChange={(e) => setTitle(e.target.value)} />
    </Field>
    <RadioGroup defaultValue="1" mt={4} value={repoType} onValueChange={(e) => setRepoType(e.value)}>
      <Flex gap="2" direction="column">
        <Radio value="public">Public</Radio>
        <Radio value="private">Private</Radio>
      </Flex>
    </RadioGroup>
    <HStack mt={4} justify="space-between">
      <Text textStyle="sm" me={2}>{ 3 - projectsLeft } free projects left</Text>
      <Checkbox value="1" defaultChecked readOnly />
      <Checkbox value="2" readOnly />
      <Checkbox value="3" readOnly />
    </HStack>
  </Box>
</Flex>

          </DialogBody>
          <DialogFooter>
            <Button width={"50%"} onClick={handleCreate}><RiAddFill /> Create project</Button>
          </DialogFooter>
          <Box>
  <DialogCloseTrigger />
</Box>
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}
const frameworks = createListCollection({
  items: [
    { 
      label: "Next.js", 
      value: "next", 
      description: "A React framework for production-grade web applications with server-side rendering.", 
      icon: "RiNextjsLine", 
      tag: "Framework", 
      likes: "1200", 
      downloads: "5000", 
    },
    { 
      label: "Node.js", 
      value: "node", 
      description: "A runtime environment for executing JavaScript code server-side.", 
      icon: "RiNodejsLine", 
      tag: "Runtime", 
      likes: "1500", 
      downloads: "7200", 
    },
    { 
      label: "React.js", 
      value: "react", 
      description: "A JavaScript library for building user interfaces efficiently with components.", 
      icon: "FaReact", 
      tag: "Library", 
      likes: "3000", 
      downloads: "15000", 
    },
    { 
      label: "Vue.js", 
      value: "vue", 
      description: "An approachable, versatile framework for building user interfaces.", 
      icon: "FaVuejs", 
      tag: "Framework", 
      likes: "1800", 
      downloads: "8000", 
    },
    { 
      label: "Angular", 
      value: "angular", 
      description: "A platform for building mobile and desktop web applications in TypeScript.", 
      icon: "FaAngular", 
      tag: "Framework", 
      likes: "900", 
      downloads: "6000", 
    },
    { 
      label: "Svelte", 
      value: "svelte", 
      description: "A compiler that produces highly optimized vanilla JavaScript at build time.", 
      icon: "RiSvelteLine", 
      tag: "Framework", 
      likes: "1100", 
      downloads: "4300", 
    },
    { 
      label: "Python", 
      value: "python", 
      description: "A versatile programming language known for its readability and wide usage.", 
      icon: "FaPython", 
      tag: "Language", 
      likes: "2500", 
      downloads: "20000", 
    },
    { 
      label: "Django.py", 
      value: "django", 
      description: "A high-level Python web framework encouraging rapid development.", 
      icon: "DiDjango", 
      tag: "Framework", 
      likes: "900", 
      downloads: "5200", 
    },
    { 
      label: "Flask.py", 
      value: "flask", 
      description: "A lightweight WSGI web application framework in Python.", 
      icon: "FaFlask", 
      tag: "Framework", 
      likes: "750", 
      downloads: "4800", 
    },
    { 
      label: "Java", 
      value: "java", 
      description: "A high-level, class-based, object-oriented programming language.", 
      icon: "FaJava", 
      tag: "Language", 
      likes: "2100", 
      downloads: "13000", 
    },
    { 
      label: "C++", 
      value: "c++", 
      description: "A general-purpose programming language with low-level memory manipulation.", 
      icon: "SiCsharp", 
      tag: "Language", 
      likes: "1300", 
      downloads: "9500", 
    },
  ],
});


export default CreateProjectPage