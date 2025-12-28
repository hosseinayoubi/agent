import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, FileText, Linkedin, Save } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function Profile() {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();

  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || "");
  const [targetLocation, setTargetLocation] = useState(profile?.targetLocation || "");

  const handleSave = () => {
    updateMutation.mutate(
      { linkedinUrl, targetLocation },
      {
        onSuccess: () => toast({ title: "Profile updated successfully" }),
        onError: () => toast({ title: "Failed to update profile", variant: "destructive" })
      }
    );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>

        <Tabs defaultValue="resume" className="space-y-8">
          <TabsList className="bg-card border border-white/5 p-1 h-auto rounded-xl">
            <TabsTrigger value="resume" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg py-2.5 px-6">
              Resume / CV
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg py-2.5 px-6">
              Details & Preferences
            </TabsTrigger>
          </TabsList>

          {/* Resume Upload Tab */}
          <TabsContent value="resume">
            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle>Resume Upload</CardTitle>
                <CardDescription>Upload your latest CV to help us match you with the best jobs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUploader onUpload={(url) => updateMutation.mutate({ cvFileUrl: url })} />
                
                {profile?.cvFileUrl && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium">Current Resume</p>
                        <p className="text-xs text-muted-foreground">Uploaded recently</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Update your online presence and job preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="https://linkedin.com/in/..." 
                      className="pl-10"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Location</Label>
                  <Input 
                    placeholder="e.g. Remote, London, New York" 
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Parsed Skills</Label>
                  <div className="p-4 bg-background rounded-lg border border-white/10 min-h-[100px]">
                    {profile?.parsedSkills && (profile.parsedSkills as string[]).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(profile.parsedSkills as string[]).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">
                        Upload your resume to automatically extract skills.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FileUploader({ onUpload }: { onUpload: (url: string) => void }) {
  // Mock upload for now - in production this would upload to S3/Storage
  const onDrop = async (acceptedFiles: File[]) => {
    // Simulate upload delay
    setTimeout(() => {
      onUpload("mock_cv_url.pdf");
    }, 1000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,
    accept: { 'application/pdf': ['.pdf'] }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
        ${isDragActive 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-white/10 hover:border-primary/50 hover:bg-white/5"
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
        <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <p className="font-medium text-lg mb-1">
        {isDragActive ? "Drop your resume here" : "Click to upload or drag and drop"}
      </p>
      <p className="text-sm text-muted-foreground">PDF only (max 10MB)</p>
    </div>
  );
}
