import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Eye } from 'lucide-react';

type HistoryRecord = {
  id: number;
  createdAt: string;
  age: number;
  gender: string;
  primaryType: string;
  scores: {
    'Y/A': number;
    'X/S': number;
    'Z/W': number;
    'K/M': number;
  };
};

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState('');
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleQuery = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入有效的手机号');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/assessments/history?phone=${phone}`);
      if (!response.ok) throw new Error('查询失败');
      
      const data = await response.json();
      if (data.length === 0) {
        toast.info('未找到测评记录，请先完成测评');
        setRecords([]);
        setShowChart(false);
      } else {
        setRecords(data);
        setShowChart(data.length >= 2); // 至少2条记录才显示趋势图
        toast.success(`找到 ${data.length} 条测评记录`);
      }
    } catch (error) {
      console.error('查询历史记录失败:', error);
      toast.error('查询失败，请稍后重试');
      setRecords([]);
      setShowChart(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTendencyLabel = (score: number) => {
    if (score >= 5) return '强倾向';
    if (score >= 3) return '明显倾向';
    if (score >= 1.5) return '轻微倾向';
    return '平衡';
  };

  // 准备趋势图表数据
  const chartData = records.map((record, index) => ({
    name: `第${index + 1}次`,
    date: formatDate(record.createdAt),
    '阴阳(Y/A)': record.scores['Y/A'],
    '虚实(X/S)': record.scores['X/S'],
    '燥湿(Z/W)': record.scores['Z/W'],
    '滞敏(K/M)': record.scores['K/M'],
  })).reverse(); // 按时间正序排列

  return (
    <Layout>
      <div className="container max-w-6xl py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">历史测评记录</h1>
          <p className="text-muted-foreground">查看您的体质变化趋势，追踪调理效果</p>
        </div>

        {/* 查询表单 */}
        <Card className="mb-8 border-none shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl">输入手机号查询</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="query-phone">手机号</Label>
                <Input
                  id="query-phone"
                  type="tel"
                  placeholder="请输入您的手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                  className="bg-white/50"
                />
              </div>
              <Button 
                onClick={handleQuery} 
                disabled={loading}
                className="px-8"
              >
                {loading ? '查询中...' : '查询记录'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 趋势图表 */}
        {showChart && (
          <Card className="mb-8 border-none shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                体质变化趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="阴阳(Y/A)" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="虚实(X/S)" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="燥湿(Z/W)" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="滞敏(K/M)" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                数值越高表示该维度倾向性越强，0表示完全平衡
              </p>
            </CardContent>
          </Card>
        )}

        {/* 记录列表 */}
        {records.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">测评记录列表</h2>
            {records.map((record, index) => (
              <Card 
                key={record.id} 
                className="border-none shadow-lg bg-white/80 backdrop-blur-md hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(record.createdAt)}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                          第 {records.length - index} 次测评
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-primary mb-2">{record.primaryType}</h3>
                        <div className="text-sm text-muted-foreground">
                          {record.age}岁 · {record.gender === 'male' ? '男' : '女'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(record.scores).map(([dimension, score]) => (
                          <div key={dimension} className="bg-muted/30 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">{dimension}</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-primary">{score.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">{getTendencyLabel(score)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={() => {
                        // TODO: 跳转到详情页面查看完整报告
                        toast.info('查看详情功能开发中');
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && records.length === 0 && phone && (
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">暂无测评记录</p>
              <Button onClick={() => setLocation('/')}>
                开始第一次测评
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
