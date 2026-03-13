import { api } from '@/lib/api'

export interface UserSummary {
  id: string
  name: string
  email: string
  status: string
  roles: string[]
}

export const userService = {
  getUsers: (): Promise<UserSummary[]> =>
    api.get('/v1/users').then((r) => r.data),
}
