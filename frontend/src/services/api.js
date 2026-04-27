import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "https://visitor-pass-management-system-sw19.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const getAuthConfig = () =>{
  const token = localStorage.getItem("token");
  return{
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    }
  }
}

export default API;
