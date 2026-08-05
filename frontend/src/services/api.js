import axios from "axios";

const API = axios.create({
    baseURL: "https://attendance-magic.vercel.app/",
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("access");

    if (token) {

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

export default API;