import { BiochemicalCompound } from '../types';

export const METABOLIC_COMPOUNDS: BiochemicalCompound[] = [
  {
    cid: 190,
    name: '腺嘌呤',
    enName: 'Adenine (6-Aminopurine)',
    formula: 'C5H5N5',
    molecularWeight: '135.13 g/mol',
    canonicalSmiles: 'C1=NC(=C2C(=N1)N=CN2)N',
    role: 'ATP、NAD+、DNA 与 RNA 核心含氮碱基。在细胞核丰富的动物肝肾、酵母与海鲜中极富集。',
    solubilityNote: '脱氨水解后生成次黄嘌呤（Hypoxanthine），是向黄嘌呤转化的第一阶段枢纽。',
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/190/PNG?image_size=large',
    metabolismStep: '阶段一：核酸水解产物'
  },
  {
    cid: 135398634,
    name: '鸟嘌呤',
    enName: 'Guanine (2-Amino-6-oxopurine)',
    formula: 'C5H5N5O',
    molecularWeight: '151.13 g/mol',
    canonicalSmiles: 'C1=NC2=C(N1)C(=O)NC(=N2)N',
    role: '核酸鸟苷酸（GMP）的基本碱基，广泛存在于肌肉横纹肌纤维细胞质与细胞核中。',
    solubilityNote: '由鸟嘌呤脱氨酶（Guanase）催化水解，直接生成黄嘌呤（Xanthine）。',
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/135398634/PNG?image_size=large',
    metabolismStep: '阶段一：核酸水解产物'
  },
  {
    cid: 790,
    name: '次黄嘌呤',
    enName: 'Hypoxanthine (Purin-6-one)',
    formula: 'C5H4N4O',
    molecularWeight: '136.11 g/mol',
    canonicalSmiles: 'C1=NC2=C(N1)C(=O)NC=N2',
    role: '水产海鲜与红肉中最易被吸收且诱发血尿酸爆发式增长的嘌呤亚型。',
    solubilityNote: '由黄嘌呤氧化酶（XO）催化 C-2 位羟基化，氧化脱氢转化为黄嘌呤。',
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/790/PNG?image_size=large',
    metabolismStep: '阶段二：初级氧化中介'
  },
  {
    cid: 1188,
    name: '黄嘌呤',
    enName: 'Xanthine (Purine-2,6-dione)',
    formula: 'C5H4N4O2',
    molecularWeight: '152.11 g/mol',
    canonicalSmiles: 'C1=NC2=C(N1)C(=O)NC(=O)N2',
    role: '生成尿酸的直接前体。黄嘌呤氧化酶催化其 C-8 位进一步加氧，产出尿酸与超氧自由基。',
    solubilityNote: '临床抗痛风药物（别嘌醇、非布司他）即精准结合黄嘌呤氧化酶活性中心，阻断黄嘌呤转变为尿酸。',
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/1188/PNG?image_size=large',
    metabolismStep: '阶段三：终末氧化底物'
  },
  {
    cid: 1175,
    name: '尿酸',
    enName: 'Uric Acid (Purine-2,6,8-trione)',
    formula: 'C5H4N4O3',
    molecularWeight: '168.11 g/mol',
    canonicalSmiles: 'C1=NC2=C(N1)C(=O)NC(=O)N2',
    role: '人类体内嘌呤代谢的终点产物。由于进化中尿酸酶基因失活，人类必须依赖肾脏（2/3）与肠道（1/3）排泄。',
    solubilityNote: '生理温度（37°C）与中性 pH 下饱和溶解极限约为 420 μmol/L (7.0 mg/dL)。超出饱和点即易在趾指关节析出针状尿酸钠晶体。',
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/1175/PNG?image_size=large',
    metabolismStep: '阶段四：代谢终产物'
  }
];

export interface PathwayNode {
  step: number;
  title: string;
  substrate: string;
  enzyme: string;
  product: string;
  description: string;
  clinicalSignificance: string;
}

export const METABOLIC_PATHWAY_STEPS: PathwayNode[] = [
  {
    step: 1,
    title: '膳食核酸分解与游离嘌呤释放',
    substrate: '食物细胞核 DNA / RNA / ATP',
    enzyme: '核酸内切酶 & 磷酸二酯酶 (胃肠道消化液)',
    product: '腺嘌呤 (Adenine) & 鸟嘌呤 (Guanine)',
    description: '摄入的肉类、水产或豆类食物在消化道被胰液核酸酶分解为单核苷酸，随后释放出游离嘌呤碱基并被小肠上皮吸收。',
    clinicalSignificance: '焯水或弃汤能洗脱大量游离水溶性核苷酸，减少入肠吸收量达 30%-40%。'
  },
  {
    step: 2,
    title: '脱氨水解汇聚为次黄嘌呤与黄嘌呤',
    substrate: '腺嘌呤 & 鸟嘌呤',
    enzyme: '腺苷酸脱氨酶 (ADA) & 鸟嘌呤脱氨酶 (Guanase)',
    product: '次黄嘌呤 (Hypoxanthine) & 黄嘌呤 (Xanthine)',
    description: '含氨基的嘌呤碱基脱去氨基，腺嘌呤转为次黄嘌呤，鸟嘌呤直接脱氨转为黄嘌呤，双路汇入肝脏氧化池。',
    clinicalSignificance: '海鲜中天然富含次黄嘌呤核苷，代谢效率极高，因此海鲜比普通肉类更易引起尿酸短时间飙升。'
  },
  {
    step: 3,
    title: '黄嘌呤氧化酶 (XO) 两步关键氧化',
    substrate: '次黄嘌呤 ➔ 黄嘌呤 ➔ 尿酸',
    enzyme: '黄嘌呤氧化酶 (Xanthine Oxidase, XOD)',
    product: '尿酸 (Uric Acid) + 过氧化氢 (H2O2)',
    description: '以钼蝶呤（Moco）为活性催化中心，分两步依次将次黄嘌呤加氧为黄嘌呤，再将黄嘌呤氧化为尿酸。此过程同时伴生过氧化自由基。',
    clinicalSignificance: '这是人体生成尿酸的唯一终末限速酶，也是痛风药物研发与饮食抗氧化调控的核心靶点。'
  },
  {
    step: 4,
    title: '肾脏近曲小管滤过与多通道转运',
    substrate: '血清尿酸盐 (MSU)',
    enzyme: 'URAT1 (重吸收) / GLUT9 / ABCG2 (排泄转运体)',
    product: '随终尿排出体外 (约 70%)',
    description: '肾小球完全滤过尿酸，随后在近端小管经历复杂的重吸收与再分泌机制。约 10% 经肾排出，30% 经肠道菌群裂解。',
    clinicalSignificance: '保持充足水分可提高肾小球滤过率；尿液碱化（pH 6.2~6.8）可使游离可溶性尿酸盐比例提高 10 倍以上！'
  }
];

export const DIETARY_SYNERGY_RULES = [
  {
    title: '水分稀释动力学',
    formula: '每日基础饮水 2000mL + (每摄入 100mg 嘌呤追加 200mL 水分)',
    explanation: '多饮水可降低髓质集合管内尿酸局部浓度，预防微晶核形成，并促进每日尿量维持在 2000mL 以上。'
  },
  {
    title: '维生素 C 促排效应',
    formula: '每日摄入 500mg 维C（相当于彩椒、西兰花、柑橘）',
    explanation: '维C在肾近曲小管与尿酸竞争 URAT1 重吸收转运蛋白，可加速血尿酸经尿液排出。'
  },
  {
    title: '乳清蛋白促排机制',
    formula: '低脂牛奶 / 纯酸奶 250~300mL',
    explanation: '牛奶中的乳清酸（Orotic acid）能抑制尿酸在肾小管重吸收，且牛奶自身属于几乎无嘌呤的优质蛋白质。'
  },
  {
    title: '果糖与酒精的抑制屏障',
    formula: '杜绝果葡糖浆软饮 & 严格戒啤酒/烈酒',
    explanation: '酒精代谢产生乳酸竞争性抑制肾脏排酸通道，果糖消耗肝细胞ATP加速嘌呤从头合成。'
  }
];
