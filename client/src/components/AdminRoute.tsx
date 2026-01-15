import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast.error('访问被拒绝 - 请先登录管理员账户');
          setLocation('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        toast.error('验证失败，请重新登录');
        setLocation('/admin/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    );
  }

  // 未登录不渲染内容
  if (!isAuthenticated) {
    return null;
  }

  // 管理员正常渲染
  return <>{children}</>;
}
