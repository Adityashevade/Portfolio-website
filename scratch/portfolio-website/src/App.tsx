import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Home from "./pages/Home"
import Contact from "./pages/Contact"
import { Github, Linkedin } from "lucide-react"

function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="group cursor-pointer">
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110 duration-300">
          <path d="M20 5L35 45H28L20 22L12 45H5L20 5Z" fill="#E50914" className="drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]" />
          <path d="M14 30H26V36H14V30Z" fill="#E50914" />
        </svg>
      </Link>
      <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-300 uppercase tracking-widest">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>
      <div className="flex items-center gap-4">
        <a href="https://github.com/Adityashevade" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Github size={20} /></a>
        <a href="https://linkedin.com/in/aditya-shevade-1a440b23b" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="py-20 px-6 md:px-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-10">
      <div className="space-y-4 text-center md:text-left">
        <h2 className="text-4xl font-bold tracking-tighter text-primary">ADITYA.</h2>
        <p className="text-sm text-gray-500 max-w-xs font-medium">Building intelligent solutions with precision and passion.</p>
      </div>
      <div className="flex gap-8 text-gray-500 uppercase text-[10px] font-bold tracking-[0.3em]">
        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        <a href="https://linkedin.com/in/aditya-shevade-1a440b23b" className="hover:text-white transition-colors">LinkedIn</a>
      </div>
      <p className="text-[10px] text-gray-700 font-bold tracking-widest">
        © {new Date().getFullYear()} ADITYA SHEVADE — ALL RIGHTS RESERVED
      </p>
    </footer>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-hidden">
        <Navigation />
        <AnimatedRoutes />
        <Footer />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Netflix+Sans:wght@700&display=swap');
          .font-outline {
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
            color: transparent;
          }
        `}</style>
      </div>
    </Router>
  )
}

export default App
