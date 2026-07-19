function setCors(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const lng = Number(req.body?.lng);
  const lat = Number(req.body?.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    res.status(400).json({ error: "lng/lat are required" });
    return;
  }
  const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) {
    res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
    return;
  }

  try {
    const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
    url.searchParams.set("key", key);
    url.searchParams.set("location", `${lng},${lat}`);
    url.searchParams.set("extensions", "base");
    url.searchParams.set("radius", "1000");
    const response = await fetch(url);
    const data = await response.json() as any;
    const address = data?.regeocode?.addressComponent;
    if (!response.ok || data?.status !== "1" || !address) {
      res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
      return;
    }
    const province = address.province || "";
    const city = Array.isArray(address.city) ? province : (address.city || province);
    const district = address.district || "";
    const label = [province, city, district].filter((value, index, values) => value && values.indexOf(value) === index).join("");
    res.status(200).json({ province, city, district, label, resolved: Boolean(province || city || district) });
  } catch {
    res.status(200).json({ province: "", city: "", district: "", label: "", resolved: false });
  }
}
