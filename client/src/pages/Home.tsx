import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-1000 slide-in-from-bottom-10">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight tracking-tight text-primary">
            探寻身体的<br/>
            <span className="text-accent">山水画卷</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            TCM-BTI 是一套重构中医体质理论的数字化健康解决方案。
            <br className="hidden md:block" />
            通过四维二元辨识体系，解码您的身体语言，定制专属养生方案。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/user-info">
            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 group">
              开始体质测评
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full border-2 hover:bg-secondary/50 transition-all duration-300">
              了解更多
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 w-full max-w-4xl text-center">
          <FeatureItem title="16种" desc="基础体质" />
          <FeatureItem title="五级" desc="梯度判定" />
          <FeatureItem title="四维" desc="核心维度" />
          <FeatureItem title="定制" desc="调理方案" />
        </div>
      </div>
    </Layout>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-shadow duration-300">
      <span className="text-2xl font-serif font-bold text-primary">{title}</span>
      <span className="text-sm text-muted-foreground">{desc}</span>
    </div>
  );
}
