# C 数据清洗与规则验收说明

这份文档给 C 和 C 的数据/规则 Agent 使用。

## C 的目标

你们已经采集了 50 多条 POI 数据，所以 C 现在不是继续采数据。

C 的任务是：

```text
把已有表格数据清洗成 A 模块能直接读取的 pois.ts 或 pois.json，并检查它能否支撑路线生成和 Plan B。
```

## C 需要重点看的文件

```text
src/agent/types.ts
src/data/providedPois.ts
```

其中：

```text
types.ts 定义系统需要的 POI 字段。
providedPois.ts 是当前样例数据格式。
```

## 输出目标

输出一个正式数据文件：

```text
src/data/pois.ts
```

或者：

```text
src/data/pois.json
```

格式类似：

```ts
export const pois = [
  {
    id: "poi_outdoor_001",
    name: "洪湖公园",
    type: "户外散步",
    subType: "公园",
    address: "罗湖区笋岗街道文锦北路2023号",
    area: "罗湖区",
    businessDistrict: "笋岗商圈",
    price: 50,
    meituanRating: 4.1,
    reviewCount: 536,
    tags: ["疗愈", "徒步", "运动", "解压", "适合带娃", "团建"],
    limits: ["室外", "预算友好"],
    fitPeople: ["单人", "亲子", "朋友", "情侣"],
    stayMinutes: 60,
    openTime: "6:00-23:00",
    queueLevel: "low",
    mockMeituanUrl: "mock://meituan/poi_outdoor_001",
    reason: "6月荷花盛放，适合亲子与情侣散步拍照",
    weatherSensitive: true
  }
];
```

## P0 必须清洗的字段

这些字段必须整理好：

```text
id
name
type
subType
businessDistrict
price
tags
limits
fitPeople
stayMinutes
queueLevel
reason
```

建议保留：

```text
address
area
meituanRating
reviewCount
openTime
mockMeituanUrl
```

## 字段清洗规则

### 1. id 必须唯一

错误示例：

```text
很多条都叫 poi_001
```

正确示例：

```text
poi_outdoor_001
poi_photo_001
poi_meal_001
poi_drink_001
poi_culture_001
```

### 2. type 必须统一成六大类

只能使用：

```text
餐饮正餐
轻食甜饮
文化体验
户外散步
休闲娱乐
拍照地标
```

如果原数据不标准，要映射到这六类。

例如：

```text
烧烤 -> 餐饮正餐
美术馆 -> 拍照地标 或 文化体验，按路线角色决定
商场 -> 休闲娱乐
公园 -> 户外散步
咖啡 / 奶茶 / 甜品 -> 轻食甜饮
```

### 3. price 必须是数字，可以由 Agent 合理模拟

错误示例：

```text
price <= 50
price <= 150
price > 150
```

正确示例：

```ts
price: 50
price: 95
price: 200
```

如果只有价格档位，可以先用估算值：

```text
price <= 50 -> 按类型模拟一个合理数字
price <= 150 -> 按类型模拟一个合理数字
price > 150 -> 按类型模拟一个合理数字
```

不要全部粗暴写成档位上限。比如正餐不应该随机成 20 元，大型乐园也不应该写成 80 元。

建议让 Agent 按类型和价格档位生成稳定的模拟价格：

```text
餐饮正餐：
  price <= 50   -> 35-50
  price <= 150  -> 70-140
  price > 150   -> 160-260

轻食甜饮：
  price <= 50   -> 18-45
  price <= 150  -> 50-90
  price > 150   -> 150-220

文化体验：
  price <= 50   -> 0-50
  price <= 150  -> 60-120
  price > 150   -> 160-260

户外散步：
  price <= 50   -> 0-30
  price <= 150  -> 40-100
  price > 150   -> 150-220

休闲娱乐：
  price <= 50   -> 30-50
  price <= 150  -> 70-140
  price > 150   -> 180-300

拍照地标：
  price <= 50   -> 0-50
  price <= 150  -> 50-120
  price > 150   -> 160-260
```

如果原始数据有明确人均价格，优先使用真实价格。

如果只有档位，Agent 可以根据 `type + priceLevel + subType` 生成模拟价。为了每次生成结果稳定，不建议真随机到每次都变，可以使用固定规则或基于 `id` 的伪随机。

示例：

```text
顺德公·猪肚鸡，餐饮正餐，price <= 150 -> 模拟 95
Tamkoko泰柯茶园，轻食甜饮，price <= 50 -> 模拟 25
深圳欢乐谷，休闲娱乐，price > 150 -> 模拟 220
洪湖公园，户外散步，price <= 50 -> 模拟 0 或 20
```

### 4. tags / limits / fitPeople 必须是数组

错误示例：

```text
tags: 疗愈,徒步,运动
```

正确示例：

```ts
tags: ["疗愈", "徒步", "运动"]
```

### 5. fitPeople 只保留系统支持的人群

系统支持：

```text
单人
情侣
朋友
亲子
```

如果原数据里有：

```text
同事
团建
```

建议处理为：

```text
同事 -> 朋友
团建 -> 朋友
```

### 6. queueLevel 只能是三种

```text
low
medium
high
```

不要写中文：

```text
低
中
高
```

### 7. distanceLevel 可以删除或忽略

当前 A 模块不强依赖 `distanceLevel`。

如果表格里没填，可以不填。

## 之前 PRD 提到的扩展字段怎么处理

### 需要自动推断

```text
weatherSensitive
replaceableBy
```

### 暂时不用人工补

```text
blindBoxThemes
availableTools
bookingRequired
priorityScore
```

## weatherSensitive 生成规则

可以让 Agent 自动生成：

```text
limits 包含 室外 -> weatherSensitive = true
limits 包含 室内 或 雨天可去 -> weatherSensitive = false
```

如果一个点既有室内又有室外，按实际体验判断。

## replaceableBy 生成规则

可以让 Agent 自动生成，不需要人工一条条填。

规则：

```text
同 type 优先
同 businessDistrict 优先
queueLevel 更低优先
price 接近优先
fitPeople 有交集
```

Plan B 至少需要准备：

```text
一个 queueLevel=high 的餐饮点
一个 queueLevel=low 的可替代餐饮点
```

示例：

```ts
{
  id: "poi_meal_001",
  name: "顺德公·猪肚鸡",
  type: "餐饮正餐",
  queueLevel: "high",
  replaceableBy: ["poi_meal_002"]
}

{
  id: "poi_meal_002",
  name: "李小太·烧烤",
  type: "餐饮正餐",
  queueLevel: "low"
}
```

## C 和 Plan B 的关系

C 不负责写整个 Agent 主流程，也不负责前端展示。

Plan B 的分工是：

```text
A 负责：handleReplan / replanRoute 怎么调用、怎么返回结果。
C 负责：正式 POI 数据里有没有可替换节点，以及替换结果是否合理。
```

也就是说，A 已经有 Plan B 机制，但能不能替换成功，取决于 C 清洗后的数据。

### C 需要保证的 Plan B 数据基础

#### 1. 排队替换

数据里至少要有：

```text
一个 queueLevel = high 的餐饮点
一个 queueLevel = low 的餐饮点
```

最好满足：

```text
同 type
同 businessDistrict 或邻近商圈
price 接近
fitPeople 有交集
```

示例：

```text
顺德公·猪肚鸡 high -> 李小太·烧烤 low
```

#### 2. 下雨替换

数据里至少要有：

```text
室外 / weatherSensitive = true 的点
室内 / 雨天可去 / weatherSensitive = false 的替代点
```

示例：

```text
洪湖公园 -> 深圳至美术馆 / 大悦城
```

#### 3. 超时调整

数据里需要注意：

```text
stayMinutes 不要全部过长
至少有一些 30-90 分钟的轻量节点
```

如果所有点都是 120-300 分钟，路线很容易超出 4 小时，Plan B 也很难调整。

### C 需要验收的 Plan B 场景

正式数据清洗后，请让 Agent 跑这三类测试：

```text
1. 排队：餐饮 high -> 餐饮 low
2. 下雨：室外点 -> 室内/雨天可去点
3. 超时：压缩或替换长停留点
```

验收标准：

```text
1. 能找到替代点。
2. 替代点类型合理。
3. 替代后预算没有明显超出。
4. 替代后仍然保留用户核心偏好。
5. 替换说明能讲得通。
```

如果某个场景跑不通，C 需要判断是：

```text
数据缺少替代点
字段没清洗干净
queueLevel / limits / fitPeople 不合理
stayMinutes 太长
```

然后补数据或修字段。

## C 的数据验收任务

请让你的 Agent 写一个检查脚本，检查正式 POI 数据。

至少检查：

```text
1. 是否有重复 id
2. price 是否都是数字
3. type 是否都属于六大类
4. tags / limits / fitPeople 是否都是数组
5. fitPeople 是否只包含 单人 / 情侣 / 朋友 / 亲子
6. queueLevel 是否只包含 low / medium / high
7. 是否缺少 reason
8. 是否有可用于 Plan B 的 high 餐饮和 low 餐饮
9. 是否能支撑朋友、亲子、雨天三个演示场景
```

## 三个演示场景的数据覆盖

正式数据至少要支撑：

### 场景一：朋友拍照咖啡

需要：

```text
拍照地标 / 户外散步 / 文化体验
轻食甜饮
餐饮正餐
```

### 场景二：亲子少走路

需要：

```text
亲子友好点
室内或低强度点
餐饮正餐
```

### 场景三：雨天室内

需要：

```text
室内文化体验
轻食甜饮
休闲娱乐
餐饮正餐
```

## C 的最终交付

```text
1. 正式 pois.ts 或 pois.json
2. 数据检查脚本
3. 检查结果报告
4. 三个演示场景是否能跑通的说明
```
