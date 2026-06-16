/**
 * 环境变量类型声明 — 让 TypeScript 识别 process.env.*
 * webpack DefinePlugin 在编译期注入，运行时从 window.process 读。
 */
declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    NODE_ENV?: 'development' | 'production';
  }
}
