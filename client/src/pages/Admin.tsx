import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Download, Users, FileText, TrendingUp } from 'lucide-react';
import { getLoginUrl } from '@/const';
import Layout from '@/components/Layout';
import { AdminRoute } from '@/components/AdminRoute';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

function AdminContent() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.assessment.stats.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });
  const { data: assessments, isLoading: assessmentsLoading } = trpc.assessment.all.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  // 如果未登录，显示登录提示
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold">请先登录</h2>
          <Button asChild>
            <a href={getLoginUrl()}>前往登录</a>
          </Button>
        </div>
      </Layout>
    );
  }

  // 如果不是管理员，显示权限不足
  if (user.role !== 'admin') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold">权限不足</h2>
          <p className="text-muted-foreground">您没有访问管理后台的权限</p>
        </div>
      </Layout>
    );
  }

  const isLoading = statsLoading || assessmentsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // 准备图表数据
  const typeChartData = stats?.typeDistribution
    ? Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const genderChartData = stats?.genderDistribution
    ? Object.entries(stats.genderDistribution).map(([name, value]) => ({ 
        name: name === 'male' ? '男' : '女', 
        value 
      }))
    : [];

  const ageChartData = stats?.ageGroups
    ? Object.entries(stats.ageGroups).map(([name, value]) => ({ name, value }))
    : [];

  const handleExportCSV = () => {
    if (!assessments || assessments.length === 0) return;

    const headers = ['ID', '用户ID', '年龄', '性别', '主要体质', '次要体质', '创建时间'];
    const rows = assessments.map(a => [
      a.id,
      a.userId,
      a.age,
      a.gender === 'male' ? '男' : '女',
      a.primaryType,
      a.secondaryType || '-',
      new Date(a.createdAt).toLocaleString('zh-CN'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tcm-assessments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">管理后台</h1>
          <Button onClick={handleExportCSV} disabled={!assessments || assessments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总测评次数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">体质类型数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.typeDistribution ? Object.keys(stats.typeDistribution).length : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">独立用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assessments ? new Set(assessments.map(a => a.userId)).size : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 图表与表格 */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">数据可视化</TabsTrigger>
            <TabsTrigger value="records">测评记录</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 体质分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>体质类型分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 性别分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>性别分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 年龄分布 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>年龄分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>所有测评记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>用户ID</TableHead>
                        <TableHead>年龄</TableHead>
                        <TableHead>性别</TableHead>
                        <TableHead>主要体质</TableHead>
                        <TableHead>次要体质</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments && assessments.length > 0 ? (
                        assessments.map((assessment) => (
                          <TableRow key={assessment.id}>
                            <TableCell>{assessment.id}</TableCell>
                            <TableCell>{assessment.userId}</TableCell>
                            <TableCell>{assessment.age}</TableCell>
                            <TableCell>{assessment.gender === 'male' ? '男' : '女'}</TableCell>
                            <TableCell>{assessment.primaryType}</TableCell>
                            <TableCell>{assessment.secondaryType || '-'}</TableCell>
                            <TableCell>{new Date(assessment.createdAt).toLocaleString('zh-CN')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function Admin() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}
