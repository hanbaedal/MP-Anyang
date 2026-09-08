import type { Locale } from "./i18n";
import { SITE } from "./site";
import type { ContentBlock, StaticPage } from "./content";

type PageCopy = {
  kicker: string;
  title: string;
  lead?: string;
  alt?: string;
  blocks: ContentBlock[];
};

const en: Record<string, PageCopy> = {
  "about/intro": {
    kicker: "About",
    title: "About Anyang Memorial Park",
    lead: "In Yangsang-dong, Sangnok-gu, Ansan, we care for the departed and the families who remain.",
    alt: `${SITE.shortName} panorama`,
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName} is a private memorial park at ${SITE.address}. Among the woods and wind of Yangsang-dong, we look after both the peace of the departed and the hearts of those left behind.`,
      },
      {
        type: "p",
        text: "Columbarium, tree burial, traditional graves, and lawn graves are offered in one park, with a garden, café, restaurant, and office along the way. Plot search and consultation help families who live far away find their place and pay respects.",
      },
      {
        type: "list",
        items: [
          `Location: ${SITE.address}`,
          `Phone: ${SITE.phone}`,
          "Type: Private cemetery park",
          "Burial types: columbarium, tree burial, traditional grave, lawn grave",
        ],
      },
    ],
  },
  "about/greeting": {
    kicker: "About",
    title: "Director’s greeting",
    lead: "Keeping a tidy place for longing is our duty.",
    blocks: [
      {
        type: "quote",
        text: `Caring for those who have gone is also caring for the living. ${SITE.legalName} will not hurry that work, and will not neglect it.`,
        cite: `Chair, ${SITE.legalName}`,
      },
      {
        type: "p",
        text: "Thank you for visiting. A park should be a garden where families can catch their breath before it is a cemetery. We hope the stone path, the trees, and a quiet café offer a little comfort.",
      },
      {
        type: "p",
        text: "Ask us about plots, care, memorial visits, funeral support, and older graves at one desk. A phone call or a consultation form can be the start of a new farewell.",
      },
    ],
  },
  "about/history": {
    kicker: "About",
    title: "History",
    lead: "The years when woods became a park, and the park became a family’s place.",
    blocks: [
      {
        type: "timeline",
        items: [
          { year: "1987", text: "A cemetery park took root in Yangsang-dong, Sangnok-gu, Ansan, close to Ansan and Anyang." },
          { year: "1990s", text: "Mound plots and paths were arranged, and guidance for holiday visitors was put in place." },
          { year: "2000s", text: "Columbarium and lawn areas were expanded so families could choose among several forms of burial." },
          { year: "2010s", text: "Tree burial and memorial gardens were added, along with a café and restaurant." },
          { year: "2020s", text: "Online plot search and consultation opened, so distant families could find their place and pay respects." },
        ],
      },
    ],
  },
  "about/guide": {
    kicker: "About",
    title: "Visitor guide",
    lead: "A little preparation makes memorial visits and consultations easier.",
    blocks: [
      {
        type: "p",
        text: "The office is open every day, and the grounds are open from sunrise to sunset. Staff increase around holidays. There is no dedicated parking, so please park on nearby roads.",
      },
      {
        type: "list",
        items: [
          `Hours: ${SITE.hours}`,
          `Office: ${SITE.phone}`,
          "Parking: none on site (use nearby roads)",
          "Rites: individual plots and a shared memorial space",
          "Offerings: disposable items in designated bins; ask the office about wreaths",
          "Not allowed: cooking, drinking on plots, unauthorized or commercial photography",
        ],
      },
      {
        type: "p",
        text: "Relocation, reopening, and joint burial require prior consultation. Required documents can be explained on the inquiry board or by phone.",
      },
    ],
  },
  "about/location": {
    kicker: "About",
    title: "Directions",
    lead: "Map, transit, and driving information at a glance.",
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName} is at ${SITE.address}. From Jungang Station, transfer to a bus toward Yangsang-dong Entrance.`,
      },
      {
        type: "list",
        items: [
          `Main phone: ${SITE.phone}`,
          `Address: ${SITE.address}`,
          "Busy hours during memorial seasons: 10 a.m.–1 p.m.",
        ],
      },
    ],
  },
  "lots/procedure": {
    kicker: "Plots",
    title: "How to apply",
    lead: "From inquiry to use of a plot — the steps and documents in one place.",
    blocks: [
      {
        type: "steps",
        title: "Plot-use contract",
        items: [
          { label: "1", text: "Consultation" },
          { label: "2", text: "Site visit" },
          { label: "3", text: "Contract & deposit" },
          { label: "4", text: "Balance" },
          { label: "5", text: "Use of the plot" },
        ],
      },
      {
        type: "procGrid",
        items: [
          {
            title: "Plot-use contract",
            flow: "Consult → site check → deposit → balance → use",
            docs: ["ID of the contracting party", "Seal of the contracting party", "Deposit receipt"],
          },
          {
            title: "Stonework",
            flow: "Inquiry → model → contract → deposit → balance → installation",
          },
          {
            title: "Notice of use",
            note: "Please notify the office 24 hours before burial or enshrinement.",
            docs: ["Name of contracting party", "Plot number", "Burial or enshrinement", "Date and time", "Contact"],
          },
          {
            title: "Burial",
            docs: ["Death certificate or autopsy notice", "Burial report (available at the office)", "Resident register of the reporter", "Seal"],
          },
          {
            title: "Enshrinement",
            docs: ["Cremation certificate", "Enshrinement certificate", "Resident register of the reporter", "Seal", "Consent to use the plot"],
            note: "Urn size: diameter 21 cm or less, height 25 cm or less",
          },
          {
            title: "Relocation — burial",
            docs: ["Relocation permit", "Burial/cremation report (office can assist)", "Resident register of the reporter", "Seal", "Consent to use the plot"],
          },
          {
            title: "Relocation — enshrinement",
            docs: ["Relocation permit", "Enshrinement certificate", "Resident register of the reporter", "Seal", "Consent to use the plot"],
          },
        ],
      },
      {
        type: "p",
        text: "Details for each burial type are on the plot pages and through consultation.",
      },
      {
        type: "cta",
        phone: SITE.phone,
        links: [{ href: "/consult", label: "Consultation", primary: true }],
      },
    ],
  },
  "lots/columbarium": {
    kicker: "Plots",
    title: "Columbarium",
    lead: "A tidy place for ashes under stone and wind.",
    alt: "Columbarium",
    blocks: [
      {
        type: "p",
        text: "After cremation, the urn is placed in a stone chamber or niche. Care is simpler, and the walk for families is shorter.",
      },
      {
        type: "list",
        items: [
          "2, 4, 8, 16, 24, or 32 niches (individual or family)",
          "Register the deceased by capacity — linked at sign-up",
          "Indoor or semi-outdoor niches",
          "Periodic cleaning and flower service available",
          "Availability and location are explained in consultation",
        ],
      },
    ],
  },
  "lots/tree": {
    kicker: "Plots",
    title: "Tree burial",
    lead: "A name left in the shade of a tree, resting with the woods.",
    alt: "Tree burial grove",
    blocks: [
      {
        type: "p",
        text: "Ashes are placed under a designated tree with only a small marker. It suits families who do not want a mound and wish to leave a grove.",
      },
      {
        type: "list",
        items: [
          "Pine or maple areas",
          "Low natural stone markers; wording is arranged with the office",
          "Little mowing, a gentle landscape",
          "Joint or additional placement depends on the tree",
        ],
      },
    ],
  },
  "lots/burial": {
    kicker: "Plots",
    title: "Traditional grave",
    lead: "Mounds follow the ridge in the traditional manner.",
    alt: "Traditional graves",
    blocks: [
      {
        type: "p",
        text: "Traditional graves have mounds. Plots are arranged to receive the ridge wind of Yangsang-dong. Annual contracts cover mowing and stone care.",
      },
      {
        type: "list",
        items: [
          "Single, joint, or paired mounds",
          "Single: 1 person · joint/paired: 2",
          "Headstone and offering-stone sizes explained at the office",
          "Holiday weeding and flower service",
          "Relocation requires prior notice",
        ],
      },
    ],
  },
  "lots/flat": {
    kicker: "Plots",
    title: "Lawn grave",
    lead: "A level lawn with only a low marker.",
    alt: "Lawn graves",
    blocks: [
      {
        type: "p",
        text: "Lawn graves have no mound — only turf and a low marker. The view is orderly and walking is easier for older visitors.",
      },
      {
        type: "list",
        items: [
          "4, 6, 8, or 16 places on the lawn",
          "Usually after cremation",
          "Marker size follows park rules",
          "Lawn care is done by the foundation",
          "A spouse’s place can be reserved in advance",
        ],
      },
    ],
  },
  "lots/composite": {
    kicker: "Plots",
    title: "Family plot",
    lead: "A larger family space combining niches and burial or lawn.",
    alt: "Family plot",
    blocks: [
      {
        type: "p",
        text: "Family plots hold many places, from 16 to 24. Niches, ashes, and joint burial can be arranged in one area.",
      },
      {
        type: "list",
        items: [
          "16, 20, or 24 places",
          "Suited to large family groups",
          "Register the deceased by capacity",
          "Stonework and care designed after consultation",
          "Available areas are explained in consultation",
        ],
      },
    ],
  },
  "facilities/garden": {
    kicker: "Facilities",
    title: "Garden",
    lead: "A memorial garden to pause before and after a visit.",
    alt: "Memorial garden",
    blocks: [
      {
        type: "p",
        text: "Stone lanterns, moss, and pines form the garden. A shared memorial stone and benches let families gather themselves before walking up.",
      },
      {
        type: "list",
        items: ["Seasonal flowers and pines", "A gentle path for wheelchairs", "Shared flower stand and waste bins"],
      },
    ],
  },
  "facilities/cafe": {
    kicker: "Facilities",
    title: "Café",
    lead: "A quiet rest with woods outside the window.",
    alt: "Park café",
    blocks: [
      {
        type: "p",
        text: "A place for tea after a visit. We keep only warm drinks and simple snacks, without loud service.",
      },
      {
        type: "list",
        items: [
          "Hours: 09:00–17:30 (Monday closures announced separately)",
          "Window tables and small family seats",
          "Takeout allowed; only lidded cups on the plots",
        ],
      },
    ],
  },
  "facilities/restaurant": {
    kicker: "Facilities",
    title: "Restaurant",
    lead: "A simple table for families before and after rites.",
    alt: "Park restaurant",
    blocks: [
      {
        type: "p",
        text: "Reservations fill on holidays and death anniversaries. The menu is simple Korean food; taking ritual food out is explained under hygiene rules.",
      },
      {
        type: "list",
        items: [`Group reservations: office ${SITE.phone}`, "About 80 seats", "Numbered waiting during busy seasons"],
      },
    ],
  },
  "facilities/office": {
    kicker: "Facilities",
    title: "Office",
    lead: "Plots, care, and relocation can be discussed in one place.",
    alt: "Office",
    blocks: [
      {
        type: "p",
        text: "The office is at the start of the park road. We help with plot location, fees, relocation reports, and follow-up after online consultation.",
      },
      {
        type: "list",
        items: [
          `Phone: ${SITE.phone}`,
          `Hours: ${SITE.hours}`,
          "Please bring ID and, for relocation or joint burial, documents showing your relationship",
        ],
      },
    ],
  },
  "services/memorial": {
    kicker: "Services",
    title: "Memorial visits",
    lead: "On anniversaries and holidays, we pay respects in your place.",
    blocks: [
      {
        type: "p",
        text: "A memorial visit includes flowers, lawn care, and photos sent back. Unlike buying a new plot, this is care for a place already in use.",
      },
      {
        type: "list",
        items: ["Death anniversary, Hansik, and Chuseok visits", "Flowers plus plot photos", "Annual contracts", "A report after the visit"],
      },
      {
        type: "cta",
        links: [{ href: "/consult?type=memorial&source=memorial", label: "Consultation", primary: true }],
      },
    ],
  },
  "services/sangjo": {
    kicker: "Services",
    title: "Funeral support",
    lead: "We keep the steps steady even in a sudden farewell.",
    blocks: [
      {
        type: "p",
        text: "Funeral support links the funeral schedule to burial. One staff member stays with you from partner funeral halls and crematories through enshrinement.",
      },
      {
        type: "list",
        items: ["24-hour consultation", "Schedule, transport, and rites", "Help linking existing funeral-plan memberships"],
      },
    ],
  },
  "services/grave": {
    kicker: "Services",
    title: "Grave care",
    lead: "Care, relocation, and paperwork for a grave already in use.",
    blocks: [
      {
        type: "p",
        text: "If plot sales are a new place, this service looks after a place you already have — mowing, stone leveling, relocation, and closure reports.",
      },
      {
        type: "list",
        items: ["Basic mowing twice a year", "Stone and lawn repair", "Relocation from other regions"],
      },
    ],
  },
  "services/remodel": {
    kicker: "Services",
    title: "Restoration",
    lead: "We set old mounds and stones neatly again.",
    blocks: [
      {
        type: "p",
        text: "Rain-soaked mounds, leaning stones, and fallen borders are restored to park standards. We share photos and an estimate beforehand, and photos afterward.",
      },
      {
        type: "list",
        items: ["Mound rebuild and new turf", "Headstone replacement and engraving", "Lawn-marker replacement", "Family-plot path work"],
      },
    ],
  },
};

const zh: Record<string, PageCopy> = {
  "about/intro": {
    kicker: "机构介绍",
    title: "安养公园介绍",
    lead: "在安山市常绿区阳上洞，我们在靠近天空的地方安奉先人、陪伴遺族。",
    alt: `${SITE.shortName} 全景`,
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName}位于${SITE.address}，为私立纪念公园。以阳上洞的林木与清风为背景，我们同时照看先人的安宁与生者的心意。`,
      },
      {
        type: "p",
        text: "园内提供奉安墓、树木葬、土葬墓与平葬墓，并有庭园、咖啡厅、餐厅与办公室。墓位查找与咨询申请，方便远地家属确认位置、完成礼节。",
      },
      {
        type: "list",
        items: [`位置：${SITE.address}`, `电话：${SITE.phone}`, "性质：私立公园墓园", "安葬形式：奉安墓、树木葬、土葬墓、平葬墓"],
      },
    ],
  },
  "about/greeting": {
    kicker: "机构介绍",
    title: "理事长致辞",
    lead: "把思念停留的地方打理整洁，是我们的本分。",
    blocks: [
      {
        type: "quote",
        text: `安奉离去的人，也是照看活着的人。${SITE.legalName}不急不缓，也绝不错过。`,
        cite: `${SITE.legalName} 理事长`,
      },
      {
        type: "p",
        text: "感谢各位来访。公园首先应是家人喘息的庭园。愿石径、树木与一杯茶，能成为些许安慰。",
      },
      {
        type: "p",
        text: "分售、管理、祭扫、丧葬协助与旧墓整修，都可在同一窗口询问。一通电话、一张咨询表，都可以成为新的告别的开始。",
      },
    ],
  },
  "about/history": {
    kicker: "机构介绍",
    title: "沿革",
    lead: "林木成为公园、公园成为家人位置的岁月。",
    blocks: [
      {
        type: "timeline",
        items: [
          { year: "1987", text: "安山市常绿区阳上洞一带设立公园墓园，靠近安山与安养生活圈。" },
          { year: "1990s", text: "整理坟丘墓域与管理动线，完善节日祭扫引导。" },
          { year: "2000s", text: "扩大纳骨与平葬区域，使多种安葬方式可在同一公园选择。" },
          { year: "2010s", text: "增设树木葬与纪念庭园，并充实咖啡厅、餐厅等停留设施。" },
          { year: "2020s", text: "开通网上墓位查找与咨询申请，方便远地家属寻位行礼。" },
        ],
      },
    ],
  },
  "about/guide": {
    kicker: "机构介绍",
    title: "利用案内",
    lead: "事先了解，祭扫与咨询会更从容。",
    blocks: [
      {
        type: "p",
        text: "管理办公室每日开放，墓域日出至日落可进出。节日与寒食会增加引导人员。无专用停车场，请停靠附近路边。",
      },
      {
        type: "list",
        items: [
          `开放时间：${SITE.hours}`,
          `管理办公室：${SITE.phone}`,
          "停车：无专用停车场（使用附近路边）",
          "祭礼：可使用个别墓域及共同参拜空间",
          "祭品：一次性用品投入指定回收箱，花圈请询问办公室",
          "禁止：炊事、墓域内饮酒、擅自拍摄或商业拍摄",
        ],
      },
      {
        type: "p",
        text: "迁葬、开葬、合葬须事先咨询。所需文件可通过咨询栏或电话案内。",
      },
    ],
  },
  "about/location": {
    kicker: "机构介绍",
    title: "交通路线",
    lead: "地图、公交与自驾方式一览。",
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName}位于${SITE.address}。在地铁中央站换乘公交，可到达阳上洞入口。`,
      },
      {
        type: "list",
        items: [`代表电话：${SITE.phone}`, `地址：${SITE.address}`, "祭扫高峰：上午10时至下午1时"],
      },
    ],
  },
  "lots/procedure": {
    kicker: "分售案内",
    title: "分售流程",
    lead: "从咨询到使用墓域，所需步骤与文件一目了然。",
    blocks: [
      {
        type: "steps",
        title: "墓地使用合同",
        items: [
          { label: "1", text: "咨询" },
          { label: "2", text: "现场查看" },
          { label: "3", text: "合同与定金" },
          { label: "4", text: "尾款" },
          { label: "5", text: "使用墓域" },
        ],
      },
      {
        type: "procGrid",
        items: [
          { title: "墓地使用合同", flow: "咨询 → 现场确认 → 定金 → 尾款 → 使用", docs: ["签约人身份证", "签约人印章", "定金入账确认"] },
          { title: "石物·碑石安装", flow: "咨询 → 选定样式 → 合同 → 定金 → 尾款 → 安装" },
          { title: "使用通知", note: "土葬或纳骨作业前24小时请通知办公室。", docs: ["签约人姓名", "墓域编号", "土葬或纳骨", "下葬时间", "联系方式"] },
          { title: "土葬", docs: ["死亡诊断书或检验通知", "尸体埋葬申报书（办公室可代办）", "申报人居民登记誊本", "印章"] },
          { title: "纳骨", docs: ["火化证明", "纳骨证明", "申报人居民登记誊本", "印章", "墓地使用承诺书"], note: "骨灰盒规格：直径21厘米、高度25厘米以下" },
          { title: "迁葬 — 土葬", docs: ["开葬申报证明", "埋葬·火化申报书（办公室可代办）", "申报人居民登记誊本", "印章", "墓地使用承诺书"] },
          { title: "迁葬 — 纳骨", docs: ["开葬申报证明", "纳骨证明", "申报人居民登记誊本", "印章", "墓地使用承诺书"] },
        ],
      },
      { type: "p", text: "各类型详情请见分售页面或通过咨询确认。" },
      { type: "cta", phone: SITE.phone, links: [{ href: "/consult", label: "咨询申请", primary: true }] },
    ],
  },
  "lots/columbarium": {
    kicker: "分售案内",
    title: "奉安墓",
    lead: "在石与风之下，整洁安奉骨灰。",
    alt: "奉安墓",
    blocks: [
      { type: "p", text: "火化后将骨灰盒安放于石室或奉安龛。管理简便，家属参拜动线也更短。" },
      {
        type: "list",
        items: ["2·4·8·16·24·32位（个人或家族龛）", "按位数登记先人——注册时与墓号联动", "室内或半室外龛位", "可定期清扫与献花代行", "分售现状与位置通过咨询案内"],
      },
    ],
  },
  "lots/tree": {
    kicker: "分售案内",
    title: "树木葬",
    lead: "把名字留在树荫下，与林木一同安息。",
    alt: "树木葬",
    blocks: [
      { type: "p", text: "在指定树木下安放骨灰，仅立小型碑石。适合不希望坟丘、希望留下林木的家庭。" },
      { type: "list", items: ["可选松树或枫树区域", "碑石为低矮自然石，文句与办公室商定", "除草负担小、景观温和", "合葬或追加安放视树木状况协商"] },
    ],
  },
  "lots/burial": {
    kicker: "分售案内",
    title: "土葬墓",
    lead: "传统坟丘沿山脊延展。",
    alt: "土葬墓",
    blocks: [
      { type: "p", text: "土葬墓为带坟丘的传统墓域。依阳上洞山脊的风向划分位置，除草与石物管理可签年约。" },
      { type: "list", items: ["单葬·合葬·双坟", "单葬1位 · 合葬·双坟2位", "碑石·供石规格另行案内", "节日除草与献花代行", "迁葬须事先申报"] },
    ],
  },
  "lots/flat": {
    kicker: "分售案内",
    title: "平葬墓",
    lead: "只有草坪与低碑的平整墓域。",
    alt: "平葬墓",
    blocks: [
      { type: "p", text: "平葬墓无坟丘，铺平草坪并只立低碑。景观整齐，步行方便，对年长访客负担较小。" },
      { type: "list", items: ["4·6·8·16位草坪平葬", "一般在火化后纳骨平葬", "碑石规格遵循公园标准", "草坪由财团统一管理", "可预先预约配偶合葬位置"] },
    ],
  },
  "lots/composite": {
    kicker: "分售案内",
    title: "复合墓",
    lead: "结合奉安与土葬·平葬的大型家族安放空间。",
    alt: "复合墓",
    blocks: [
      { type: "p", text: "复合墓适合需要多位安放的家族，可选择16至24位。奉安、纳骨、合葬可在同一区域灵活安排。" },
      { type: "list", items: ["16·20·24位", "适合家族大型安放", "按位数登记先人", "石物与管理咨询后定制", "可分售区域通过咨询案内"] },
    ],
  },
  "facilities/garden": {
    kicker: "设施案内",
    title: "庭园",
    lead: "祭扫前后整理心情的纪念庭园。",
    alt: "纪念庭园",
    blocks: [
      { type: "p", text: "石灯、苔藓与松树之间的小路构成庭园骨架。设有共同参拜石与长椅，登墓前可先静一静。" },
      { type: "list", items: ["四季花草与松景", "轮椅可通行的缓坡步道", "共同献花台与回收箱"] },
    ],
  },
  "facilities/cafe": {
    kicker: "设施案内",
    title: "咖啡厅",
    lead: "窗外可见林木的安静休息处。",
    alt: "公园咖啡厅",
    blocks: [
      { type: "p", text: "祭扫结束后喝一杯茶的地方。不喧哗营业，只提供热饮与简单茶点。" },
      { type: "list", items: ["营业：09:00–17:30（周一休息另行公告）", "窗边桌与小型家庭席", "可外带，墓域内仅限有盖杯"] },
    ],
  },
  "facilities/restaurant": {
    kicker: "设施案内",
    title: "餐厅",
    lead: "祭礼前后家人围坐的朴素餐桌。",
    alt: "公园餐厅",
    blocks: [
      { type: "p", text: "节日与忌日预约较多。以韩食简餐为主，祭品外带按卫生标准案内。" },
      { type: "list", items: [`团体预约：办公室 ${SITE.phone}`, "约80席", "祭扫高峰实行等候号码"] },
    ],
  },
  "facilities/office": {
    kicker: "设施案内",
    title: "办公室",
    lead: "分售、管理、迁葬咨询可在一处办理。",
    alt: "管理办公室",
    blocks: [
      { type: "p", text: "管理办公室位于公园入口道路起点。墓位确认、使用费、开葬申报以及网上咨询的后续联系均在此办理。" },
      { type: "list", items: [`电话：${SITE.phone}`, `开放：${SITE.hours}`, "请携带身份证，迁葬·合葬时还需关系证明"] },
    ],
  },
  "services/memorial": {
    kicker: "服务项目",
    title: "祭扫",
    lead: "在忌日与节日，代替远地家属行礼。",
    blocks: [
      { type: "p", text: "祭扫代行包含献花、整理草坪与回传墓域照片。与分售不同，这是对已安奉位置的探访与管理。" },
      { type: "list", items: ["忌日·寒食·中秋代行", "献花并发送墓域照片", "年度定期祭扫合同", "现场检查后结果案内"] },
      { type: "cta", links: [{ href: "/consult?type=memorial&source=memorial", label: "咨询申请", primary: true }] },
    ],
  },
  "services/sangjo": {
    kicker: "服务项目",
    title: "丧葬协助",
    lead: "即使突然离别，也让手续不乱。",
    blocks: [
      { type: "p", text: "丧葬协助把丧礼与安葬日程连接起来。从合作殡仪馆、火化场到奉安·树木·平葬，由同一负责人衔接。" },
      { type: "list", items: ["24小时咨询", "安放日程·车辆·祭礼协调", "既有丧葬会员衔接咨询"] },
    ],
  },
  "services/grave": {
    kicker: "服务项目",
    title: "墓地",
    lead: "受托管理、迁葬与文件办理已有墓位。",
    blocks: [
      { type: "p", text: "分售是“新位置”，此项服务是照看“已有位置”。承担除草、石物校正、迁葬代行与封闭申报。" },
      { type: "list", items: ["每年两次基本除草", "石物·草坪修缮", "外地迁葬联络"] },
    ],
  },
  "services/remodel": {
    kicker: "服务项目",
    title: "整修",
    lead: "把旧坟丘与石物重新立得端正。",
    blocks: [
      { type: "p", text: "被雨水浸湿的坟丘、倾斜的碑石、倒塌的围石，按公园景观标准整修。施工前提供照片与估价，完工后再留下照片。" },
      { type: "list", items: ["坟丘重筑与铺草", "碑石更换与刻字", "平葬碑更换", "家族墓域动线整理"] },
    ],
  },
};

const ja: Record<string, PageCopy> = {
  "about/intro": {
    kicker: "財団紹介",
    title: "安養公園のご案内",
    lead: "安山市常緑区陽上洞、空に近い場所で故人をお守りし、ご遺族に寄り添います。",
    alt: `${SITE.shortName} 全景`,
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName}は${SITE.address}にある私立の追悼公園です。陽上洞の森と風を背景に、故人の安らぎと残された方の心をともに見守ります。`,
      },
      {
        type: "p",
        text: "奉安墓・樹木葬・埋葬墓・平葬墓を一つの公園でご案内し、庭園・カフェ・食堂・事務所が訪れる道を支えます。墓域検索と相談申込で、遠方のご家族も場所を確かめ、礼を尽くすことができます。",
      },
      {
        type: "list",
        items: [`所在地：${SITE.address}`, `電話：${SITE.phone}`, "区分：私立公園墓園", "埋葬形態：奉安墓、樹木葬、埋葬墓、平葬墓"],
      },
    ],
  },
  "about/greeting": {
    kicker: "財団紹介",
    title: "理事長挨拶",
    lead: "想いがとどまる場所を整えて守ることが、私たちの本分です。",
    blocks: [
      {
        type: "quote",
        text: `旅立たれた方をお守りすることは、生きる人の心を守ることでもあります。${SITE.legalName}はその心を急がず、なお疎かにしません。`,
        cite: `${SITE.legalName} 理事長`,
      },
      {
        type: "p",
        text: "お越しいただきありがとうございます。公園は墓域である前に、家族が息を整える庭であるべきだと考えます。石の道と木々、一杯のお茶が慰めとなりますように。",
      },
      {
        type: "p",
        text: "分譲と管理、追悼と葬祭、古いお墓の手入れまで、一つの窓口でお尋ねください。一本の電話、一枚の相談票が、新たな別れの始まりになることがあります。",
      },
    ],
  },
  "about/history": {
    kicker: "財団紹介",
    title: "沿革",
    lead: "森が公園になり、公園が家族の場所になった時間です。",
    blocks: [
      {
        type: "timeline",
        items: [
          { year: "1987", text: "安山市常緑区陽上洞一帯に公園墓園が置かれ、安山・安養の生活圏に近い追悼の場が続いてきました。" },
          { year: "1990s", text: "墳丘墓域と動線を整え、墓参期の案内体制を整えました。" },
          { year: "2000s", text: "納骨・平葬区域を広げ、さまざまな埋葬方法を一つの公園で選べるようにしました。" },
          { year: "2010s", text: "樹木葬と追悼庭園を整え、カフェ・食堂などの滞在施設を補強しました。" },
          { year: "2020s", text: "オンライン墓域検索と相談申込を開き、遠方のご家族も場所を探し礼を尽くせるようにしました。" },
        ],
      },
    ],
  },
  "about/guide": {
    kicker: "財団紹介",
    title: "利用案内",
    lead: "事前に知っておくと、墓参と相談がより穏やかになります。",
    blocks: [
      {
        type: "p",
        text: "事務所は毎日開き、墓域は日の出から日没まで出入りできます。祝日と寒食には案内を増やします。専用駐車場はありませんので、近隣路上に駐車してください。",
      },
      {
        type: "list",
        items: [
          `開園時間：${SITE.hours}`,
          `管理事務所：${SITE.phone}`,
          "駐車：専用駐車場なし（近隣路上を利用）",
          "祭祀：各墓域および共同参拝空間",
          "供物：使い捨て用品は指定回収箱へ、花輪は事務所へご相談",
          "禁止：炊事、墓域内の飲酒、無断撮影・商業撮影",
        ],
      },
      {
        type: "p",
        text: "改葬・開葬・合葬は事前相談のうえ行います。必要書類は掲示板またはお電話でご案内します。",
      },
    ],
  },
  "about/location": {
    kicker: "財団紹介",
    title: "アクセス",
    lead: "地図・公共交通・お車でのご案内です。",
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName}は${SITE.address}にあります。地下鉄中央駅からバスに乗り換えると陽上洞入口に着きます。`,
      },
      {
        type: "list",
        items: [`代表電話：${SITE.phone}`, `住所：${SITE.address}`, "墓参期の混雑：午前10時〜午後1時"],
      },
    ],
  },
  "lots/procedure": {
    kicker: "分譲案内",
    title: "分譲手続き",
    lead: "お問い合わせから墓域の使用まで、手順と書類を一覧にします。",
    blocks: [
      {
        type: "steps",
        title: "墓地使用契約",
        items: [
          { label: "1", text: "相談" },
          { label: "2", text: "現地確認" },
          { label: "3", text: "契約・手付" },
          { label: "4", text: "残金" },
          { label: "5", text: "墓域の使用" },
        ],
      },
      {
        type: "procGrid",
        items: [
          { title: "墓地使用契約", flow: "相談 → 現地確認 → 手付 → 残金 → 使用", docs: ["契約者の身分証明書", "契約者の印鑑", "手付入金確認"] },
          { title: "石物・碑石の設置", flow: "問合せ → 型選び → 契約 → 手付 → 残金 → 設置" },
          { title: "使用の通知", note: "埋葬・納骨作業の24時間前までに事務所へご連絡ください。", docs: ["契約者氏名", "墓域番号", "埋葬または納骨", "日時", "連絡先"] },
          { title: "埋葬", docs: ["死亡診断書または検案案内", "死体埋葬届出（事務所で代行可）", "届出人の住民票", "印鑑"] },
          { title: "納骨", docs: ["火葬証明", "納骨証明", "届出人の住民票", "印鑑", "墓地使用承諾書"], note: "骨壺：直径21cm、高さ25cm以下" },
          { title: "改葬 — 埋葬", docs: ["開葬届出証明", "埋葬・火葬届出（事務所代行可）", "届出人の住民票", "印鑑", "墓地使用承諾書"] },
          { title: "改葬 — 納骨", docs: ["開葬届出証明", "納骨証明", "届出人の住民票", "印鑑", "墓地使用承諾書"] },
        ],
      },
      { type: "p", text: "各形態の詳細は分譲ページと相談でご確認ください。" },
      { type: "cta", phone: SITE.phone, links: [{ href: "/consult", label: "相談申込", primary: true }] },
    ],
  },
  "lots/columbarium": {
    kicker: "分譲案内",
    title: "奉安墓",
    lead: "石と風の下で、遺骨を整えてお守りする場所です。",
    alt: "奉安墓",
    blocks: [
      { type: "p", text: "火葬後、骨壺を石室または奉安壇に安置します。管理がしやすく、参拝の動線も短くなります。" },
      {
        type: "list",
        items: ["2・4・8・16・24・32基（個人・家族）", "基数ごとの故人登録 — 会員登録時に墓番連動", "室内または半屋外", "定期清掃・献花代行可", "分譲状況と位置は相談でご案内"],
      },
    ],
  },
  "lots/tree": {
    kicker: "分譲案内",
    title: "樹木葬",
    lead: "木陰に名を残し、森とともに憩う埋葬です。",
    alt: "樹木葬",
    blocks: [
      { type: "p", text: "指定の木の下に遺骨を納め、小さな表石だけを置きます。墳丘を望まないご家族、森を残したいお気持ちに合います。" },
      { type: "list", items: ["松・紅葉エリア", "表石は低い自然石、文言は事務所と相談", "草刈りの負担が少なく景観が穏やか", "合葬・追加安置は樹木の状態により協議"] },
    ],
  },
  "lots/burial": {
    kicker: "分譲案内",
    title: "埋葬墓",
    lead: "伝統の墳丘が尾根に沿って続きます。",
    alt: "埋葬墓",
    blocks: [
      { type: "p", text: "埋葬墓は墳丘のある伝統墓域です。陽上洞の尾根の風を受けるよう区画し、草刈りと石物管理は年契約でお任せいただけます。" },
      { type: "list", items: ["単葬・合葬・双墳", "単葬1基・合葬・双墳2基", "碑石・供石の規格はご案内", "墓参期の除草・献花代行", "改葬は事前届出"] },
    ],
  },
  "lots/flat": {
    kicker: "分譲案内",
    title: "平葬墓",
    lead: "芝生と低い表石だけの整った芝生墓域です。",
    alt: "平葬墓",
    blocks: [
      { type: "p", text: "平葬墓は墳丘がなく、芝生を平らにし低い表石だけを置きます。景観が整い歩きやすく、高齢の方にも負担が少ないです。" },
      { type: "list", items: ["4・6・8・16位の芝生平葬", "火葬後の納骨平葬が一般的", "表石は公園基準に従う", "芝生管理は財団が一括実施", "配偶者合葬の事前予約可"] },
    ],
  },
  "lots/composite": {
    kicker: "分譲案内",
    title: "複合墓",
    lead: "奉安と埋葬・平葬を組み合わせた大型の家族安置空間です。",
    alt: "複合墓",
    blocks: [
      { type: "p", text: "複合墓は多基安置が必要な家族墓域で、16基から24基まで選べます。奉安・納骨・合葬を一つの区域で柔軟に構成します。" },
      { type: "list", items: ["16・20・24基", "家族の大型安置に適する", "基数ごとの故人登録", "石物・管理は相談後に設計", "分譲可能区域は相談でご案内"] },
    ],
  },
  "facilities/garden": {
    kicker: "施設案内",
    title: "庭園",
    lead: "参拝の前後に息を整える追悼庭園です。",
    alt: "追悼庭園",
    blocks: [
      { type: "p", text: "石灯籠と苔、松の間の小道が庭の骨格です。共同参拝石とベンチを置き、墓域に上がる前に心を整えられます。" },
      { type: "list", items: ["四季の草花と松", "車椅子が届く緩やかな散歩路", "共同献花台と回収箱"] },
    ],
  },
  "facilities/cafe": {
    kicker: "施設案内",
    title: "カフェ",
    lead: "窓の外に森が見える静かな休憩所です。",
    alt: "公園カフェ",
    blocks: [
      { type: "p", text: "墓参の後にお茶をいただく場所です。大きな声の営業はせず、温かい飲み物と簡単な茶菓子だけを置きます。" },
      { type: "list", items: ["営業：09:00–17:30（月曜休は別途案内）", "窓際席と小規模家族席", "持帰り可、墓域への持込みは蓋付きのみ"] },
    ],
  },
  "facilities/restaurant": {
    kicker: "施設案内",
    title: "食堂",
    lead: "祭祀の前後、家族が囲む簡素な食事の場です。",
    alt: "公園食堂",
    blocks: [
      { type: "p", text: "祝日と命日は予約が集中します。韓食中心の簡素な献立で、祭祀料理の持出しは衛生基準に沿ってご案内します。" },
      { type: "list", items: [`団体予約：事務所 ${SITE.phone}`, "約80席", "墓参期は待ち番号を運用"] },
    ],
  },
  "facilities/office": {
    kicker: "施設案内",
    title: "事務所",
    lead: "分譲・管理・改葬の相談を一か所で受けられます。",
    alt: "管理事務所",
    blocks: [
      { type: "p", text: "管理事務所は公園入口道路の手前にあります。墓域位置、使用料、開葬届出、オンライン相談の後続連絡をここで行います。" },
      { type: "list", items: [`電話：${SITE.phone}`, `開園：${SITE.hours}`, "身分証、改葬・合葬時は関係書類をご持参ください"] },
    ],
  },
  "services/memorial": {
    kicker: "サービス",
    title: "追悼",
    lead: "命日と祝日、遠方のご家族に代わり礼を尽くします。",
    blocks: [
      { type: "p", text: "追悼代行は献花、芝生の手入れ、墓域写真の返信までを一式で行います。分譲とは異なり、すでに安置された場所への訪問・管理です。" },
      { type: "list", items: ["命日・寒食・秋夕の代行", "献花＋墓域写真の送付", "年間定期追悼契約", "現地確認後のご案内"] },
      { type: "cta", links: [{ href: "/consult?type=memorial&source=memorial", label: "相談申込", primary: true }] },
    ],
  },
  "services/sangjo": {
    kicker: "サービス",
    title: "葬祭サポート",
    lead: "突然の別れでも、手続きが揺れないようお手伝いします。",
    blocks: [
      { type: "p", text: "葬祭サポートは葬儀と安置日程をつなぐ同行です。提携斎場・火葬場から奉安・樹木・平葬まで、一人の担当が引き継ぎます。" },
      { type: "list", items: ["24時間相談", "安置日程・車両・祭祀の調整", "既存の互助会員との連携相談"] },
    ],
  },
  "services/grave": {
    kicker: "サービス",
    title: "墓地",
    lead: "すでにお守りしている墓の管理・移転・書類までお任せいただくサービスです。",
    blocks: [
      { type: "p", text: "分譲が「新しい場所」なら、この墓地サービスは「ある場所」を守る仕事です。草刈り、石物の傾き補正、改葬代行、閉鎖届出を担います。" },
      { type: "list", items: ["年2回の基本草刈り", "石物・芝生の補修", "他地域からの改葬手配"] },
    ],
  },
  "services/remodel": {
    kicker: "サービス",
    title: "リフォーム",
    lead: "古い墳丘と石物を、改めて端正に立てます。",
    blocks: [
      { type: "p", text: "雨の染みた墳丘、傾いた碑石、崩れた囲い石を公園の景観基準に合わせて整えます。施工前に写真と見積もりを、終了後にも写真を残します。" },
      { type: "list", items: ["墳丘の再築と芝張り", "碑石の交換と刻字", "平葬表石の交換", "家族墓域の動線整備"] },
    ],
  },
};

const COPIES: Partial<Record<Locale, Record<string, PageCopy>>> = { en, zh, ja };

export function localizePage(page: StaticPage, locale: Locale): StaticPage {
  if (locale === "ko") return page;
  const copy = COPIES[locale]?.[`${page.section}/${page.slug}`];
  if (!copy) return page;
  return {
    ...page,
    kicker: copy.kicker,
    title: copy.title,
    lead: copy.lead,
    image: page.image ? { ...page.image, alt: copy.alt || page.image.alt } : page.image,
    blocks: copy.blocks,
  };
}
