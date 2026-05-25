# B 前端 Demo 接入说明

这份文档给 B 和 B 的前端 Agent 使用。

## B 的目标

B 不需要重写 Agent，也不需要重新实现路线规则。

B 的任务是：

```text
调用 A 模块提供的函数，把 Agent 结果展示成一个可演示的产品 Demo。
```

最终页面要跑通：

```text
一句话输入
  -> 盲盒生成
  -> 路线详情
  -> 工具调用状态
  -> 一键执行
  -> Plan B 对比
```

## 需要交给前端 Agent 的文件夹

把整个 `agent-a-module` 文件夹交给前端 Agent。

重点看：

```text
src/agent/orchestrator.ts
src/agent/types.ts
src/data/providedPois.ts
A-Agent-模块说明.md
```

## B 需要调用的函数

从这里引入：

```ts
import { generatePlan, executePlan, handleReplan } from "./src/agent/orchestrator.ts";
```

POI 数据统一从正式数据入口引入：

```ts
import { pois } from "./src/data/pois.ts";
```

如果之前 Demo 用的是旧样例数据：

```ts
import { providedPois } from "./src/data/providedPois.ts";
```

请只把数据源替换为：

```ts
import { pois } from "./src/data/pois.ts";
```

不要因此重写 Demo 页面结构。

### 1. 生成路线

```ts
const plan = await generatePlan(userInput, { pois });
```

### 2. 一键执行

```ts
const executedPlan = await executePlan(plan);
```

### 3. 触发 Plan B

```ts
const replannedPlan = await handleReplan(event, plan, { pois });
```

## 正式 POI 数据同步说明

现在 A 模块已经接入 C 的正式 POI 数据：

```text
src/data/pois.json
src/data/pois.ts
src/data/poiAdapter.ts
```

这次同步只改变数据源，不改变 A 返回给前端的结构。

也就是说，B 前端如果已经按下面这些字段展示，就不需要重写页面：

```ts
plan.blindBox
plan.route.steps
plan.toolStatus
plan.executionTasks
plan.planB
```

需要注意的变化：

```text
1. 路线里的 POI 会从 8 条样例数据变成 71 条正式数据。
2. 生成出来的地点、路线、预算、耗时可能和旧 Demo 不一样。
3. Plan B 替换结果可能变化。
4. POI 名称、地址、reason 可能更长，前端卡片需要能处理长文本。
```

不要做的事：

```text
1. 不要硬编码旧路线。
2. 不要写死某个 POI 名称。
3. 不要因为数据变了重写 Agent 调用逻辑。
4. 不要再使用 providedPois.ts 作为正式数据源。
```

正确做法：

```ts
const plan = await generatePlan(userInput, { pois });
```

而不是：

```ts
const plan = await generatePlan(userInput, { pois: providedPois });
```

更新后请至少测试这三个输入：

```text
现在有点无聊，有没有什么可以打卡拍照的地方？
明天下午带娃轻松玩半天，预算300以内，少走路，最好能吃饭
周末下雨，想和对象找个室内路线，喝咖啡看展吃饭
```

## 前端输入格式

最小输入：

```ts
const userInput = {
  rawText: "现在有点无聊，有没有什么可以打卡拍照的地方？",
  quickSelections: {}
};
```

如果页面有快捷选项，可以这样传：

```ts
const userInput = {
  rawText: "周六下午想和朋友拍照喝咖啡",
  quickSelections: {
    peopleType: "朋友",
    budget: 300,
    constraints: ["不想排队"]
  }
};
```

注意：

```text
quickSelections 会覆盖 rawText 解析结果。
如果只是测试一句话理解，可以先传空对象。
```

## 前端主要展示字段

### 盲盒信息

```ts
plan.blindBox.theme
plan.blindBox.title
plan.blindBox.tags
plan.blindBox.story
plan.blindBox.unlockText
```

### 路线信息

```ts
plan.route.totalMinutes
plan.route.totalBudget
plan.route.steps
```

每个路线节点：

```ts
step.order
step.role
step.poi.name
step.poi.type
step.poi.subType
step.poi.address
step.poi.businessDistrict
step.poi.price
step.poi.tags
step.poi.limits
step.poi.stayMinutes
step.poi.queueLevel
step.note
```

### 工具调用状态

```ts
plan.toolStatus
```

每个工具状态：

```ts
tool.toolName
tool.status
tool.poiId
tool.message
tool.result
```

当前工具包括：

```text
checkQueue
checkAvailability
reserveOrJoinPlan
```

### 执行结果

用户点击“一键执行”后展示：

```ts
executedPlan.executionTasks
```

### Plan B

触发异常后展示：

```ts
replannedPlan.planB
```

重点字段：

```ts
planB.impact
planB.message
planB.changes
planB.beforeRoute
planB.afterRoute
planB.keptPreferences
planB.sacrificed
```

## Plan B 事件示例

排队异常：

```ts
const mealStep = plan.route.steps.find((step) => step.poi.type === "餐饮正餐");

const event = {
  type: "queue",
  poiId: mealStep?.poi.id,
  waitMinutes: 45,
  message: "餐饮点当前排队约45分钟"
};

const replannedPlan = await handleReplan(event, plan, { pois });
```

下雨异常：

```ts
const event = {
  type: "rain",
  message: "当前开始下雨，户外点体验不稳定"
};

const replannedPlan = await handleReplan(event, plan, { pois });
```

## 建议页面结构

### 首页

展示：

```text
一句话输入框
快捷条件 chips
开启周末盲盒按钮
```

点击按钮后调用：

```ts
generatePlan(userInput, { pois })
```

### 盲盒生成页

展示：

```text
正在理解需求
正在匹配盲盒主题
正在生成路线
正在检查排队和可用性
```

可以用 loading 动画模拟。

### 路线详情页

展示：

```text
盲盒标题
路线故事
总耗时
总预算
路线时间轴
每站 POI 卡片
工具调用状态
```

### 执行确认

点击按钮：

```ts
executePlan(plan)
```

展示：

```text
已加入行程
已模拟预约
已准备 Plan B
```

### Plan B 弹窗

点击按钮触发：

```ts
handleReplan(event, plan, { pois })
```

展示：

```text
发生了什么
影响是什么
替换前后对比
保留了哪些偏好
确认调整按钮
```

## B 的验收标准

前端 Demo 至少做到：

```text
1. 输入一句话后能生成盲盒路线。
2. 能看到路线时间轴和 POI 卡片。
3. 能看到 checkQueue / checkAvailability 工具状态。
4. 点击一键执行后能看到执行结果。
5. 点击 Plan B 后能看到替换前后对比。
6. 不需要真实后端也能跑。
```
