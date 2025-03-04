import { z } from 'zod';

const schema = z.object({
    username: z.string(),
    // email: z.string().email(),
    password: z.string().min(1),
});

export { schema };