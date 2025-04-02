import { useState } from 'react'
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage"
import Lobby from "./pages/Lobby"
import Room from "./pages/Room"
import NoPage from "./pages/NoPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/lobby" element={<Lobby />}/>
      <Route path="/rooms/:roomId" element={<Room />}/>
      <Route path="*" element={<NoPage />} />
    </Routes>
  )
}

export default App
