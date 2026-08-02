/**
 * 认证上下文
 * 
 * 基于 Supabase 的用户认证系统，提供：
 * - 用户名/密码登录和注册（用户名自动拼接 @miaoda.com 作为邮箱）
 * - 用户资料管理
 * - 会话状态监听
 * 
 * 使用方式：
 * - 在组件树顶层包裹 <AuthProvider>
 * - 子组件中使用 useAuth() 获取认证状态和方法
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
// @ts-ignore - Supabase 客户端实例（从 db 目录导入）
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
// @ts-ignore - 用户资料类型
import type { Profile } from '@/types/types';
import { toast } from 'sonner';

/**
 * 获取用户资料
 * 
 * 从 Supabase 的 profiles 表中查询指定用户的资料信息。
 * 
 * @param userId - Supabase 用户 ID
 * @returns 用户资料对象，失败时返回 null
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();  // 最多返回一条记录，无结果返回 null

  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  return data;
}

/** 认证上下文类型 */
interface AuthContextType {
  /** 当前登录用户（Supabase User 对象） */
  user: User | null;
  /** 用户资料（profiles 表中的扩展信息） */
  profile: Profile | null;
  /** 是否正在加载认证状态 */
  loading: boolean;
  /** 用户名密码登录 */
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  /** 用户名密码注册 */
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  /** 登出 */
  signOut: () => Promise<void>;
  /** 刷新用户资料 */
  refreshProfile: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件
 * 
 * 管理用户认证状态，监听 Supabase 会话变化。
 * 需要在应用根组件中使用。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /** 刷新用户资料 */
  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  // 初始化：获取当前会话
  useEffect(() => {
    supabase
      .auth
      .getSession()
      // @ts-ignore
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        }
      })
      // @ts-ignore
      .catch(error => {
        toast.error(`获取用户信息失败: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // @ts-ignore
    // 注意：此回调中不要使用 await，使用 .then() 避免死锁
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    // 清理：取消订阅
    return () => subscription.unsubscribe();
  }, []);

  /**
   * 用户名密码登录
   * 将用户名拼接 @miaoda.com 作为邮箱进行 Supabase 认证
   */
  const signInWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /**
   * 用户名密码注册
   * 将用户名拼接 @miaoda.com 作为邮箱进行注册
   */
  const signUpWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  /** 登出：清除 Supabase 会话和本地状态 */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithUsername, signUpWithUsername, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的 Hook
 * 
 * 必须在 AuthProvider 内部使用，否则抛出错误。
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
