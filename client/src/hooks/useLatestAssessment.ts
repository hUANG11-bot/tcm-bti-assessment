import { trpc } from "@/lib/trpc";

/**
 * 调取当前用户「最近一次测评历史」，供 AI 聊天等使用。
 * 调用 ai.chat 时传入返回的 bodyType / age / gender / fullReport，可确保使用最后一次测评结果做个性化回复。
 */
export function useLatestAssessment() {
  const query = trpc.assessment.getLatest.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 分钟内不重复请求
    retry: 1,
  });

  const latest = query.data ?? null;

  return {
    /** 最近一次测评（无则为 null） */
    latest,
    /** 可直接传给 ai.chat 的体质上下文（无测评时为 undefined） */
    chatContext: latest
      ? {
          bodyType: latest.primaryType,
          secondaryType: latest.secondaryType ?? undefined,
          age: latest.age,
          gender: latest.gender,
          fullReport: latest.fullReport ?? undefined,
        }
      : undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
