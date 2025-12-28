import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertJobApplication } from "@shared/routes";

// --- Job Search ---
export function useSearchJobs() {
  return useMutation({
    mutationFn: async (params: { query: string; location: string }) => {
      const validated = api.jobs.search.input.parse(params);
      const res = await fetch(api.jobs.search.path, {
        method: api.jobs.search.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search jobs");
      return api.jobs.search.responses[200].parse(await res.json());
    },
  });
}

// --- Job Matching Analysis ---
export function useMatchJob() {
  return useMutation({
    mutationFn: async (params: { jobDescription: string }) => {
      const validated = api.jobs.match.input.parse(params);
      const res = await fetch(api.jobs.match.path, {
        method: api.jobs.match.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze job match");
      return api.jobs.match.responses[200].parse(await res.json());
    },
  });
}

// --- Generate Application Material ---
export function useGenerateApplication() {
  return useMutation({
    mutationFn: async (params: { jobDescription: string; jobTitle: string; companyName: string }) => {
      const validated = api.jobs.generate.input.parse(params);
      const res = await fetch(api.jobs.generate.path, {
        method: api.jobs.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate application materials");
      return api.jobs.generate.responses[200].parse(await res.json());
    },
  });
}

// --- Save Job Application ---
export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJobApplication) => {
      const validated = api.jobs.save.input.parse(data);
      const res = await fetch(api.jobs.save.path, {
        method: api.jobs.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save job");
      return api.jobs.save.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.listSaved.path] });
    },
  });
}

// --- List Saved Jobs ---
export function useSavedJobs() {
  return useQuery({
    queryKey: [api.jobs.listSaved.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.listSaved.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved jobs");
      return api.jobs.listSaved.responses[200].parse(await res.json());
    },
  });
}
