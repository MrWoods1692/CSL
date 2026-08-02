/**
 * Cookie 同意横幅
 * 
 * 首次访问时显示 Cookie 使用提示，符合 GDPR/隐私法规要求。
 * 用户可选择：
 * - "仅使用必要 Cookie"：只保存主题偏好等必要数据
 * - "同意并继续"：允许所有 Cookie
 * 
 * 选择结果保存到 Cookie（csl_cookie_consent），有效期 1 年。
 */

import React, { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Cookie 名称 */
const COOKIE_NAME = 'csl_cookie_consent';
/** Cookie 有效期：1 年（秒） */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** 检查是否已有同意记录 */
const hasConsent = () =>
  document.cookie.split('; ').some((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));

/** 保存用户选择 */
const saveConsent = (value: 'accepted' | 'necessary') => {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const CookieConsent: React.FC = () => {
  // 初始化：如果已有同意记录则不显示
  const [visible, setVisible] = useState(() => !hasConsent());

  if (!visible) {
    return null;
  }

  const handleConsent = (value: 'accepted' | 'necessary') => {
    saveConsent(value);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Cookie 使用提示"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl border-2 border-foreground bg-card p-4 text-card-foreground shadow-solid-lg sm:inset-x-6 sm:p-5"
      role="dialog"
      aria-modal="false"
    >
      {/* 关闭按钮（等同于"仅使用必要 Cookie"） */}
      <button
        aria-label="关闭 Cookie 使用提示"
        className="absolute right-3 top-3 rounded-sm p-1 transition-colors hover:bg-muted"
        onClick={() => handleConsent('necessary')}
        type="button"
      >
        <X size={18} />
      </button>

      <div className="flex gap-3 pr-7">
        {/* Cookie 图标 */}
        <div className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
          <Cookie size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold">Cookie 使用提示</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            CSL 官网会使用必要 Cookie 保存页面偏好，并帮助我们改善网站体验。你可以同意全部使用，或仅允许必要 Cookie。详情请查看{' '}
            <Link className="font-semibold text-foreground underline underline-offset-2" to="/policy">
              用户协议与隐私说明
            </Link>
            。
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="btn-sticker rounded-sm bg-card px-4 py-2 text-sm font-semibold"
          onClick={() => handleConsent('necessary')}
          type="button"
        >
          仅使用必要 Cookie
        </button>
        <button
          className="btn-sticker rounded-sm bg-primary px-4 py-2 text-sm font-semibold"
          onClick={() => handleConsent('accepted')}
          type="button"
        >
          同意并继续
        </button>
      </div>
    </aside>
  );
};

export default CookieConsent;