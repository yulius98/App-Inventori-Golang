import React from 'react'
import axios from 'axios'

// Use environment variable or fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const Api = axios.create({ 
    baseURL: baseURL,
    withCredentials: true,  // Penting untuk CORS dengan credentials
    headers: {
        'Content-Type': 'application/json',
    }
}) 

export default Api
