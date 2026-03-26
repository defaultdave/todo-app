import { z } from 'zod'

export const TodoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string(),
})

export const FilterValueSchema = z.enum(['all', 'active', 'completed'])

export type Todo = z.infer<typeof TodoSchema>
export type FilterValue = z.infer<typeof FilterValueSchema>
