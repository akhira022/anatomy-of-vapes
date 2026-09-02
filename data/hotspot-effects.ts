export type HotspotEffectTone = "danger" | "warning" | "info";

export interface HotspotEffectStep {
  id: string;
  label: string;
  icon: "inhale" | "addiction" | "brain" | "heart" | "heat" | "cancer" | "lung" | "cough" | "battery" | "metal" | "irritation";
  tone: HotspotEffectTone;
}

/** ลำดับผลกระทบสั้นๆ ต่อ hotspot — อ้างอิงข้อความใน data/hotspots.ts */
export const hotspotEffectSteps: Record<string, HotspotEffectStep[]> = {
  "hs-nicotine": [
    { id: "inhale", label: "ดูดเข้าปอด", icon: "inhale", tone: "warning" },
    { id: "addiction", label: "เสพติดเร็ว", icon: "addiction", tone: "danger" },
    { id: "focus", label: "สมาธิสั้น", icon: "brain", tone: "danger" },
    { id: "memory", label: "ความจำ & อารมณ์", icon: "brain", tone: "danger" },
  ],
  "hs-pg-vg": [
    { id: "vapor", label: "สูดไอเข้า", icon: "inhale", tone: "warning" },
    { id: "irritation", label: "ระคายลำคอ", icon: "irritation", tone: "warning" },
    { id: "heat", label: "คอยล์ร้อนจัด", icon: "heat", tone: "danger" },
    { id: "breakdown", label: "แตกเป็นสารพิษ", icon: "cancer", tone: "danger" },
  ],
  "hs-formaldehyde": [
    { id: "heat", label: "ความร้อนสูง", icon: "heat", tone: "warning" },
    { id: "form", label: "เกิดฟอร์มาลดีไฮด์", icon: "cancer", tone: "danger" },
    { id: "irritation", label: "ระคายตา/ลำคอ", icon: "irritation", tone: "warning" },
    { id: "risk", label: "เสี่ยงมะเร็งระยะยาว", icon: "cancer", tone: "danger" },
  ],
  "hs-acrolein": [
    { id: "heat", label: "พีจี/วีจีร้อน", icon: "heat", tone: "warning" },
    { id: "acrolein", label: "เกิดอะโครลีน", icon: "lung", tone: "danger" },
    { id: "cough", label: "ไอ & แน่นหน้าอก", icon: "cough", tone: "danger" },
    { id: "lung", label: "ทำลายเยื่อปอด", icon: "lung", tone: "danger" },
  ],
  "hs-lithium": [
    { id: "device", label: "แบต/คอยล์ภายใน", icon: "battery", tone: "warning" },
    { id: "leak", label: "รั่ว/ร้อนจัด", icon: "battery", tone: "danger" },
    { id: "metal", label: "โลหะหนักในไอ", icon: "metal", tone: "danger" },
    { id: "lung", label: "สูดเข้าปอด", icon: "lung", tone: "danger" },
  ],
};

export function getHotspotEffectSteps(hotspotId: string): HotspotEffectStep[] {
  return hotspotEffectSteps[hotspotId] ?? [];
}
