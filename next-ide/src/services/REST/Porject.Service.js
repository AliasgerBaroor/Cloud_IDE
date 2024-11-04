import axios from "axios";

const API_URL = "http://localhost:8000/project/"

const createProject = async (project, _id) => {
    return await axios.put(`${API_URL}open/editor`, project, {headers : {"Authorization" : _id}})
}

const getFileContent = async (selectedFile) => {
return await axios.get(`${API_URL}files/content?path=${selectedFile}`)
}

const getTree = async () => {
return await axios.get(`${API_URL}files`)
}


export { createProject, getFileContent, getTree }