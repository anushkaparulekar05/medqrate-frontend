import axios from "axios";

const API = axios.create({
  baseURL: window.location.hostname === "localhost" ? "http://localhost:8080/api" : "/api"
});

export default API;