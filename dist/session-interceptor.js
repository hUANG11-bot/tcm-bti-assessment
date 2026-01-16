(function(){
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
        } catch(e) {}
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
    } catch(e) {}
  }
  
  if (typeof wx !== 'undefined' && wx) {
    // 立即执行一次
    injectSessionToken();
    // 延迟执行，确保在所有代码加载后
    setTimeout(injectSessionToken, 100);
    setTimeout(injectSessionToken, 500);
    setTimeout(injectSessionToken, 1000);
    // 应用显示时重新注入
    if (wx.onAppShow) {
      wx.onAppShow(function() {
        injectSessionToken();
      });
    }
  }
})();
