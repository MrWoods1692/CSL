/**
 * 防抖 Hook
 * 
 * 延迟更新值，直到用户停止输入一段时间后再更新。
 * 常用于搜索输入框，避免每次按键都触发请求。
 * 
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒），默认 500ms
 * @returns 防抖后的值
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * // debouncedSearch 会在用户停止输入 300ms 后才更新
 */

import * as React from "react";

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    // 设置定时器：延迟 delay 毫秒后更新值
    const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500);

    // 清理函数：如果 value 在延迟期间再次变化，取消之前的定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
