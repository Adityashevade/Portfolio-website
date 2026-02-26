import { ArrowRight, GraduationCap, Code, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"


const Home = () => {
    const projects = [
        {
            title: "Reader Segmentation",
            subtitle: "Machine Learning • Unsupervised",
            description: "This project applies machine learning to a book dataset to segment readers based on their reading history and interests.",
            link: "https://github.com/Adityashevade/unsupervised-learning"
        },
        {
            title: "Churn Prediction",
            subtitle: "ML and Streamlit App",
            description: "This project uses customer information from a subscription-based service provider to predict churn (whether a customer will leave the service).",
            link: "https://github.com/Adityashevade/Machine-Learning"
        }
    ]

    const skills = [
        "Python Programming", "Machine Learning", "Artificial Intelligence", "Power BI",
        "PostgreSQL", "Deep Learning", "Generative AI", "NLP",
        "Docker", "React", "Prompt Engineering", "Fast-API"
    ]

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            {/* Hero Section */}
            <header className="relative h-[80vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 space-y-6 pt-20">
                <div className="z-10 max-w-4xl space-y-4">
                    <h1 className="text-6xl md:text-8xl font-netflix uppercase">
                        ADITYA SHEVADE
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                        Data Science Enthusiast • Passionate ML and GenAI Engineer
                    </p>
                    <div className="flex gap-4 pt-6">
                        <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-10 py-7 text-lg font-bold rounded-sm" asChild>
                            <a href="#certificates">Certificates</a>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-gray-500/30 border-none text-white hover:bg-gray-500/50 px-10 py-7 text-lg font-bold rounded-sm" asChild>
                            <a href="#projects">View Projects</a>
                        </Button>
                    </div>
                </div>
                {/* Soft back-glow */}
                <div className="absolute top-1/4 left-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
            </header>

            <main className="px-6 md:px-12 lg:px-20 pb-40 space-y-32">
                {/* About / Summary */}
                <section id="about" className="space-y-6 pt-10 border-t border-gray-900">
                    <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Summary</h2>
                    <p className="text-3xl md:text-5xl font-medium leading-[1.1] text-gray-200 max-w-5xl">
                        A Computer Engineering graduate dedicated to designing AI-powered frameworks that transform data into intelligent, value-driven solutions.
                    </p>
                </section>

                {/* Featured Projects */}
                <section id="projects" className="space-y-10">
                    <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Featured Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, idx) => (
                            <div key={idx} className="group relative bg-[#141414] border border-gray-900 rounded-sm overflow-hidden netflix-card-shadow h-full flex flex-col cursor-pointer">
                                <div className="p-8 flex-1 space-y-4">
                                    <Badge variant="outline" className="border-primary text-primary rounded-none uppercase text-[10px] font-bold tracking-widest">{project.subtitle}</Badge>
                                    <h3 className="text-2xl font-bold">{project.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-4">{project.description}</p>
                                </div>
                                <div className="p-8 pt-0 mt-auto">
                                    <Separator className="bg-gray-800 mb-4" />
                                    <div className="flex items-center justify-between group-hover:text-primary transition-colors">
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            Explore Code <ArrowRight size={14} />
                                        </a>
                                        <Code size={16} className="text-gray-700" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Experience & Skills Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Experience */}
                    <section id="experience" className="space-y-10">
                        <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Experience</h2>
                        <div className="space-y-8">
                            <div className="group border-l-2 border-primary pl-8 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">Python Developer Intern</h3>
                                    <span className="text-xs font-bold bg-primary text-white px-2 py-1">DEC 2025</span>
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">x-Biz Techventures Private Limited</p>
                                <ul className="text-gray-400 space-y-2 text-sm max-w-xl">
                                    <li>• Scripting logic for extracting packages from a Docker image.</li>
                                    <li>• Worked on actual API and React components.</li>
                                    <li>• Ensured Legal Compliance assurance.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Technical Skills */}
                    <section id="skills" className="space-y-10">
                        <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Technical Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-[#141414] text-gray-300 border border-gray-800 rounded-none px-4 py-2 hover:border-primary transition-luxury italic">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Education & Training */}
                <section id="education" className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8 p-10 bg-[#141414] border border-gray-900 rounded-sm">
                        <GraduationCap className="text-primary" size={32} />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold uppercase tracking-tight">BE Computer Engineering</h3>
                            <p className="text-gray-400">Rajiv Gandhi Institute of Technology</p>
                            <p className="text-xs text-gray-600 font-bold">2021 — 2025</p>
                        </div>
                    </div>
                    <div className="space-y-8 p-10 bg-[#141414] border border-gray-900 rounded-sm">
                        <BookOpen className="text-primary" size={32} />
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Data Science</h3>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Boston Institute of Analytics</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold uppercase tracking-tight">Artificial Intelligence</h3>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Boston Institute of Analytics</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Certificates & Achievements */}
                <section id="certificates" className="space-y-10">
                    <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">/ Certificates & Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Certificate 1: Infosys */}
                        <div className="group relative rounded-sm overflow-hidden bg-[#141414] border border-gray-900 netflix-card-shadow aspect-[4/3]">
                            <img
                                src="/certificates/infosys.jpg"
                                alt="Infosys Decision Trees using Python Certificate"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/141414/666666?text=Infosys+Certificate' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-lg font-bold truncate">Decision Trees using Python</h3>
                                <p className="text-sm text-primary font-bold uppercase tracking-widest">Infosys Springboard</p>
                            </div>
                        </div>

                        {/* Certificate 2: BIA AI */}
                        <div className="group relative rounded-sm overflow-hidden bg-[#141414] border border-gray-900 netflix-card-shadow aspect-[4/3]">
                            <img
                                src="/certificates/bia-ai.jpg"
                                alt="BIA Artificial Intelligence Certificate"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/141414/666666?text=BIA+AI+Certificate' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-lg font-bold truncate">Artificial Intelligence Classroom</h3>
                                <p className="text-sm text-primary font-bold uppercase tracking-widest">Boston Institute of Analytics</p>
                            </div>
                        </div>

                        {/* Certificate 3: BIA DS */}
                        <div className="group relative rounded-sm overflow-hidden bg-[#141414] border border-gray-900 netflix-card-shadow aspect-[4/3]">
                            <img
                                src="/certificates/bia-ds.jpg"
                                alt="BIA Data Science Certificate"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/141414/666666?text=BIA+DS+Certificate' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-lg font-bold truncate">Data Science Classroom</h3>
                                <p className="text-sm text-primary font-bold uppercase tracking-widest">Boston Institute of Analytics</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </motion.div>
    )
}

export default Home
