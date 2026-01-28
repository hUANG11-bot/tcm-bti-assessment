import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Download, X } from 'lucide-react';
import { AssessmentResult } from '@/lib/types';

interface SharePosterProps {
  result: AssessmentResult;
  userName?: string;
}

export function SharePoster({ result, userName }: SharePosterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  const handleGeneratePoster = async () => {
    setIsOpen(true);
    
    // 生成二维码（指向当前网站首页）
    const currentUrl = window.location.origin;
    const qrUrl = await QRCode.toDataURL(currentUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    setQrCodeUrl(qrUrl);
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `tcm-bti-体质报告-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate poster:', error);
    }
  };

  return (
    <>
      <Button onClick={handleGeneratePoster} variant="outline" className="gap-2">
        <Share2 className="w-4 h-4" />
        生成分享海报
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>分享您的体质报告</DialogTitle>
          </DialogHeader>

          <div
            ref={posterRef}
            className="relative bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-lg"
            style={{ width: '375px', minHeight: '600px' }}
          >
            {/* 背景装饰 */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-4 right-4 w-32 h-32 bg-green-300 rounded-full blur-3xl" />
              <div className="absolute bottom-4 left-4 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
            </div>

            {/* 内容区 */}
            <div className="relative z-10 space-y-6">
              {/* 标题 */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">TCM-BTI 体质报告</h2>
                <p className="text-sm text-gray-600">探寻身体的山水画卷</p>
              </div>

              {/* 用户信息 */}
              {userName && (
                <div className="text-center">
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">{userName}</span> 的体质类型
                  </p>
                </div>
              )}

              {/* 体质类型卡片 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-center space-y-3">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full text-xl font-bold">
                    {result.mainType}
                  </div>
                  
                  {result.compositeType.length > 0 && (
                    <div className="text-sm text-gray-600">
                      兼有：{result.compositeType.join('、')}
                    </div>
                  )}

                  <p className="text-sm text-gray-700 leading-relaxed pt-2">
                    {result.description}
                  </p>
                </div>
              </div>

              {/* 关键建议 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">💡 核心调理建议</h3>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>• 饮食：{result.recommendations.diet.principle}</p>
                  <p>• 运动：{result.recommendations.exercise}</p>
                  <p>• 情绪：{result.recommendations.emotion}</p>
                </div>
              </div>

              {/* 二维码 */}
              <div className="flex flex-col items-center space-y-2 pt-4">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 rounded-lg shadow-md" />
                )}
                <p className="text-xs text-gray-600 text-center">
                  扫码测测你的体质
                </p>
              </div>

              {/* 底部标识 */}
              <div className="text-center text-xs text-gray-500 pt-2">
                TCM-BTI · 重构数字时代的中医养生
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleDownload} className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              下载海报
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="outline" className="gap-2">
              <X className="w-4 h-4" />
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
