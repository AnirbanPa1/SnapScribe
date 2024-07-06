import * as z from 'zod';

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Minimum 3 characters'}),
    accountId: z.string(),
    imageUrl: z.string().nullable(),
})

export const CommentValidation = z.object({
    thread: z.string().nonempty().min(3, { message: 'Minimum 3 characters'}),
})