/**
 * 404 页面
 * 
 * 当用户访问不存在的路由时显示。
 * 包含：大号 404 标题、说明文字、返回首页按钮。
 * 使用贴纸卡片样式 + 背景网格 + 径向光晕装饰。
 */

import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta title="页面未找到" description="" />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6">
        {/* 背景网格 */}
        <div className="bg-grid-bold absolute inset-0 opacity-50" />
        {/* 径向光晕 */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-radial-fade" />

        <div className="relative mx-auto w-full max-w-md text-center">
          <div className="sticker-card sticker-card-hover mb-8 p-10">
            <h1 className="mb-2 font-display text-7xl font-bold text-gradient-vibrant text-stroke">
              404
            </h1>
            <p className="mb-6 font-display text-xl font-bold">页面未找到</p>
            <p className="mb-8 text-sm text-muted-foreground">
              页面可能已被删除或不存在，请检查网址是否正确。
            </p>
            <Link
              to="/"
              className="btn-sticker btn-sticker-lg inline-flex h-12 items-center justify-center bg-primary px-6 text-base text-primary-foreground"
            >
              <Home className="mr-2 h-5 w-5" />
              返回首页
            </Link>
          </div>
        </div>

        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CSL 启动器
        </p>
      </div>
    </>
  );
}
