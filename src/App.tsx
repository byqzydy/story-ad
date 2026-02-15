import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Create from './pages/Create'
import Detail from './pages/Detail'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'
import CreationGuide from './pages/CreationGuide'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create-guide" element={<CreationGuide />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
