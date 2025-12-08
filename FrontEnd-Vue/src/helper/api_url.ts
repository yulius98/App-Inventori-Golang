import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if(!API_BASE) {
    throw new Error ('VITE_API_BASE_URL tidak ditemukan! Periksa file .env')
};

export const api = axios.create ({
    baseURL: API_BASE
});

