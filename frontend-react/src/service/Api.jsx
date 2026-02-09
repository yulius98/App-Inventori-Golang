import React from 'react'
import axios from 'axios'

const Api = axios.create({ 
    baseURL : 'http://localhost:8080',
    withCredentials: true,  // Penting untuk CORS dengan credentials
    headers: {
        'Content-Type': 'application/json',
    }
}) 

export default Api
