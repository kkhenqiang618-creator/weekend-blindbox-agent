# A 模块说明：轻量 Agent Orchestrator

本模块负责 A 部分：整体 Agent 流程。

## 核心入口

文件：

```text
src/agent/orchestrator.ts
```

导出函数：

```ts
generatePlan(userInput, options?)
executePlan(plan)
handleReplan(event, currentPlan, options?)
```

## 主流程

```text
generatePlan
  -> parseIntent
  -> selectBlindBoxTheme
  -> buildRoute
  -> Promise.all([checkQueue, checkAvailability])
  -> composeBlindBox
  -> return plan
```

## 用户信息缺失时的默认补全

用户不需要一次性提供完整信息。A 模块的 `parseIntent` 会优先尝试调用 LLM 解析一句话输入，并根据快捷选项自动补全系统内部需求结构。如果 LLM 未配置、调用失败或返回格式不合法，会自动回退到规则解析。

文件：

```text
src/agent/intentParser.ts
src/agent/llmIntentParser.ts
src/agent/intentRules.ts
```

解析优先级：

```text
parseIntent
  -> parseIntentWithLLM
  -> 如果失败，回退 parseIntentWithRules
```

LLM 环境变量：

```text
OPENAI_API_KEY=你的API Key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

说明：

```text
OPENAI_API_KEY 必填，否则自动走规则兜底。
OPENAI_MODEL 可选，默认 gpt-4o-mini。
OPENAI_BASE_URL 可选，默认 OpenAI 官方接口；如果你们使用兼容 OpenAI 格式的网关，可以改这个地址。
```

在 PowerShell 里临时设置：

```powershell
$env:OPENAI_API_KEY="你的API Key"
$env:OPENAI_MODEL="gpt-4o-mini"
npm run demo:provided-pois
```

Demo 输出中会显示：

```text
解析方式：LLM解析
```

如果没有配置或调用失败，会显示：

```text
解析方式：规则兜底
兜底原因：LLM is not configured
```

当前默认值：

```text
默认城市：深圳
默认时长：4 小时
默认预算：300 元以内
默认同行人：朋友
默认偏好：美食 / 休闲
```

示例：

```text
用户输入：周末想出去放松一下
```

会被补全为类似：

```json
{
  "city": "深圳",
  "durationHours": 4,
  "budgetMax": 300,
  "peopleType": "朋友",
  "preferences": ["解压"],
  "constraints": [],
  "timeText": "周末下午"
}
```

## 关键词解析规则

### 同行人识别

```text
带娃 / 孩子 / 亲子 / 小朋友 / 宝宝 -> 亲子
朋友 / 同学 / 团建 / 多人 -> 朋友
情侣 / 对象 / 约会 / 男朋友 / 女朋友 -> 情侣
一个人 / 单人 / 自己 -> 单人
```

### 偏好识别

```text
拍照 / 出片 / 打卡 -> 拍照
咖啡 / 拿铁 / 美式 -> 咖啡
甜品 / 蛋糕 / 冰品 -> 甜品
美食 / 吃饭 / 吃点东西 / 小吃 / 餐厅 / 简餐 -> 美食
文化 / 看展 / 展览 / 书店 / 博物馆 -> 文化
户外 / 公园 / 散步 / citywalk / 徒步 -> 户外
运动 / 健身 -> 运动
解压 / 疗愈 / 放松 / 回血 -> 解压
小众 / 宝藏 / 人少 -> 小众
省钱 / 性价比 / 便宜 -> 性价比
```

### 限制条件识别

```text
不排队 / 不想排队 / 少排队 / 别排队 -> 不想排队
少走路 / 别太累 / 轻松 -> 少走路
室内 / 下雨 / 雨天 -> 室内优先
宠物 -> 宠物友好
预算 / 省钱 / 便宜 / 性价比 -> 预算友好
```

### 时间、预算、城市识别

```text
城市：优先识别深圳、上海、北京、广州、杭州、成都、武汉、南京；没说则默认深圳
时长：识别“4小时”“半天”“半日”；没说则默认4小时
预算：识别“预算300”“300以内”“不超过300”；没说则默认300元以内
```

说明：第一版先用规则解析，不接大模型。后续如果要接大模型，可以只替换 `parseIntent`，不需要改 `generatePlan` 主流程。

## Plan B 流程

```text
handleReplan
  -> replanRoute
  -> checkQueue + checkAvailability
  -> composeBlindBox
  -> return updatedPlan
```

## 给 B 的调用示例

```ts
import { generatePlan, handleReplan, executePlan } from "./src/agent/orchestrator.ts";

const plan = await generatePlan({
  rawText: "周六下午想和朋友在深圳玩4小时，想拍照喝咖啡吃点东西，不想排队",
  quickSelections: {
    peopleType: "朋友"
  }
});

const executed = await executePlan(plan);

const replanned = await handleReplan(
  {
    type: "queue",
    poiId: plan.route.steps.find((step) => step.poi.type === "餐饮正餐")?.poi.id,
    waitMinutes: 45,
    message: "餐饮点当前排队约45分钟"
  },
  plan
);
```

## 接入 C 的真实 POI 数据

现在 `src/mock/mockPois.ts` 只是占位样例。C 提供真实 POI 后，可以这样传入：

```ts
const plan = await generatePlan(userInput, {
  pois: realPois
});

const replanned = await handleReplan(event, plan, {
  pois: realPois
});
```

只要真实 POI 能映射到 `src/agent/types.ts` 里的 `Poi` 字段即可。

## 本地验证

```bash
npm run demo:agent
```

验证内容：

1. 自然语言解析为结构化需求。
2. 匹配盲盒主题。
3. 生成路线。
4. 并行返回排队和可用性工具状态。
5. 模拟加入行程。
6. 触发排队 Plan B 并替换餐饮节点。
