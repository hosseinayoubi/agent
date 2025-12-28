import { useSavedJobs } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ExternalLink, 
  MoreVertical,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: jobs, isLoading } = useSavedJobs();

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold">Welcome back, {user?.firstName || 'User'}</h1>
            <p className="text-muted-foreground mt-2">Here's an overview of your job applications.</p>
          </div>
          <Link href="/jobs">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              Find New Jobs
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            label="Saved Applications" 
            value={jobs?.length || 0} 
            icon={<Briefcase className="w-5 h-5 text-primary" />} 
          />
          <StatCard 
            label="Materials Generated" 
            value={jobs?.filter(j => j.customCvUrl).length || 0} 
            icon={<FileText className="w-5 h-5 text-purple-400" />} 
          />
          <StatCard 
            label="Interviews" 
            value="0" 
            icon={<CheckCircle2 className="w-5 h-5 text-blue-400" />} 
          />
        </div>

        {/* Saved Jobs List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display">Recent Applications</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-card/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-white/10">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground mt-2 mb-6">Start searching for jobs to get matched.</p>
              <Link href="/jobs">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-card rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-200 group flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold truncate">{job.jobTitle}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                        {job.matchPercentage}% Match
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> {job.companyName}
                      </span>
                      <span className="hidden sm:flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Applied {format(new Date(job.appliedAt || new Date()), 'MMM d')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {job.customCvUrl ? (
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <FileText className="w-4 h-4 mr-2" /> View CV
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" className="flex-1 md:flex-none">
                        Draft
                      </Button>
                    )}
                    
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 pointer-events-none">
        {icon}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-background rounded-lg border border-white/10">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold">{value}</p>
    </div>
  );
}
