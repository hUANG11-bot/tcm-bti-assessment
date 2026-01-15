import React from 'react';
import { Link } from 'wouter';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground relative overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(120%)',
        }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="py-6 px-4 md:px-8 flex justify-between items-center border-b border-border/40 backdrop-blur-sm">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center overflow-hidden bg-white group-hover:scale-105 transition-transform duration-500">
                 <img src="/images/logo-placeholder.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-serif font-bold tracking-widest group-hover:text-primary/80 transition-colors">TCM-BTI</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/"><span className="hover:text-primary cursor-pointer transition-colors">首页</span></Link>
            <Link href="/about"><span className="hover:text-primary cursor-pointer transition-colors">关于体系</span></Link>
            <Link href="/contact"><span className="hover:text-primary cursor-pointer transition-colors">联系我们</span></Link>
          </nav>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/40 backdrop-blur-sm">
          <p>© 2025 TCM-BTI. All rights reserved. | 重构数字时代的中医养生新生态</p>
        </footer>
      </div>
    </div>
  );
}
