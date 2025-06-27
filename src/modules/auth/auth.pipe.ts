import { z } from 'zod';

export const LoginSchema = z.object({
  user: z.string().min(1),
  password: z.string().min(1),
  device: z.object({
    firebase_id: z.string().max(100),
    device_browser: z.string().max(100),
    device_browser_version: z.string().max(25),
    device_imei: z.string().max(100),
    device_model: z.string().max(100),
    device_type: z.string().max(50),
    device_vendor: z.string().max(50),
    device_os: z.string().max(25),
    device_os_version: z.string().max(25),
    device_platform: z.enum(['Web', 'Mobile']),
    user_agent: z.string(),
    app_version: z.string().min(1).max(25),
  }),
});
