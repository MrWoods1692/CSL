/**
 * 返回上一页 Hook
 * 
 * 智能返回：如果有浏览器历史记录则返回上一页，否则跳转到首页。
 * 避免在新标签页或直接访问时点击返回导致无反应的问题。
 */

import { useNavigate } from "react-router-dom";

const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    // 检查是否有浏览器历史记录（idx > 0 表示有上一页）
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // 返回上一页
    } else {
      navigate("/"); // 无历史记录时跳转到首页
    }
  };

  return goBack;
};

export default useGoBack;
