import { cleanupExpData } from './cleanupExpData';

export const tasks: Record<string, CallableFunction> = {
  cleanup_exp_data: cleanupExpData,
}