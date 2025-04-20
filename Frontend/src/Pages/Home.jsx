import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/use-theme'
import { ArrowRight, Star, CheckCircle, ChevronRight } from 'lucide-react'

const Home = () => {
  const { theme } = useTheme()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', damping: 12 }
    }
  }
  
  const floatVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: {
        repeat: Infinity,
        duration: 6,
        ease: "easeInOut"
      }
    }
  }
  
  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      content: "The AI-powered resume optimization helped me land interviews at top tech companies. Worth every penny!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "My application response rate increased by 70% after using this platform. The ATS verification tool is a game-changer.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Financial Analyst",
      content: "The personalized cover letters saved me hours of work and helped me stand out in a competitive field.",
      rating: 4
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section 
        className="relative h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-8 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background/95"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-secondary/10 blur-2xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-accent/15 blur-2xl"></div>
          
          {/* Abstract shapes */}
          <motion.div 
            className="absolute top-[15%] right-[10%] w-16 h-16 rounded-full border-4 border-primary/20"
            variants={floatVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.div 
            className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full border-4 border-secondary/20"
            variants={floatVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1 }}
          />
        </div>

        <motion.div 
          className="relative z-10 bg-background/40 backdrop-blur-sm p-8 rounded-2xl border border-accent/10 shadow-xl"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-foreground mb-4"
            variants={itemVariants}
          >
            Elevate Your <span className="text-primary">Career Journey</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
            variants={itemVariants}
          >
            Transforming resumes into opportunities with AI-powered precision. Your path to professional excellence starts here.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 h-12 px-8"
            >
              Get Started <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link 
              to="/dashboard/chat" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all border border-accent/50 bg-background/80 shadow-md hover:shadow-lg hover:bg-accent/20 hover:text-accent-foreground h-12 px-8"
            >
              Try Demo
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-16 px-4 md:px-8 bg-gradient-to-b from-background via-accent/5 to-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-6"
          variants={itemVariants}
        >
          Our <span className="text-primary">Approach</span>
        </motion.h2>
        
        <motion.p 
          className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
          variants={itemVariants}
        >
          We combine cutting-edge AI with expert design to create documents that truly represent your professional value.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <motion.div 
            className="bg-card text-card-foreground flex flex-col gap-4 rounded-xl border border-accent/20 p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/20"
            variants={featureVariants}
          >
            <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Resume Enhancement</h3>
            <p className="text-muted-foreground">Our intelligent algorithms analyze and optimize your resume to highlight your strengths and match industry standards.</p>
          </motion.div>

          <motion.div 
            className="bg-card text-card-foreground flex flex-col gap-4 rounded-xl border border-accent/20 p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/20"
            variants={featureVariants}
          >
            <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Personalized Cover Letters</h3>
            <p className="text-muted-foreground">Create tailored cover letters that complement your resume and speak directly to your target employers.</p>
          </motion.div>

          <motion.div 
            className="bg-card text-card-foreground flex flex-col gap-4 rounded-xl border border-accent/20 p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/20"
            variants={featureVariants}
          >
            <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">ATS Verification</h3>
            <p className="text-muted-foreground">Ensure your application passes through Applicant Tracking Systems with our advanced verification tools.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-16 px-4 md:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          variants={itemVariants}
        >
          What Our <span className="text-primary">Users Say</span>
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-card text-card-foreground flex flex-col gap-4 rounded-xl border border-accent/20 p-6 shadow-md"
              variants={featureVariants}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex gap-1 text-amber-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground italic">{testimonial.content}</p>
              <div className="mt-auto pt-4 border-t border-accent/10">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* Philosophy Section */}
      <motion.section 
        className="py-16 px-4 md:px-8 bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 border-y border-accent/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8"
            variants={itemVariants}
          >
            Our <span className="text-primary">Philosophy</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            variants={itemVariants}
          >
            We believe in the power of minimalism and precision. Your professional story deserves to be told with clarity and impact. Our approach combines cutting-edge AI technology with elegant design principles to create documents that stand out while maintaining a clean, sophisticated aesthetic.
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground leading-relaxed"
            variants={itemVariants}
          >
            Every career journey is unique. We don't just create documents; we craft personalized narratives that authentically represent your professional identity and aspirations.
          </motion.p>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 px-4 md:px-8 bg-gradient-to-r from-primary/5 via-background to-primary/5 border-y border-accent/20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            variants={itemVariants}
          >
            Ready to Transform Your <span className="text-primary">Career?</span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            variants={itemVariants}
          >
            Join thousands of professionals who have elevated their job search with our platform.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 h-12 px-8"
            >
              Get Started Today <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t bg-accent/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Resume AI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
