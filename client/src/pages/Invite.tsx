import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Share2, Gift, Users } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Invite() {
  const { user } = useAuth();
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const createInviteMutation = trpc.invitation.create.useMutation();
  const { data: stats, refetch: refetchStats } = trpc.invitation.myStats.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !inviteCode) {
      handleGenerateInvite();
    }
  }, [user]);

  const handleGenerateInvite = async () => {
    try {
      const result = await createInviteMutation.mutateAsync();
      setInviteCode(result.inviteCode);
      setInviteUrl(result.inviteUrl);
      refetchStats();
    } catch (error) {
      console.error('Failed to generate invite:', error);
      toast.error('生成邀请链接失败');
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('邀请链接已复制到剪贴板');
  };

  const handleShare = () => {
    if (!inviteUrl) return;

    const shareText = `我刚完成了TCM-BTI中医体质评估，发现了很多关于自己身体的秘密！快来测测你的体质吧：${inviteUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'TCM-BTI 中医体质评估',
        text: shareText,
        url: inviteUrl,
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('分享文案已复制到剪贴板');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-muted-foreground">请先登录以查看邀请功能</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-primary">邀请好友</h1>
          <p className="text-muted-foreground">分享健康，共同成长</p>
        </div>

        {/* 邀请统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                总邀请数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalInvites || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gift className="w-4 h-4" />
                已完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.completedInvites || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                待完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.pendingInvites || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* 邀请链接卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>您的专属邀请链接</CardTitle>
            <CardDescription>
              邀请好友完成测评，解锁更多养生内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-muted/50 text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                复制
              </Button>
              <Button onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                分享
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                邀请奖励
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 邀请 <strong>3位</strong> 好友完成测评，解锁专属养生方案</li>
                <li>• 邀请 <strong>10位</strong> 好友完成测评，获得中医专家在线咨询机会</li>
                <li>• 邀请 <strong>30位</strong> 好友完成测评，免费获得定制化调理产品</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 邀请记录 */}
        {stats && stats.invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>邀请记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.invitations.slice(0, 10).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${inv.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <div className="text-sm font-medium">邀请码: {inv.inviteCode}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      {inv.status === 'completed' ? (
                        <span className="text-green-600 font-medium">已完成</span>
                      ) : (
                        <span className="text-orange-600">待完成</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
