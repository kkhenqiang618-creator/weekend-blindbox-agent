import json
import random

# 加载数据
def load_pois(file_path="pois.json"):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

pois = load_pois()

# ------------------------------------------------------------------------------
# 1. 字段校验
# 功能：检查每个 POI 是否缺少关键字段，保证数据合法
# ------------------------------------------------------------------------------
def checkPoiFields(poi):
    required = [
        "id", "name", "type", "subType", "price",
        "meituanRating", "stayMinutes", "queueLevel",
        "distanceLevel", "limits", "fitPeople"
    ]
    for field in required:
        if field not in poi:
            return False, f"缺失字段: {field}"
    return True, "校验通过"

# ------------------------------------------------------------------------------
# 2. POI 过滤
# 功能：根据用户需求筛选符合条件的 POI（新增距离过滤）
# ------------------------------------------------------------------------------
def filterPOI(requirements, pois):
    filtered = []
    area = requirements.get("area")
    min_price = requirements.get("minPrice", 0)
    max_price = requirements.get("maxPrice", 9999)
    fit_people = requirements.get("fitPeople")
    indoor_only = requirements.get("indoorOnly", False)
    # 新增：距离等级过滤（默认只保留近/中距离，可通过需求参数覆盖）
    allowed_distance = requirements.get("allowedDistance", ["near", "medium"])  # near=近, medium=中, far=远
    # 兼容旧数据：如果distanceLevel为空，默认按medium处理
    default_distance = "medium"

    for p in pois:
        # 区域过滤
        if area and p.get("area") != area:
            continue
        # 价格过滤
        if not (min_price <= p["price"] <= max_price):
            continue
        # 适合人群过滤
        if fit_people and fit_people not in p["fitPeople"]:
            continue
        # 室内过滤
        if indoor_only and "室内" not in p["limits"]:
            continue
        # 新增：距离过滤（核心逻辑）
        poi_distance = p.get("distanceLevel", default_distance)
        if poi_distance not in allowed_distance:
            continue
        
        filtered.append(p)

    return filtered

# ------------------------------------------------------------------------------
# 3. POI 打分排序
# 功能：优先级排序，优质+近距离 POI 优先
# ------------------------------------------------------------------------------
def calculateScore(poi):
    score = 0
    # 基础评分：美团评分
    score += poi["meituanRating"] * 10    
    # 排队加分：不排队优先
    if poi["queueLevel"] == "low":
        score += 10                       
    # 室内加分：不怕天气影响
    if "室内" in poi["limits"]:
        score += 5                        
    # 性价比加分：低价优先
    if poi["price"] <= 50:
        score += 5                        
    # 新增：距离权重（核心调整）
    distance_level = poi.get("distanceLevel", "medium")
    if distance_level == "near":  # 近距离 +15 分（权重最高）
        score += 15
    elif distance_level == "medium":  # 中距离 +5 分
        score += 5
    # 远距离不加分（默认0）
    
    return score

def rankPOI(pois):
    return sorted(pois, key=calculateScore, reverse=True)

# ------------------------------------------------------------------------------
# 4. 生成路线
# 功能：根据需求生成 4~6 小时路线（优先选近距离）
# ------------------------------------------------------------------------------
def buildRoute(requirements, pois):
    total_min = requirements.get("totalMinutes", 300)  # 默认5小时
    filtered = filterPOI(requirements, pois)
    ranked = rankPOI(filtered)

    route = []
    current = 0

    # 包含正餐/轻食（优先前3高分+近距离）
    foods = [p for p in ranked if p["type"] in ["餐饮正餐", "轻食甜饮"]]
    if foods:
        # 调整：从Top3里选（原Top5），进一步缩小范围保证近距离
        food = random.choice(foods[:3])  
        route.append(food)
        current += food["stayMinutes"]

    # 加入游玩点（优先近距离）
    plays = [p for p in ranked if p not in route]

    while current < total_min - 20 and plays:
        # 调整：从Top5里选（原Top8），优先近距离
        candidate = random.choice(plays[:5])
        if current + candidate["stayMinutes"] > total_min + 30:
            continue
        route.append(candidate)
        current += candidate["stayMinutes"]
        plays.remove(candidate)

    return {
        "route": route,
        "totalMinutes": current,
        "poiCount": len(route)
    }

# ------------------------------------------------------------------------------
# 5. 重新随机路线（reroll）
# 功能：换一批 POI 生成全新路线（仍保留距离限制）
# ------------------------------------------------------------------------------
def rerollRoute(requirements, previousRoute, pois):
    previous_ids = {p["id"] for p in previousRoute["route"]}
    new_pois = [p for p in pois if p["id"] not in previous_ids]
    return buildRoute(requirements, new_pois)

# ------------------------------------------------------------------------------
# 6. 事件重规划（下雨/排队/闭店）
# 功能：自动替换不合适的 POI（替换时优先近距离）
# ------------------------------------------------------------------------------
def replanRoute(event, currentRoute, pois):
    new_route = []
    current_ids = [p["id"] for p in currentRoute["route"]]  # 已在路线里的店
    # 新增：距离优先级（替换时优先选近距离）
    allowed_distance = ["near", "medium"]
    default_distance = "medium"

    for poi in currentRoute["route"]:
        replaced = False

        # ----------------------
        # 情况1：下雨 → 必须室内 + 优先近距离
        # ----------------------
        if event == "rain":
            if "室内" in poi["limits"]:
                new_route.append(poi)
            else:
                # 优化：增加距离过滤
                candidates = [
                    p for p in pois
                    if p["type"] == poi["type"]
                    and p["area"] == poi["area"]
                    and "室内" in p["limits"]
                    and p["id"] not in current_ids
                    and p.get("distanceLevel", default_distance) in allowed_distance
                ]
                if candidates:
                    # 先排序（优先近距离+高分）再随机
                    candidates_sorted = sorted(candidates, key=calculateScore, reverse=True)
                    selected = random.choice(candidates_sorted[:3])  # 只选Top3
                    new_route.append(selected)
                else:
                    new_route.append(poi)

        # ----------------------
        # 情况2：排队太长 → 换掉排队高的 + 优先近距离
        # ----------------------
        elif event == "queueTooLong":
            if poi["queueLevel"] != "high":
                new_route.append(poi)
            else:
                # 优化：增加距离过滤
                candidates = [
                    p for p in pois
                    if p["type"] == poi["type"]
                    and p["area"] == poi["area"]
                    and p["queueLevel"] != "high"
                    and p["id"] not in current_ids
                    and p.get("distanceLevel", default_distance) in allowed_distance
                ]
                if candidates:
                    candidates_sorted = sorted(candidates, key=calculateScore, reverse=True)
                    selected = random.choice(candidates_sorted[:3])
                    new_route.append(selected)
                else:
                    new_route.append(poi)

        # ----------------------
        # 情况3：闭店 → 直接替换同类同区 + 优先近距离
        # ----------------------
        elif event == "closed":
            # 优化：增加距离过滤
            candidates = [
                p for p in pois
                if p["type"] == poi["type"]
                and p["area"] == poi["area"]
                and p["id"] not in current_ids
                and p.get("distanceLevel", default_distance) in allowed_distance
            ]
            if candidates:
                candidates_sorted = sorted(candidates, key=calculateScore, reverse=True)
                selected = random.choice(candidates_sorted[:3])
                new_route.append(selected)
            else:
                new_route.append(poi)

        # 其他情况 → 不变
        else:
            new_route.append(poi)

    return {
        "route": new_route,
        "totalMinutes": sum(p["stayMinutes"] for p in new_route),
        "poiCount": len(new_route),
        "eventHandled": event
    }