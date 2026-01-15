import React from 'react';
import { useLocation } from 'wouter';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssessment } from '@/contexts/AssessmentContext';
import { HABITS } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional().or(z.literal('')),
  age: z.coerce.number().min(1, '请输入有效年龄').max(120, '请输入有效年龄'),
  gender: z.enum(['male', 'female']),
  habits: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserInfoPage() {
  const [, setLocation] = useLocation();
  const { setUserInfo } = useAssessment();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
      gender: 'male',
      habits: [],
    }
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    setUserInfo(data);
    setLocation('/assessment');
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-serif font-bold text-primary">基本信息</CardTitle>
            <p className="text-sm text-muted-foreground">
              为了提供更精准的体质分析，请填写以下信息
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="phone">手机号（可选）</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="用于查看历史记录，可不填" 
                  {...register('phone')}
                  className="bg-white/50"
                />
                {errors.phone && <p className="text-xs text-destructive">{String(errors.phone.message)}</p>}
                <p className="text-xs text-muted-foreground">填写手机号后可查看历史测评记录和体质变化趋势</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">年龄</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="请输入您的年龄" 
                  {...register('age')}
                  className="bg-white/50"
                />
                {errors.age && <p className="text-xs text-destructive">{String(errors.age.message)}</p>}
              </div>

              <div className="space-y-2">
                <Label>性别</Label>
                <RadioGroup 
                  defaultValue="male" 
                  onValueChange={(val) => setValue('gender', val as 'male' | 'female')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">男</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">女</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-xs text-destructive">{String(errors.gender.message)}</p>}
              </div>

              <div className="space-y-2">
                <Label>生活习惯（可多选）</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {HABITS.map((habit) => (
                    <div key={habit.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={habit.value} 
                        onCheckedChange={(checked) => {
                          const currentHabits = watch('habits') || [];
                          if (checked) {
                            setValue('habits', [...currentHabits, habit.value]);
                          } else {
                            setValue('habits', currentHabits.filter((h: string) => h !== habit.value));
                          }
                        }}
                      />
                      <Label htmlFor={habit.value} className="text-sm font-normal cursor-pointer">
                        {habit.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full text-lg py-6 mt-4">
                开始测评
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
