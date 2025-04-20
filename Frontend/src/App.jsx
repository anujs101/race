import { useState } from 'react'
import './App.css'
import Dashboard from './Pages/Dashboard'
import { ThemeProvider } from './hooks/use-theme'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import CoverLetter from './Pages/CoverLetter'
import AtsVerifier from './Pages/ATSVerifier'
import Chat from './Pages/Chat&Latex'
import GetJob from './Pages/GetJob'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
          <Route path='/dashboard' element={<Dashboard />} >
            <Route index element={<Chat />} />
            <Route path="cover" element={<CoverLetter />} />
            <Route path="ats-verifier" element={<AtsVerifier />} />
            <Route path="chat" element={<Chat />} />
            <Route path="get-job" element={<GetJob />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
