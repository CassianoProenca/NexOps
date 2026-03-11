import { api } from '@/lib/api'

export interface Department {
  id: string
  name: string
  description: string
  active: boolean
  createdAt: string
}

export interface ProblemType {
  id: string
  name: string
  description: string
  slaLevel: 'N1' | 'N2' | 'N3'
  active: boolean
  createdAt: string
}

export const helpdeskService = {
  // ─── Departments ──────────────────────────────────────────────────────────
  
  getDepartments: (): Promise<Department[]> =>
    api.get('/v1/departments').then((r) => r.data),

  createDepartment: (data: Partial<Department>): Promise<Department> =>
    api.post('/v1/departments', data).then((r) => r.data),

  deleteDepartment: (id: string): Promise<void> =>
    api.delete(`/v1/departments/${id}`).then(() => undefined),

  // ─── Problem Types ────────────────────────────────────────────────────────
  
  getProblemTypes: (): Promise<ProblemType[]> =>
    api.get('/v1/problem-types').then((r) => r.data),

  createProblemType: (data: Partial<ProblemType>): Promise<ProblemType> =>
    api.post('/v1/problem-types', data).then((r) => r.data),

  deleteProblemType: (id: string): Promise<void> =>
    api.delete(`/v1/problem-types/${id}`).then(() => undefined),
}
