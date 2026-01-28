# AI 助手「未调取最后一次结果」排查与修复

## 现象

AI 界面显示「通用养生助手」，回复为多种体质的通用建议，而不是基于用户最后一次体质测试的个性化回复。

## 已修复：小程序 AI 页 myAssessments 未请求（enabled: false）

**原因**：`dist/pages/ai-chat/index.js` 中 `myAssessments.useQuery(..., { enabled: false })` 导致查询从不执行，日志出现 `[AI Chat] myAssessments查询结果 - data: undefined`。

**修复**：已将 `enabled:!1` 改为 `enabled:$`（$ = 已登录），这样在用户已登录时会自动请求最近一次测评。若你重新执行 `pnpm run build:weapp`，需要在**源码**里把 `myAssessments.useQuery(undefined, { enabled: false })` 改为 `enabled: isAuthenticated`（或登录态变量），否则会再次出现未调取。

## 原因说明

后端是否能用「最后一次测评结果」取决于两点之一：

1. **登录态有效**：请求带上了有效的 session（见下），后端会按用户 ID 拉取最近一次测评并写入上下文。
2. **请求体带体质数据**：即使未识别到登录，只要请求里带了 `bodyType` / `age` / `gender` / `fullReport`，后端也会按「有最后一次结果」走个性化回复。

若两者都不满足，就会走「通用养生助手」。

## 1. 确保小程序正确携带 Session

- 用户通过微信登录后，接口会返回 `sessionToken`，小程序需把它存到 **`wx.setStorageSync('app_session_cookie', sessionToken)`**。
- 发请求时，`session-interceptor.js` 会从 `app_session_cookie` 读出 token，并设置请求头 **`x-session-token`**（或 Cookie `app_session_id`）。
- 若小程序发 tRPC/API 时**没有经过被注入过的 `wx.request`**（例如用了别的 HTTP 实现），则不会带 token，后端会认为未登录。

**建议**：确认登录成功后写入 `app_session_cookie`；确认 AI 聊天使用的请求路径会走 `wx.request`（或被 session-interceptor 包装的请求）。

## 2. 前端主动调取「最近一次测评历史」并传入（推荐）

**服务端**已提供专用接口 **`assessment.getLatest`**，返回当前用户最近一次测评（含 `primaryType`、`age`、`gender`、`fullReport` 等），供 AI 聊天使用。

**Web / 同构前端**可使用封装好的 hook：

```ts
import { useLatestAssessment } from "@/hooks/useLatestAssessment";

// 在 AI 聊天页或容器组件中
const { chatContext, isLoading } = useLatestAssessment();

// 调用 ai.chat 时传入 chatContext，确保使用最后一次测评
chatMutation.mutate({
  messages: newMessages,
  ...chatContext, // bodyType, secondaryType, age, gender, fullReport
});
```

**小程序**（无 hook 时）在进入 AI 聊天时请求 **`assessment.getLatest`**，拿到结果后每次发消息时把 `bodyType`、`secondaryType`、`age`、`gender`、`fullReport` 传给 **`ai.chat`**。

只要请求里带了这些体质/测评数据，后端会按「已调取最后一次结果」处理，并返回个性化回复。

## 3. 后端返回字段（用于前端展示）

从某次对话开始，`ai.chat` 的响应中会包含：

- **`usedLastAssessment`**：本次是否使用了「最后一次测评结果」。
- **`bodyTypeUsed`**：本次使用的体质类型（如「阳虚质」）。

前端可根据 `usedLastAssessment === true` 显示「个人订制助手」，否则显示「通用养生助手」；并用 `bodyTypeUsed` 做副标题或提示。

## 4. 引导式问答（建议问题）不显示

**现象**：AI 回复正常，但回复下方的「建议问题」区块不出现。

**原因**：小程序端从 `ai.chat` 的返回值里取 `suggestedQuestions` 时，可能因 tRPC/HTTP 包装不同而取不到（例如在 `r.data.suggestedQuestions` 或 `r.result.suggestedQuestions`）。

**已做修改**（`dist/pages/ai-chat/index.js`）：

- 兼容多种返回结构：`r.suggestedQuestions`、`r.data?.suggestedQuestions`、`r.result?.suggestedQuestions`。
- 兜底：若接口未返回引导问题但本次有回复内容（`r.content` 或 `r.data?.content`），则用「常见问题」列表作为「建议问题」展示，保证区块能出现。

若重新构建小程序，需在**源码**中保留上述对 `suggestedQuestions` 的多路径读取和兜底逻辑，否则 dist 被覆盖后可能再次不显示。

## 5. 小结

- 优先保证：**登录后存 `app_session_cookie`，且 AI 请求走带 session 的 `wx.request`**，这样后端会自动拉取最后一次测评。
- 兜底方案：**AI 聊天页主动传入最近一次测评的 bodyType/age/gender/fullReport**，后端会按「有最后一次结果」走个性化并返回 `usedLastAssessment: true`。
- 引导式问答：后端已返回 `suggestedQuestions`；小程序端需兼容多种响应结构，并在无数据时用常见问题兜底。
