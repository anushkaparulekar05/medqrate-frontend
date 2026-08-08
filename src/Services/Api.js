import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080/api" : "/api")
});

export default API;