import axios from "axios";

const API_URL = "http://localhost:8000/api/v1/project/"

const createProject = async (project, _id) => {
    return await axios.put(`${API_URL}open/editor`, project, {headers : {"Authorization" : _id}})
}

const getFileContent = async (selectedFile) => {
return await axios.get(`${API_URL}files/content?path=${selectedFile}`)
}

const getTree = async () => {
return await axios.get(`${API_URL}files`)
}
const getFullPath = async (selectedFile) => {
return await axios.get(`${API_URL}item?path=${selectedFile}`)
}
const RenameItem = async (renameObject) => {
return await axios.put(`${API_URL}item/rename`, renameObject)
}
const CreateFolder = async (createFolderObject) => {
return await axios.post(`${API_URL}item/create/folder`, createFolderObject)
}


export { createProject, getFileContent, getTree, getFullPath, RenameItem, CreateFolder }