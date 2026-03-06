import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import CreateProduct from './pages/CreateProduct'
import CreateBrand from './pages/CreateBrand'
import CreatePromotion from './pages/CreatePromotion'
import Detail from './pages/Detail'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'
import CreationGuide from './pages/CreationGuide'
import AIAgent from './pages/AIAgent'
import AIAgentChat from './pages/AIAgentChat'
import MoviePlacement from './pages/MoviePlacement'
import MoviePlacementHome from './pages/MoviePlacementHome'
import ProjectDetail from './pages/ProjectDetail'
import VideoDetail from './pages/VideoDetail'
import FinalWork from './pages/FinalWork'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/create-brand" element={<CreateBrand />} />
        <Route path="/create-promotion" element={<CreatePromotion />} />
        <Route path="/create-guide" element={<CreationGuide />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/ai-agent-chat" element={<AIAgentChat />} />
        <Route path="/movie-placement" element={<MoviePlacement />} />
        <Route path="/movie-placement-home" element={<MoviePlacementHome />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/video-detail/:taskId" element={<VideoDetail />} />
        <Route path="/final-work/:taskId" element={<FinalWork />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
