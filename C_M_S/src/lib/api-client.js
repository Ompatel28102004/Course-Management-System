// import axios from "axios";
// import {HOST} from "../utils/constants"

// export const apiClient = axios.create({
//     baseURL: HOST,
//     withCredentials: true,
// });
import axios from "axios";
import { HOST } from "../utils/constants";

export const apiClient = axios.create({
  baseURL: HOST,
  withCredentials: true,
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  

