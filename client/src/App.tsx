import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AssessmentProvider } from "./contexts/AssessmentContext";
import { useEffect } from "react";
import { setDefaultShare } from "@/lib/wechat";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Assessment from "./pages/Assessment";
import Result from "./pages/Result";
import Invite from "./pages/Invite";
import UserInfoPage from "./pages/UserInfo";
import History from "./pages/History";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/user-info" component={UserInfoPage} />
      <Route path="/assessment" component={Assessment} />
      <Route path={"/result"} component={Result} />
      <Route path="/history" component={History} />
      <Route path={"/invite"} component={Invite} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // 设置默认微信分享配置
    setDefaultShare();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AssessmentProvider>
            <Toaster />
            <Router />
          </AssessmentProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
