import { createClient } from "@ali/oneday-frontend-sdk"
import type { Database } from './types';

export const oneday = createClient<Database>();