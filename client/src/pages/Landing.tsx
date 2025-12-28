import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, ArrowRight, CheckCircle, Upload, Search, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return null;

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={container}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Job Hunting</span>
          </motion.div>

          <motion.h1 variants={item} className="text-5xl md:text-7xl font-display font-bold leading-tight">
            Your dream job, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
              matched instantly.
            </span>
          </motion.h1>

          <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your CV, find perfectly matched roles, and let AI generate tailored cover letters and resumes for every application.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8" onClick={() => window.location.href = "/api/login"}>
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8">
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
        >
          <FeatureCard 
            icon={<Upload className="w-6 h-6 text-primary" />}
            title="Upload Profile"
            description="Drag & drop your CV or link your LinkedIn. We parse your skills instantly."
          />
          <FeatureCard 
            icon={<Search className="w-6 h-6 text-purple-400" />}
            title="Smart Matching"
            description="Our AI analyzes job descriptions to find roles that actually fit your experience."
          />
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-blue-400" />}
            title="Auto-Apply"
            description="Generate custom CVs and cover letters tailored to each specific job description."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card/50 border border-white/5 hover:bg-card hover:border-primary/20 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-background border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
