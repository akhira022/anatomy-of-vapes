/**
 * แหล่งอ้างอิงสำหรับเนื้อหาการศึกษาใน data/
 * ใช้สำหรับทีมเนื้อหาตรวจทาน — ยังไม่แสดงใน UI ผู้เรียน
 *
 * Partner review: หน่วยงานพันธมิตรควรยืนยันข้อความก่อนใช้ในแคมเปญอย่างเป็นทางการ
 */

export interface ContentSource {
  id: string;
  title: string;
  org: string;
  url: string;
  notes: string;
}

export const contentSources: ContentSource[] = [
  {
    id: "who-ecig",
    title: "Tobacco: E-cigarettes (Q&A)",
    org: "World Health Organization",
    url: "https://www.who.int/news-room/questions-and-answers/item/tobacco-e-cigarettes",
    notes:
      "ไอจากบุหรี่ไฟฟ้าไม่ใช่ไอน้ำบริสุทธิ์ มีนิโคตินและสารที่อาจเป็นอันตราย กังวลการตลาดสู่เยาวชน",
  },
  {
    id: "cdc-ecig",
    title: "About E-Cigarettes (Vapes)",
    org: "U.S. Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/tobacco/e-cigarettes/about.html",
    notes:
      "Aerosol ไม่ใช่ water vapor; มีนิโคติน สารก่อมะเร็ง โลหะหนัก อนุภาคละเอียด; กลิ่น/สารแต่งรสที่กินได้ ≠ ปลอดภัยเมื่อสูด",
  },
  {
    id: "acs-ecig",
    title: "E-cigarettes and Vaping — Health Risks",
    org: "American Cancer Society",
    url: "https://www.cancer.org/cancer/risk-prevention/tobacco/e-cigarettes-vaping.html",
    notes:
      "นิโคตินกระทบพัฒนาการสมองวัยรุ่น; aerosol อาจเกี่ยวปอด หัวใจ และความเสี่ยงมะเร็ง",
  },
  {
    id: "lung-ingredients",
    title: "Dangerous Vape Ingredients",
    org: "American Lung Association",
    url: "https://www.lung.org/blog/dangerous-vape-ingredients",
    notes:
      "PG/VG เมื่อร้อนอาจสร้าง formaldehyde; คอยล์โลหะอาจปล่อยอนุภาคโลหะ; acrolein เป็นสารระคายเคือง",
  },
  {
    id: "ddc-thai",
    title: "ข่าวสารควบคุมยาสูบ / บุหรี่ไฟฟ้า",
    org: "กรมควบคุมโรค กระทรวงสาธารณสุข",
    url: "https://ddc.moph.go.th/",
    notes:
      "เตือนนิโคตินกับพัฒนาการสมองเยาวชน และแนวโน้มการใช้บุหรี่ไฟฟ้าในกลุ่มนักเรียน",
  },
  {
    id: "thaihealth",
    title: "การสร้างเสริมสุขภาพและการควบคุมปัจจัยเสี่ยงยาสูบ",
    org: "สำนักงานกองทุนสนับสนุนการสร้างเสริมสุขภาพ (สสส.)",
    url: "https://www.thaihealth.or.th/",
    notes:
      "รณรงค์เตือนภัยบุหรี่ไฟฟ้าในเด็กและเยาวชนไทย สนับสนุนสื่อรู้เท่าทัน",
  },
  {
    id: "tobacco-act-th",
    title: "พระราชบัญญัติควบคุมผลิตภัณฑ์ยาสูบ พ.ศ. 2560",
    org: "ราชกิจจานุเบกษา / กระทรวงสาธารณสุข",
    url: "https://www.fda.moph.go.th/",
    notes:
      "ห้ามขายยาสูบให้ผู้เยาว์ ห้ามโฆษณา กำหนดพื้นที่ปลอดบุหรี่ และมาตรการควบคุมผลิตภัณฑ์ยาสูบ",
  },
  {
    id: "customs-th",
    title: "การควบคุมสินค้ายาสูบและบุหรี่ไฟฟ้าขาเข้า",
    org: "กรมศุลกากร",
    url: "https://www.customs.go.th/",
    notes:
      "มาตรการตรวจสอบและยึดสินค้ายาสูบ/บุหรี่ไฟฟ้าที่นำเข้าโดยไม่ได้รับอนุญาต",
  },
  {
    id: "fda-th",
    title: "การควบคุมผลิตภัณฑ์ยาสูบและบุหรี่ไฟฟ้า",
    org: "สำนักงานคณะกรรมการอาหารและยา (อย.)",
    url: "https://www.fda.moph.go.th/",
    notes:
      "กำกับดูแลผลิตภัณฑ์ยาสูบ ฉลากคำเตือน และมาตรการควบคุมบุหรี่ไฟฟ้า",
  },
];
