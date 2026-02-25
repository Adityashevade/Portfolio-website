import { Github, Linkedin, Mail, Phone, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const Contact = () => {
    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="min-h-screen pt-40 px-6 md:px-12 lg:px-20 pb-20"
        >
            <div className="max-w-4xl mx-auto space-y-12">
                <Link to="/" className="flex items-center gap-2 text-primary font-bold hover:underline mb-8">
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <h1 className="text-6xl md:text-8xl font-netflix uppercase">
                    CONTACT <span className="text-gray-700 font-outline">ME</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-10 bg-[#141414] border border-gray-900 space-y-6">
                        <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Personal</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-xl">
                                <Mail className="text-primary" />
                                <a href="mailto:adishev03@gmail.com" className="hover:text-primary transition-colors">adishev03@gmail.com</a>
                            </div>
                            <div className="flex items-center gap-4 text-xl">
                                <Phone className="text-primary" />
                                <span>+91 9324119497</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-[#141414] border border-gray-900 space-y-6">
                        <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Socials</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-xl">
                                <Linkedin className="text-primary" />
                                <a href="https://linkedin.com/in/aditya-shevade-1a440b23b" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn Profile</a>
                            </div>
                            <div className="flex items-center gap-4 text-xl">
                                <Github className="text-primary" />
                                <a href="https://github.com/Adityashevade" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub Repositories</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-primary/5 border border-primary/20 text-center space-y-6">
                    <h3 className="text-2xl font-bold italic underline-offset-8 underline decoration-primary">Let's build something together</h3>
                    <p className="text-gray-400 max-w-xl mx-auto">I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>
                    <Button size="lg" className="bg-primary text-white hover:bg-red-700 px-12 py-7 font-bold rounded-none" asChild>
                        <a href="mailto:adishev03@gmail.com">Send an Email</a>
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export default Contact
