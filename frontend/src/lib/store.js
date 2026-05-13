import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      jobs: [],
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, { ...job, id: crypto.randomUUID() }] })),
      updateJob: (id, updatedJob) => set((state) => ({
        jobs: state.jobs.map(job => (job.id === id ? { ...job, ...updatedJob } : job))
      })),
      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter(job => job.id !== id)
      }))
    }),
    {
      name: 'job-storage',
    }
  )
);

export default useStore;
