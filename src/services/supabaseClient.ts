/**
 * Supabase 客户端 — 脱离 OneDay，直接 @supabase/supabase-js
 *
 * 通过 webpack DefinePlugin 注入编译期常量：
 *   process.env.SUPABASE_URL
 *   process.env.SUPABASE_ANON_KEY
 * 本地开发通过 .env 文件（webpack 会读取 dotenv）；
 * 线上部署通过 GitHub Secrets 注入。
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('[supabase] createClient failed:', err);
  }
} else {
  console.warn('[supabase] URL/KEY 未配置，Supabase 数据源将不可用，前端会回落 GitHub raw 主源');
}

export const supabase = supabaseInstance;
