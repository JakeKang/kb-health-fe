import { z } from 'zod';

const emailSchema = z
  .string({ error: '이메일을 입력하세요.' })
  .trim()
  .min(1, { error: '이메일을 입력하세요.' })
  .refine((value) => z.email().safeParse(value).success, {
    error: '올바르지 않은 이메일 형식입니다.',
  });

const passwordSchema = z
  .string({ error: '비밀번호를 입력하세요' })
  .min(1, { error: '비밀번호를 입력하세요' })
  .min(8, { error: '비밀번호는 8자 이상이어야 합니다.' })
  .max(24, { error: '비밀번호는 24자 이하여야 합니다.' })
  .regex(/^[A-Za-z0-9]+$/, {
    error: '비밀번호는 영문과 숫자만 사용 가능합니다.',
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
