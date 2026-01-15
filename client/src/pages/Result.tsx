import React from 'react';
import { Link } from 'wouter';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment } from '@/contexts/AssessmentContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ArrowRight, RefreshCw, Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { SharePoster } from '@/components/SharePoster';

import { setReportShare } from '@/lib/wechat';

export default function Result() {
  const { result, resetAssessment, userInfo, answers } = useAssessment();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAssessmentId, setSavedAssessmentId] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const createAssessmentMutation = trpc.assessment.create.useMutation();


  // 自动保存测评结果到数据库
  useEffect(() => {
    if (!result || !userInfo || !answers || savedAssessmentId || isSaving) return;

    const saveAssessment = async () => {
      try {
        setIsSaving(true);
        // 将answers对象转换为数字类型
        const numericAnswers: Record<string, number> = {};
        Object.entries(answers).forEach(([key, value]) => {
          numericAnswers[key] = parseInt(value, 10) || 0;
        });

        // 构建 scores 对象
        const scores: Record<string, number> = {};
        result.dimensions.forEach(dim => {
          scores[`${dim.dimension}_left`] = dim.scoreLeft;
          scores[`${dim.dimension}_right`] = dim.scoreRight;
          scores[`${dim.dimension}_diff`] = dim.diff;
        });

        const assessment = await createAssessmentMutation.mutateAsync({
          age: userInfo.age,
          gender: userInfo.gender,
          habits: userInfo.habits,
          answers: numericAnswers,
          primaryType: result.mainType,
          secondaryType: result.compositeType.length > 0 ? result.compositeType.join(', ') : undefined,
          scores,
          fullReport: result,
        });
        setSavedAssessmentId(assessment.id);
        toast.success('测评结果已保存');
      } catch (error) {
        console.error('Failed to save assessment:', error);
        // 如果用户未登录，静默失败，不显示错误
        if (error instanceof Error && !error.message.includes('login')) {
          toast.error('保存失败，请稍后重试');
        }
      } finally {
        setIsSaving(false);
      }
    };

    saveAssessment();
  }, [result, userInfo, answers, savedAssessmentId, isSaving, createAssessmentMutation]);

  // 配置微信分享
  useEffect(() => {
    if (result) {
      setReportShare(result.mainType);
    }
  }, [result]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsGeneratingPdf(true);
      
      // Create a clone of the report element to modify for PDF generation
      // We need to ensure all content is visible and not scrollable
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#fcfcfc', // Match background color
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`TCM-BTI体质评估报告_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!result) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <h2 className="text-2xl font-serif text-muted-foreground">暂无评估结果</h2>
          <Link href="/assessment">
            <Button onClick={resetAssessment}>开始测评</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const radarData = result.dimensions.map(d => ({
    subject: d.dimension,
    A: d.scoreLeft, // Left tendency (Y, X, Z, K)
    B: d.scoreRight, // Right tendency (A, S, W, M)
    fullMark: 14,
  }));

  // Transform data for single radar chart if needed, or just visualize the diff
  // Let's visualize the 4 dimensions on a chart.
  // We can map the scores to a 0-100 scale or similar for better visualization.
  // Actually, the business plan suggests a 4-quadrant radar.
  // Let's simplify to a standard radar chart showing the 8 endpoints.
  
  const chartData = [
    { subject: '阴(Y)', A: result.dimensions[0].scoreLeft, fullMark: 14 },
    { subject: '阳(A)', A: result.dimensions[0].scoreRight, fullMark: 14 },
    { subject: '虚(X)', A: result.dimensions[1].scoreLeft, fullMark: 14 },
    { subject: '实(S)', A: result.dimensions[1].scoreRight, fullMark: 14 },
    { subject: '燥(Z)', A: result.dimensions[2].scoreLeft, fullMark: 14 },
    { subject: '湿(W)', A: result.dimensions[2].scoreRight, fullMark: 14 },
    { subject: '滞(K)', A: result.dimensions[3].scoreLeft, fullMark: 14 },
    { subject: '敏(M)', A: result.dimensions[3].scoreRight, fullMark: 14 },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <Link href="/invite">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              邀请好友
            </Button>
          </Link>
          <div className="flex gap-2">
          <SharePoster result={result} userName={userInfo?.age ? `${userInfo.age}岁${userInfo.gender}` : undefined} />
          <Button 
            onClick={handleDownloadPdf} 
            disabled={isGeneratingPdf}
            variant="outline"
            className="gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成报告中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                下载PDF报告
              </>
            )}
          </Button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-12 animate-in fade-in duration-700 bg-[#fcfcfc] p-8 rounded-xl">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary">
            您的体质画像
          </h1>
          <p className="text-xl text-muted-foreground">
            核心特征：<span className="text-accent font-bold">{result.mainType}</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Radar Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center font-serif">体质雷达图</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 14]} tick={false} axisLine={false} />
                  <Radar
                    name="体质得分"
                    dataKey="A"
                    stroke="#8FBC8F"
                    strokeWidth={3}
                    fill="#8FBC8F"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Right Column: Description & Dimensions */}
          <div className="space-y-6">
            <Card className="border-none shadow-md bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg">体质详解</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {result.description}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {result.dimensions.map((dim, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/40 border border-white/20">
                  <span className="font-medium text-sm text-muted-foreground">{dim.dimension}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${dim.tendency.includes('Left') ? 'text-primary' : 'text-muted-foreground/50'}`}>
                      {dim.scoreLeft}
                    </span>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden relative">
                       {/* Visualizing the balance */}
                       <div 
                         className="absolute top-0 bottom-0 bg-primary transition-all duration-500"
                         style={{ 
                           left: dim.scoreLeft > dim.scoreRight ? '0%' : '50%',
                           right: dim.scoreRight > dim.scoreLeft ? '0%' : '50%',
                           width: '50%',
                           opacity: dim.diff === 0 ? 0 : (dim.diff / 14) + 0.2
                         }}
                       />
                       {dim.diff === 0 && <div className="absolute inset-0 bg-green-400/30" />}
                    </div>
                    <span className={`text-sm font-bold ${dim.tendency.includes('Right') ? 'text-destructive' : 'text-muted-foreground/50'}`}>
                      {dim.scoreRight}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {dim.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-center text-primary">个性化调理建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 深度解析 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 mb-6">
              <Card className="bg-white/50 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-primary">体质深度解析</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-muted-foreground mb-1">形成机理</h4>
                    <p className="text-sm">{result.detailedAnalysis.mechanism}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-muted-foreground mb-1">典型表现</h4>
                      <ul className="list-disc list-inside text-sm">
                        {result.detailedAnalysis.manifestations.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-muted-foreground mb-1">易感风险</h4>
                      <ul className="list-disc list-inside text-sm">
                        {result.detailedAnalysis.susceptibility.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 饮食调理详解 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Card className="bg-white/50 border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2 text-primary">
                    <span className="text-2xl">🥗</span> 饮食调理指南
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm font-medium text-primary/80">{result.recommendations.diet.principle}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-xs font-bold text-green-700 block mb-2">宜吃</span>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendations.diet.goodFoods.map((f, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-green-100 text-green-800">{f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <span className="text-xs font-bold text-red-700 block mb-2">忌吃</span>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendations.diet.badFoods.map((f, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-red-100 text-red-800">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-muted-foreground mb-2">推荐食谱</h4>
                    <div className="space-y-2">
                      {result.recommendations.diet.recipes.map((recipe, i) => (
                        <div key={i} className="text-sm bg-white p-3 rounded border border-border/50">
                          <div className="font-bold text-primary">{recipe.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">食材：{recipe.ingredients}</div>
                          <div className="text-xs text-muted-foreground">功效：{recipe.efficacy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <RecommendationCard title="运动调理" icon="🏃" content={result.recommendations.exercise} />
            <RecommendationCard title="作息调理" icon="🌙" content={result.recommendations.lifestyle} />
            <RecommendationCard title="情绪调理" icon="🧠" content={result.recommendations.emotion} />
            
            {/* 穴位按摩 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Card className="bg-white/50 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2 text-primary">
                    <span className="text-2xl">💆</span> 穴位按摩指南
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.recommendations.acupoints.map((point, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-border/50">
                        <div className="font-bold text-primary mb-1">{point.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">位置：{point.location}</div>
                        <div className="text-sm">{point.method}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {result.recommendations.habits && result.recommendations.habits.length > 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <Card className="h-full bg-white/50 border-none shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2 text-primary">
                      <span className="text-2xl">🧘</span> 生活习惯调理
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {result.recommendations.habits.map((advice, index) => (
                        <li key={index}>{advice}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 text-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">⚠️ 特别提醒</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-8 pb-16">
             <Link href="/">
            <Button variant="outline" onClick={resetAssessment} className="gap-2">
              <RefreshCw className="w-4 h-4" /> 重新测评
            </Button>
          </Link>
          {userInfo?.phone && (
            <Link href="/history">
              <Button variant="outline" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                查看历史记录
              </Button>
            </Link>
          )}
          <Button className="gap-2">
            <Share2 className="w-4 h-4" /> 保存报告
          </Button>
        </div>
        </div>
      </div>
    </Layout>
  );
}

function RecommendationCard({ title, icon, content }: { title: string; icon: string; content: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <span className="text-2xl">{icon}</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
