(function(){
  // 用于跟踪当前登录的 openId，检测账号切换
  var currentOpenId = null;
  
  function injectSessionToken(){
    try {
      if (typeof wx === 'undefined' || !wx || typeof wx.getStorageSync !== 'function') return;
      var originalRequest = wx.request;
      if (!originalRequest || originalRequest._sessionTokenInjected) return;
      
      var wrappedRequest = function(options) {
        try {
          var token = wx.getStorageSync('app_session_cookie');
          if (token) {
            options = options || {};
            var headers = options.header || {};
            if (!headers['x-session-token'] && !headers['X-Session-Token']) {
              headers['x-session-token'] = String(token);
              if (!headers.Cookie && !headers.cookie) {
                headers.Cookie = 'app_session_id=' + token;
              }
              options.header = headers;
            }
          }
        } catch(e) {
          console.error('[Session Interceptor] 注入token失败:', e);
        }
        return originalRequest.call(wx, options);
      };
      
      wrappedRequest._sessionTokenInjected = true;
      try {
        Object.defineProperty(wx, 'request', {
          value: wrappedRequest,
          writable: true,
          configurable: true
        });
      } catch(e) {
        wx.request = wrappedRequest;
      }
    } catch(e) {
      console.error('[Session Interceptor] 初始化失败:', e);
    }
  }
  
  // 验证并更新当前登录的 openId
  function validateAndUpdateSession() {
    try {
      var storedUserInfo = wx.getStorageSync('manus-runtime-user-info');
      if (storedUserInfo) {
        var userInfo = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
        if (userInfo && userInfo.openId) {
          if (currentOpenId && currentOpenId !== userInfo.openId) {
            console.log('[Session Interceptor] 检测到账号切换: ' + currentOpenId + ' -> ' + userInfo.openId);
            // 账号已切换，可以在这里添加额外的清理逻辑
          }
          currentOpenId = userInfo.openId;
        }
      }
    } catch(e) {
      // 忽略解析错误
    }
  }
  
  if (typeof wx !== 'undefined' && wx) {
    // 立即执行一次
    injectSessionToken();
    validateAndUpdateSession();
    
    // 延迟执行，确保在所有代码加载后
    setTimeout(function() {
      injectSessionToken();
      validateAndUpdateSession();
    }, 100);
    setTimeout(function() {
      injectSessionToken();
      validateAndUpdateSession();
    }, 500);
    setTimeout(function() {
      injectSessionToken();
      validateAndUpdateSession();
    }, 1000);
    
    // 应用显示时重新注入和验证
    if (wx.onAppShow) {
      wx.onAppShow(function() {
        injectSessionToken();
        validateAndUpdateSession();
      });
    }
  }
})();
