"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Upload,
  Brain,
  Zap,
  Calendar,
  MessageSquare,
  FileText,
  Star,
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react"

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const testimonialsRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true })
  const featuresInView = useInView(featuresRef, { once: true })
  const testimonialsInView = useInView(testimonialsRef, { once: true })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"])

  // Particle animation state (fix SSR window error)
  type ParticlePosition = {
    x: number;
    y: number;
    duration: number;
    delay: number;
  };
  const [particlePositions, setParticlePositions] = useState<ParticlePosition[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setParticlePositions(
        Array.from({ length: 50 }).map(() => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2,
        }))
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-gray-950 to-cyan-900/20"
        />
        <div className="absolute inset-0">
          {/* Floating Particles */}
          {/* Fix: Only render particles after mount, with client-side positions */}
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
              initial={{
                x: pos.x,
                y: pos.y,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: pos.duration,
                repeat: Number.POSITIVE_INFINITY,
                delay: pos.delay,
              }}
            />
          ))}
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(139,92,246,0.3)",
                    "0 0 40px rgba(139,92,246,0.6)",
                    "0 0 20px rgba(139,92,246,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Project Theta
              </motion.h1>
            </div>
          </motion.div>

          <motion.h2
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            style={{ y: textY }}
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
              Smarter Courses.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Custom AI Assistants.
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              One Click Away.
            </span>
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Project Theta transforms your class materials into AI companions that{" "}
            <span className="text-violet-400 font-semibold">summarize</span>,{" "}
            <span className="text-cyan-400 font-semibold">schedule</span>, and{" "}
            <span className="text-violet-400 font-semibold">support</span> — built for students, educators, and admins.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your Assistant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-violet-500/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating UI Preview */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 1 }}
          >
            <div className="relative max-w-4xl mx-auto">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-3xl blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
              <Card className="relative bg-gray-900/80 backdrop-blur-xl border-violet-500/30 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI Assistant Active</h3>
                      <p className="text-gray-400">Ready to help with ECON210</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-violet-500 to-cyan-500 rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
                        <p className="text-white text-sm">Can you summarize today's lecture on market structures?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 max-w-md">
                        <p className="text-gray-200 text-sm">
                          I've analyzed your lecture notes. Here's a summary of market structures: Perfect competition,
                          monopoly, oligopoly, and monopolistic competition...
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transform your course materials into intelligent AI assistants in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload or Connect",
                description: "Plug in LMS content, slides, or syllabus. Connect Canvas, upload PDFs, or paste links.",
                icon: Upload,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "Train Your Agent",
                description: "Theta processes and builds your assistant in seconds using advanced AI models.",
                icon: Brain,
                color: "from-violet-500 to-purple-500",
              },
              {
                step: "03",
                title: "Start Using It",
                description: "Ask questions, generate flashcards, get reminders, and boost your learning.",
                icon: Zap,
                color: "from-cyan-500 to-violet-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <Card className="h-full bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-violet-500/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-violet-500/10">
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <motion.div
                        className={`h-20 w-20 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mx-auto`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <item.icon className="h-10 w-10 text-white" />
                      </motion.div>
                      <div className="absolute -top-2 -right-2 bg-gray-800 text-violet-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-violet-500/30">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              What Theta Can Do
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful AI capabilities designed to enhance every aspect of your learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Course Summarization",
                description: "Instantly digest lectures, readings, and materials into clear, actionable summaries.",
                icon: FileText,
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Flashcard Generation",
                description: "Auto-create study cards from your content with spaced repetition algorithms.",
                icon: Brain,
                color: "from-violet-500 to-purple-500",
              },
              {
                title: "Smart Scheduling",
                description: "AI-powered study plans that adapt to your pace and optimize learning outcomes.",
                icon: Calendar,
                color: "from-green-500 to-emerald-500",
              },
              {
                title: "LMS Integration",
                description: "Seamlessly connect with Canvas, Blackboard, and other learning management systems.",
                icon: Target,
                color: "from-orange-500 to-red-500",
              },
              {
                title: "Daily Insights",
                description: "Receive personalized recap emails and intelligent to-do recommendations.",
                icon: BarChart3,
                color: "from-pink-500 to-rose-500",
              },
              {
                title: "Context-Aware Chat",
                description: "Ask questions about your specific course content with full context understanding.",
                icon: MessageSquare,
                color: "from-cyan-500 to-violet-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-violet-500/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-violet-500/10">
                  <CardContent className="p-6">
                    <motion.div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Loved by Students & Educators
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how Project Theta is transforming learning experiences across universities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Project Theta completely changed how I study. The AI summaries save me hours, and the flashcards are perfectly tailored to my course content.",
                name: "Sarah Chen",
                role: "Computer Science Student",
                course: "CS101 - Fall 2024",
                rating: 5,
                avatar: "S",
              },
              {
                quote:
                  "As an instructor, I love how Theta helps my students stay organized and engaged. The integration with Canvas is seamless.",
                name: "Dr. Michael Rodriguez",
                role: "Professor of Economics",
                course: "ECON210 - Microeconomics",
                rating: 5,
                avatar: "M",
              },
              {
                quote:
                  "The smart scheduling feature is a game-changer. It knows exactly when I should review material for optimal retention.",
                name: "Alex Thompson",
                role: "Biology Major",
                course: "BIO301 - Cell Biology",
                rating: 5,
                avatar: "A",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-violet-500/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-violet-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                        <Badge variant="outline" className="mt-1 text-xs border-violet-500/30 text-violet-300">
                          {testimonial.course}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-3xl blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            />
            <Card className="relative bg-gray-900/80 backdrop-blur-xl border-violet-500/30 rounded-3xl overflow-hidden">
              <CardContent className="p-12">
                <motion.h2
                  className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Your Class Has Evolved.
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    Time to Meet Your AI Assistant.
                  </span>
                </motion.h2>
                <motion.p
                  className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Join thousands of students and educators who are already using AI to enhance their learning
                  experience.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="text-xl px-12 py-6 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
                    >
                      <Sparkles className="mr-3 h-6 w-6" />
                      Start Building Yours Now
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Project Theta
                </h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Project Theta is building the future of education — one AI assistant at a time.
              </p>
              <motion.div
                className="text-sm text-violet-400 font-mono"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {">"} System Status: Online
                <br />
                {">"} AI Models: Active
                <br />
                {">"} Ready for deployment...
              </motion.div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-violet-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-violet-400 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-4">
                {[
                  { icon: Github, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: MessageCircle, href: "#" },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="h-10 w-10 rounded-lg bg-gray-800 hover:bg-violet-500/20 flex items-center justify-center text-gray-400 hover:text-violet-400 transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Project Theta. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
