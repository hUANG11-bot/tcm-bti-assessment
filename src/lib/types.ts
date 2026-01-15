export type DimensionScore = {
  [key: string]: number;
};

export type DimensionResult = {
  dimension: string;
  scoreLeft: number;
  scoreRight: number;
  diff: number;
  tendency: 'Strong Left' | 'Moderate Left' | 'Weak Left' | 'Slight Left' | 'Balanced' | 'Slight Right' | 'Weak Right' | 'Moderate Right' | 'Strong Right';
  label: string; // e.g., "阴(Y) 强倾向"
};

export type UserInfo = {
  phone?: string; // 手机号，用于用户识别
  age: number;
  gender: 'male' | 'female' | '男' | '女' | '其他';
  habits: string[]; // e.g., ['sedentary', 'screen_time']
};

export type HabitRisk = {
  value: string;
  label: string;
  tcmFocus: string[];
  advice: string;
  warning: string;
};

export type AssessmentResult = {
  dimensions: DimensionResult[];
  mainType: string;
  compositeType: string[];
  description: string;
  detailedAnalysis: {
    mechanism: string; // 机理解析
    manifestations: string[]; // 典型表现
    susceptibility: string[]; // 易感疾病
  };
  recommendations: {
    diet: {
      principle: string; // 饮食原则
      goodFoods: string[]; // 宜吃食物
      badFoods: string[]; // 忌吃食物
      recipes: { name: string; ingredients: string; efficacy: string }[]; // 推荐食谱
    };
    exercise: string;
    lifestyle: string;
    emotion: string;
    acupoints: { name: string; location: string; method: string }[]; // 穴位按摩
    habits?: string[];
  };
  warnings: string[];
};

export const BODY_TYPES: { [key: string]: any } = {
  'Y+W': {
    name: '寒湿体质',
    description: '身体偏寒，湿气重。表现为怕冷、身体沉困、大便黏腻。',
    recommendations: {
      diet: '温阳化湿。多吃生姜、羊肉、花椒；少吃冰饮、生鱼片。',
      exercise: '慢跑、快走，微微出汗即可。',
      lifestyle: '注意保暖，避免久坐。',
      emotion: '保持心情舒畅，避免抑郁。',
    },
  },
  'Y+Z': {
    name: '阳虚燥象',
    description: '阳气不足，津液亏损。表现为怕冷但口干、皮肤干燥。',
    recommendations: {
      diet: '温润兼顾。多吃山药、枸杞、黑芝麻；少吃辛辣。',
      exercise: '太极拳、八段锦。',
      lifestyle: '早睡早起，避免熬夜。',
      emotion: '平和心态，避免急躁。',
    },
  },
  'A+Z': {
    name: '阴虚燥热',
    description: '阴液亏损，虚火内生。表现为怕热、口干、手脚心热。',
    recommendations: {
      diet: '滋阴清热。多吃百合、银耳、鸭肉；少吃羊肉、辣椒。',
      exercise: '瑜伽、游泳。',
      lifestyle: '避免高温环境，保持室内湿度。',
      emotion: '静心安神，避免发怒。',
    },
  },
  'A+W': {
    name: '湿热体质',
    description: '湿热内蕴。表现为面垢油光、口苦、身重困倦。',
    recommendations: {
      diet: '清热利湿。多吃绿豆、冬瓜、薏米；少吃甜食、油腻。',
      exercise: '中长跑、球类运动，多出汗。',
      lifestyle: '保持环境通风干燥。',
      emotion: '克制急躁，保持冷静。',
    },
  },
  'X+K': {
    name: '气虚血瘀',
    description: '元气不足，血行不畅。表现为乏力、气短、疼痛固定。',
    recommendations: {
      diet: '补气活血。多吃黄芪、当归、红枣；少吃萝卜（破气）。',
      exercise: '散步、气功。',
      lifestyle: '避免过度劳累，注意休息。',
      emotion: '乐观向上，避免悲忧。',
    },
  },
  'X+M': {
    name: '气血两虚兼敏感',
    description: '气血双亏，神不守舍。表现为心悸、失眠、易过敏。',
    recommendations: {
      diet: '气血双补，安神。多吃桂圆、红枣、莲子；少吃生冷。',
      exercise: '轻柔运动，如瑜伽。',
      lifestyle: '规律作息，保证充足睡眠。',
      emotion: '避免惊恐，保持安宁。',
    },
  },
  'S+K': {
    name: '气滞血瘀实证',
    description: '实邪阻滞，气血不通。表现为胀痛、胸闷、情绪抑郁。',
    recommendations: {
      diet: '理气活血。多吃陈皮、山楂、玫瑰花；少吃胀气食物。',
      exercise: '舞蹈、拳击，宣泄情绪。',
      lifestyle: '多听音乐，多社交。',
      emotion: '及时宣泄，避免压抑。',
    },
  },
  'S+M': {
    name: '肝郁化火',
    description: '肝气郁结，化火扰神。表现为急躁易怒、头痛、失眠。',
    recommendations: {
      diet: '疏肝清热。多吃芹菜、菊花、苦瓜；少吃辛辣刺激。',
      exercise: '户外运动，登山、旅游。',
      lifestyle: '避免熬夜，减少压力。',
      emotion: '学会放松，调节压力。',
    },
  },
  'Balanced': {
    name: '平和体质',
    description: '阴阳气血调和。表现为体态适中、面色红润、精力充沛。',
    recommendations: {
      diet: '饮食均衡，不偏食。',
      exercise: '坚持适度运动。',
      lifestyle: '起居有常，劳逸结合。',
      emotion: '开朗乐观，积极向上。',
    },
  },
};
