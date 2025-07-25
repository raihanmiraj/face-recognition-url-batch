import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
// axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.baseURL = 'https://facerecognition-rosy.vercel.app';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
