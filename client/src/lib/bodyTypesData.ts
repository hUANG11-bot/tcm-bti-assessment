export const BODY_TYPES_DATA: { [key: string]: any } = {
  'Balanced': {
    name: '平和体质',
    description: '阴阳气血调和，体态适中，面色红润，精力充沛。',
    detailedAnalysis: {
      mechanism: '先天禀赋良好，后天调养得当，五脏六腑功能协调，气血运行顺畅。',
      manifestations: ['面色红润', '精力充沛', '睡眠安稳', '二便正常', '舌淡红苔薄白'],
      susceptibility: ['较少生病', '适应能力强'],
    },
    recommendations: {
      diet: {
        principle: '饮食有节，不偏不倚，顺应四时。',
        goodFoods: ['五谷杂粮', '时令蔬菜', '适量肉蛋奶'],
        badFoods: ['过饥过饱', '偏食挑食', '生冷油腻'],
        recipes: [
          { name: '山药排骨汤', ingredients: '山药、排骨、枸杞', efficacy: '健脾益胃，滋肾益精' },
          { name: '五色蔬菜沙拉', ingredients: '生菜、紫甘蓝、胡萝卜、玉米、黄瓜', efficacy: '补充多种维生素，保持营养均衡' }
        ]
      },
      exercise: '适度运动，如慢跑、游泳、太极拳，保持活力。',
      lifestyle: '起居规律，劳逸结合，保持心情愉悦。',
      emotion: '开朗乐观，心态平和。',
      acupoints: [
        { name: '足三里', location: '小腿外侧，犊鼻下3寸', method: '每日按揉3-5分钟，强身健体' }
      ]
    }
  },
  'Y+W': {
    name: '寒湿体质',
    description: '阳气不足，湿气内停。畏寒怕冷，手脚冰凉，易水肿，大便溏薄。',
    detailedAnalysis: {
      mechanism: '脾肾阳虚，运化失职，水湿内停。寒主收引，湿性重浊。',
      manifestations: ['手脚冰凉', '容易水肿', '大便不成形', '舌淡胖有齿痕', '口淡不渴'],
      susceptibility: ['关节炎', '慢性腹泻', '痛经', '水肿'],
    },
    recommendations: {
      diet: {
        principle: '温阳散寒，健脾祛湿。',
        goodFoods: ['生姜', '羊肉', '花椒', '韭菜', '薏米（炒）', '陈皮'],
        badFoods: ['冰淇淋', '西瓜', '绿豆', '生鱼片', '凉茶'],
        recipes: [
          { name: '当归生姜羊肉汤', ingredients: '当归、生姜、羊肉', efficacy: '温中补虚，祛寒止痛' },
          { name: '陈皮红豆沙', ingredients: '陈皮、红豆、红糖', efficacy: '理气健脾，燥湿化痰' }
        ]
      },
      exercise: '适合有氧运动，如快走、慢跑，以微微出汗为宜，动则生阳。',
      lifestyle: '注意保暖，尤其是腰腹和足部。多晒太阳，避免淋雨涉水。',
      emotion: '多听欢快音乐，保持积极心态，避免忧思伤脾。',
      acupoints: [
        { name: '关元穴', location: '肚脐下3寸', method: '艾灸或热敷，温补元气' },
        { name: '丰隆穴', location: '小腿外侧，外踝尖上8寸', method: '按揉祛湿化痰' }
      ]
    }
  },
  'Y+Z': {
    name: '阳虚燥体质',
    description: '阳气不足，津液亏损。怕冷又口干，皮肤干燥，易便秘。',
    detailedAnalysis: {
      mechanism: '阳虚不能蒸腾气化津液，导致津液不能上承外布，故见燥象。',
      manifestations: ['怕冷', '口干咽燥', '皮肤干', '大便干结', '舌淡少苔'],
      susceptibility: ['干燥综合征', '便秘', '慢性咽炎'],
    },
    recommendations: {
      diet: {
        principle: '温阳润燥，生津止渴。',
        goodFoods: ['核桃', '黑芝麻', '蜂蜜', '银耳', '山药', '肉苁蓉'],
        badFoods: ['辣椒', '烧烤', '苦寒泻火之品'],
        recipes: [
          { name: '芝麻核桃粥', ingredients: '黑芝麻、核桃仁、大米', efficacy: '温补肾阳，润肠通便' },
          { name: '沙参玉竹老鸭汤', ingredients: '沙参、玉竹、老鸭', efficacy: '滋阴润燥，补益脾胃' }
        ]
      },
      exercise: '适度运动，避免大汗淋漓伤津。瑜伽、太极较好。',
      lifestyle: '保持室内湿度，多喝温水。早睡早起，养精蓄锐。',
      emotion: '保持心情舒畅，避免急躁。',
      acupoints: [
        { name: '太溪穴', location: '足内踝后方与跟腱之间的凹陷处', method: '滋阴补肾' },
        { name: '照海穴', location: '足内踝尖下1寸', method: '滋阴清热' }
      ]
    }
  },
  'A+Z': {
    name: '阴虚燥热体质',
    description: '阴液亏虚，虚火内扰。手足心热，口干舌燥，易失眠，大便干。',
    detailedAnalysis: {
      mechanism: '体内阴液不足，无法制约阳气，导致虚火内生，灼伤津液。',
      manifestations: ['手足心热', '潮热盗汗', '口干喜冷饮', '大便干结', '舌红少苔'],
      susceptibility: ['甲亢', '高血压', '糖尿病', '失眠'],
    },
    recommendations: {
      diet: {
        principle: '滋阴清热，润燥生津。',
        goodFoods: ['百合', '银耳', '鸭肉', '梨', '莲藕', '黑木耳'],
        badFoods: ['羊肉', '辣椒', '花椒', '白酒', '荔枝'],
        recipes: [
          { name: '百合银耳莲子羹', ingredients: '百合、银耳、莲子、冰糖', efficacy: '滋阴润肺，养心安神' },
          { name: '凉拌藕片', ingredients: '莲藕、醋、少量糖', efficacy: '清热生津，凉血止血' }
        ]
      },
      exercise: '不宜剧烈运动，适合游泳、散步。避免在高温下运动。',
      lifestyle: '保证充足睡眠，避免熬夜。睡前泡脚（水温不宜过高）。',
      emotion: '戒急戒躁，通过静坐、冥想平复心火。',
      acupoints: [
        { name: '三阴交', location: '小腿内侧，足内踝尖上3寸', method: '滋阴健脾' },
        { name: '涌泉穴', location: '足底前1/3处', method: '引火归元，滋阴降火' }
      ]
    }
  },
  'A+W': {
    name: '湿热体质',
    description: '湿热内蕴。面垢油光，易生痤疮，口苦口臭，大便黏滞。',
    detailedAnalysis: {
      mechanism: '湿邪与热邪纠结，蕴结于脾胃肝胆。湿重则困阻，热重则灼伤。',
      manifestations: ['面油光', '易长痘', '口苦口臭', '身重困倦', '大便黏滞', '舌红苔黄腻'],
      susceptibility: ['痤疮', '湿疹', '黄疸', '泌尿系感染'],
    },
    recommendations: {
      diet: {
        principle: '清热利湿，分消走泄。',
        goodFoods: ['绿豆', '冬瓜', '丝瓜', '赤小豆', '薏米', '苦瓜'],
        badFoods: ['辛辣', '油炸', '甜食', '酒', '滋补品'],
        recipes: [
          { name: '冬瓜薏米排骨汤', ingredients: '冬瓜、薏米、排骨', efficacy: '清热利湿，健脾' },
          { name: '凉拌苦瓜', ingredients: '苦瓜、蒜末', efficacy: '清热祛心火，解毒' }
        ]
      },
      exercise: '适合中高强度运动，如跑步、球类，多出汗以排湿热。',
      lifestyle: '保持环境通风干燥。避免熬夜，熬夜生湿热。',
      emotion: '克制急躁情绪，寻找宣泄途径。',
      acupoints: [
        { name: '曲池穴', location: '肘横纹外侧端', method: '清热解表' },
        { name: '阴陵泉', location: '小腿内侧，胫骨内侧髁下缘凹陷处', method: '健脾利湿' }
      ]
    }
  },
  // Fallback for mixed types or others, simplified for now
  'Mixed': {
    name: '混合体质',
    description: '体质特征复杂，兼具多种倾向。',
    detailedAnalysis: {
      mechanism: '脏腑功能失调较复杂，可能寒热错杂，虚实夹杂。',
      manifestations: ['症状多样', '时寒时热', '虚实并见'],
      susceptibility: ['亚健康状态', '免疫力波动'],
    },
    recommendations: {
      diet: {
        principle: '寒热并调，攻补兼施。',
        goodFoods: ['平性食物为主', '山药', '茯苓', '苹果'],
        badFoods: ['极端寒凉或辛辣食物'],
        recipes: [
          { name: '山药茯苓粥', ingredients: '山药、茯苓、大米', efficacy: '健脾祛湿，平补脾胃' }
        ]
      },
      exercise: '根据身体状况选择适度运动，循序渐进。',
      lifestyle: '规律作息，关注身体信号，及时调整。',
      emotion: '保持平和，避免情绪大起大落。',
      acupoints: [
        { name: '足三里', location: '小腿外侧，犊鼻下3寸', method: '双向调节，增强免疫' }
      ]
    }
  }
};
