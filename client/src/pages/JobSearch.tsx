import { useState } from "react";
import { useSearchJobs, useMatchJob, useGenerateApplication, useSaveJob } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  MapPin, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  Loader2,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const searchMutation = useSearchJobs();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      toast({ title: "Please enter a job title", variant: "destructive" });
      return;
    }
    searchMutation.mutate({ query, location });
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Find Your Next Role</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search for jobs and let our AI analyze the match against your profile.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 bg-card border-white/10 shadow-2xl shadow-black/20 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Job title, keywords, or company" 
                className="pl-10 h-12 bg-background border-transparent focus:border-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Location (Remote, New York, etc.)" 
                className="pl-10 h-12 bg-background border-transparent focus:border-primary"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button 
              size="lg" 
              type="submit" 
              className="h-12 px-8"
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Jobs"}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {searchMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground animate-pulse">Scanning job boards...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {searchMutation.data?.map((job: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <JobCard job={job} onSelect={() => setSelectedJob(job)} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {searchMutation.data?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No jobs found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Match Analysis Modal */}
      {selectedJob && (
        <JobAnalysisModal 
          job={selectedJob} 
          open={!!selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}

function JobCard({ job, onSelect }: { job: any; onSelect: () => void }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row gap-6">
        {job.logo && (
          <img 
            src={job.logo} 
            alt={job.company} 
            className="w-16 h-16 rounded-lg object-contain bg-white p-2"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4" /> {job.company}
                <span className="w-1 h-1 rounded-full bg-white/20 mx-1" />
                <MapPin className="w-4 h-4" /> {job.location}
              </p>
            </div>
            {job.date && (
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                {job.date}
              </span>
            )}
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Button onClick={onSelect} className="group-hover:translate-x-1 transition-transform">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Match
            </Button>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">View Original <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobAnalysisModal({ job, open, onClose }: { job: any; open: boolean; onClose: () => void }) {
  const matchMutation = useMatchJob();
  const generateMutation = useGenerateApplication();
  const saveMutation = useSaveJob();
  const { toast } = useToast();

  // Run analysis on mount
  useState(() => {
    matchMutation.mutate({ jobDescription: job.description });
  });

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        jobDescription: job.description,
        jobTitle: job.title,
        companyName: job.company
      });

      await saveMutation.mutateAsync({
        jobTitle: job.title,
        companyName: job.company,
        matchPercentage: matchMutation.data?.matchPercentage,
        jobUrl: job.url,
        description: job.description,
        customCvUrl: "generated", // Placeholder for now
        coverLetterUrl: "generated", // Placeholder for now
      });

      toast({ title: "Application generated & saved!", description: "Check your dashboard." });
      onClose();
    } catch (e) {
      toast({ title: "Error generating application", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">{job.title}</DialogTitle>
          <DialogDescription>{job.company}</DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {matchMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium animate-pulse">Analyzing compatibility...</p>
            </div>
          ) : matchMutation.isError ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Failed to analyze job. Please try again.
            </div>
          ) : (
            <>
              {/* Score Ring */}
              <div className="flex items-center gap-6 bg-background/50 p-6 rounded-xl border border-white/5">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="48" cy="48" r="40" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * (matchMutation.data?.matchPercentage || 0)) / 100}
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">
                    {matchMutation.data?.matchPercentage}%
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">Match Analysis</h4>
                  <p className="text-sm text-muted-foreground">{matchMutation.data?.analysis}</p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                    <ThumbsUp className="w-4 h-4" /> Matching Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {matchMutation.data?.matchingSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" /> Missing Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {matchMutation.data?.missingSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={generateMutation.isPending || saveMutation.isPending}
                  className="bg-gradient-to-r from-primary to-emerald-400 hover:opacity-90 transition-opacity"
                >
                  {(generateMutation.isPending || saveMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Generate Application
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
