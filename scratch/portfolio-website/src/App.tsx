import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"
import Home from "./pages/Home"
import Contact from "./pages/Contact"
import { Github, Linkedin } from "lucide-react"

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        className="text-[#E50914] text-9xl md:text-[20rem] font-bold font-netflix drop-shadow-[0_0_50px_rgba(229,9,20,0.8)]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1, 1, 7], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.5, times: [0, 0.2, 0.6, 1], ease: "easeIn" }}
      >
        A
      </motion.div>
    </motion.div>
  )
}

function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="group cursor-pointer">
        <span className="text-[#E50914] text-4xl md:text-5xl font-netflix font-bold inline-block transition-transform group-hover:scale-110 duration-300 drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">
          A
        </span>
      </Link>
      <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-300 uppercase tracking-widest">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <a href="/#certificates" className="hover:text-white transition-colors">Certificates & Achievements</a>
        <a href="/#hobbies" className="hover:text-white transition-colors">Hobbies</a>
        <a href="/#social-work" className="hover:text-white transition-colors">Social Work</a>
        <a href="/resume.pdf" target="_blank" className="hover:text-white transition-colors">Resume</a>
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
        <a href="/#certificates" className="hover:text-white transition-colors">Certificates & Achievements</a>
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
  const [showSplash, setShowSplash] = useState(true)

  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-hidden">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>
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
