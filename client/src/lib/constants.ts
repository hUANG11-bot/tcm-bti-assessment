export type Option = {
  label: string;
  value: string;
  score: {
    [key: string]: number;
  };
};

export type Question = {
  id: string;
  text: string;
  dimension: 'Y/A' | 'X/S' | 'Z/W' | 'K/M';
  options: Option[];
  isGolden?: boolean;
  triggerCondition?: {
    dimension: string;
    minDiff: number;
    maxDiff: number;
  };
};

export const DIMENSIONS = {
  'Y/A': { name: '能量性质', left: '阴(Y)', right: '阳(A)', color: '#8FBC8F' },
  'X/S': { name: '生命力强度', left: '虚(X)', right: '实(S)', color: '#D2B48C' },
  'Z/W': { name: '津液状态', left: '燥(Z)', right: '湿(W)', color: '#C0C0C0' },
  'K/M': { name: '气血运行', left: '滞(K)', right: '敏(M)', color: '#CD5C5C' },
};

export const QUESTIONS: Question[] = [
  // 维度一：能量性质 (Y/A)
  {
    id: 'Q1',
    text: '日常及寒冷环境下，你的手脚温度通常是？',
    dimension: 'Y/A',
    options: [
      { label: '常年偏凉，冬天钻进被窝很久暖不过来', value: 'A', score: { Y: 2, A: 0 } },
      { label: '多数时间偏凉，活动后或温暖环境下改善', value: 'B', score: { Y: 1, A: 0 } },
      { label: '手脚温度适中，冬夏无明显异常', value: 'C', score: { Y: 0, A: 0 } },
      { label: '多数时间温热，冬天很快能暖和被子', value: 'D', score: { Y: 0, A: 1 } },
      { label: '常年偏热，容易出汗潮湿，夏天需伸脚散热', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q2',
    text: '夏天在空调房（每日≥4小时），你的感受是？',
    dimension: 'Y/A',
    options: [
      { label: '26℃以上才舒服，超过2小时觉得冷', value: 'A', score: { Y: 2, A: 0 } },
      { label: '26℃左右适宜，连续吹4小时以上不适', value: 'B', score: { Y: 1, A: 0 } },
      { label: '25℃左右舒适，连续吹6小时也无明显不适', value: 'C', score: { Y: 0, A: 0 } },
      { label: '24-26℃最舒适，连续吹6小时无不适', value: 'D', score: { Y: 0, A: 1 } },
      { label: '必须24℃以下，否则闷热难耐', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q3',
    text: '日常饮水（非特殊场景）的温度偏好是？',
    dimension: 'Y/A',
    options: [
      { label: '只喝温水/热水（≥45℃），凉水会胃痛', value: 'A', score: { Y: 2, A: 0 } },
      { label: '偏爱温水（35-45℃），偶尔喝常温水', value: 'B', score: { Y: 1, A: 0 } },
      { label: '常温水（25-30℃）最舒适，冷热均可接受', value: 'C', score: { Y: 0, A: 0 } },
      { label: '常温水（20-30℃）最舒服，热水嫌烫', value: 'D', score: { Y: 0, A: 1 } },
      { label: '喜欢冰水（≤10℃），喝热水会出汗烦躁', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q4',
    text: '洗澡时，你偏好的水温及感受是？',
    dimension: 'Y/A',
    options: [
      { label: '较热（40-45℃），洗后皮肤发红才舒服', value: 'A', score: { Y: 2, A: 0 } },
      { label: '偏热（38-40℃），感觉放松无不适', value: 'B', score: { Y: 1, A: 0 } },
      { label: '温水（37-38℃），与体温接近，洗后清爽舒适', value: 'C', score: { Y: 0, A: 0 } },
      { label: '温水（35-38℃），太热会胸闷', value: 'D', score: { Y: 0, A: 1 } },
      { label: '偏凉（30-35℃），清爽提神', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q6',
    text: '吃辛辣食物（如辣椒、花椒）后，你的反应是？',
    dimension: 'Y/A',
    options: [
      { label: '很舒服，身体暖和，精神好', value: 'A', score: { Y: 2, A: 0 } },
      { label: '能接受，无明显不适', value: 'B', score: { Y: 1, A: 0 } },
      { label: '适量食用无不适，也无明显舒适感', value: 'C', score: { Y: 0, A: 0 } },
      { label: '偶尔上火，长痘或口干', value: 'D', score: { Y: 0, A: 1 } },
      { label: '极易上火，口腔溃疡/喉咙痛', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q7',
    text: '你的面色通常看起来（无化妆状态）？',
    dimension: 'Y/A',
    options: [
      { label: '苍白或萎黄，缺乏光泽', value: 'A', score: { Y: 2, A: 0 } },
      { label: '淡白，稍有血色，不易泛红', value: 'B', score: { Y: 1, A: 0 } },
      { label: '肤色均匀，有自然光泽', value: 'C', score: { Y: 0, A: 0 } },
      { label: '红润，气色不错，阳光照射后更明显', value: 'D', score: { Y: 0, A: 1 } },
      { label: '偏红或潮红，尤其午后、运动后明显', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'Q8',
    text: '感冒初起时的常见症状？',
    dimension: 'Y/A',
    options: [
      { label: '明显怕冷，流清涕，必须加衣', value: 'A', score: { Y: 2, A: 0 } },
      { label: '有些怕冷，轻微清涕，无需加衣', value: 'B', score: { Y: 1, A: 0 } },
      { label: '无明显怕冷或发热，仅轻微鼻塞', value: 'C', score: { Y: 0, A: 0 } },
      { label: '轻微发热，喉咙干，无怕冷感', value: 'D', score: { Y: 0, A: 1 } },
      { label: '明显发热，喉咙痛，流黄涕', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  // 维度二：生命力强度 (X/S)
  {
    id: 'Q9',
    text: '连续高强度工作3天后，你的感觉是？',
    dimension: 'X/S',
    options: [
      { label: '极度疲惫，睡12小时以上仍缓不过来', value: 'A', score: { X: 2, S: 0 } },
      { label: '很累，需1-2天休息才能恢复', value: 'B', score: { X: 1, S: 0 } },
      { label: '有些疲惫，休息半天即可恢复', value: 'C', score: { X: 0, S: 0 } },
      { label: '精神尚可，肩背腰肌肉酸痛', value: 'D', score: { X: 0, S: 1 } },
      { label: '精神亢奋，腹部/头部胀痛', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q10',
    text: '早晨起床时的状态（每周≥5天）？',
    dimension: 'X/S',
    options: [
      { label: '非常困倦，挣扎10分钟以上才能起', value: 'A', score: { X: 2, S: 0 } },
      { label: '有些困，需要咖啡/浓茶提神', value: 'B', score: { X: 1, S: 0 } },
      { label: '睡醒后清爽，无困倦感', value: 'C', score: { X: 0, S: 0 } },
      { label: '身体沉重，像灌了铅', value: 'D', score: { X: 0, S: 1 } },
      { label: '头脑昏沉，但身体有胀感', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q11',
    text: '你的声音特点是？',
    dimension: 'X/S',
    options: [
      { label: '细弱无力，说话超过10分钟就累', value: 'A', score: { X: 2, S: 0 } },
      { label: '声音不大，说话没力气，易气短', value: 'B', score: { X: 1, S: 0 } },
      { label: '声音适中，洪亮度刚好', value: 'C', score: { X: 0, S: 0 } },
      { label: '声音洪亮，但长时间说话后沙哑', value: 'D', score: { X: 0, S: 1 } },
      { label: '声音粗重，感觉有痰堵', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q12',
    text: '爬4层楼梯（正常速度）后，你的反应是？',
    dimension: 'X/S',
    options: [
      { label: '气喘心悸，需停下休息3分钟以上', value: 'A', score: { X: 2, S: 0 } },
      { label: '有些喘，但可继续行走', value: 'B', score: { X: 1, S: 0 } },
      { label: '呼吸平稳，仅轻微腿酸', value: 'C', score: { X: 0, S: 0 } },
      { label: '腿酸胀，但呼吸尚可', value: 'D', score: { X: 0, S: 1 } },
      { label: '胸闷腹胀，感觉气堵', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q13',
    text: '你的食欲与消化（日常状态）？',
    dimension: 'X/S',
    options: [
      { label: '食欲差，吃半碗饭就饱胀', value: 'A', score: { X: 2, S: 0 } },
      { label: '食欲一般，消化慢，饭后易打嗝', value: 'B', score: { X: 1, S: 0 } },
      { label: '食欲适中，三餐规律，消化正常', value: 'C', score: { X: 0, S: 0 } },
      { label: '食欲好，但吃多后易食积', value: 'D', score: { X: 0, S: 1 } },
      { label: '食欲旺盛，每餐吃得多，常腹胀便秘', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q14',
    text: '生病后（如感冒、肠胃炎）的恢复速度？',
    dimension: 'X/S',
    options: [
      { label: '很久才好，常拖成慢性（超过2周）', value: 'A', score: { X: 2, S: 0 } },
      { label: '恢复较慢，易反复（1-2周）', value: 'B', score: { X: 1, S: 0 } },
      { label: '恢复速度中等（7-10天）', value: 'C', score: { X: 0, S: 0 } },
      { label: '来得猛去得快，恢复尚可（3-7天）', value: 'D', score: { X: 0, S: 1 } },
      { label: '症状剧烈但恢复快（1-3天）', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'Q15',
    text: '你的体型与肌肉状态？',
    dimension: 'X/S',
    options: [
      { label: '消瘦或虚胖（松软无力）', value: 'A', score: { X: 2, S: 0 } },
      { label: '偏瘦，肌肉不发达，发力时无力', value: 'B', score: { X: 1, S: 0 } },
      { label: '体型匀称，肌肉松紧适中', value: 'C', score: { X: 0, S: 0 } },
      { label: '壮实，肌肉紧绷，触摸有硬度', value: 'D', score: { X: 0, S: 1 } },
      { label: '肥胖结实，按之硬满，不易推动', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  // 维度三：津液状态 (Z/W)
  {
    id: 'Q16',
    text: '口腔常有的感觉（每日≥6小时）？',
    dimension: 'Z/W',
    options: [
      { label: '明显口干，总想喝水，喝后仍不解渴', value: 'A', score: { Z: 2, W: 0 } },
      { label: '轻微口干，饮水后可缓解', value: 'B', score: { Z: 1, W: 0 } },
      { label: '口腔湿润，无口干或黏腻感', value: 'C', score: { Z: 0, W: 0 } },
      { label: '口中微黏，偶有异味', value: 'D', score: { Z: 0, W: 1 } },
      { label: '口黏腻，有甜味，异味重', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q17',
    text: '皮肤状态（无护肤状态下）？',
    dimension: 'Z/W',
    options: [
      { label: '干燥脱屑，秋冬尤甚，四肢明显', value: 'A', score: { Z: 2, W: 0 } },
      { label: '偏干，需每日涂保湿品，否则紧绷', value: 'B', score: { Z: 1, W: 0 } },
      { label: '皮肤水润有弹性，无干燥或油腻感', value: 'C', score: { Z: 0, W: 0 } },
      { label: '偏油，T区明显，毛孔较粗', value: 'D', score: { Z: 0, W: 1 } },
      { label: '油腻，毛孔粗大，易长痘', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q18',
    text: '眼睛感觉（每日用眼≥6小时）？',
    dimension: 'Z/W',
    options: [
      { label: '干涩明显，需每日用眼药水缓解', value: 'A', score: { Z: 2, W: 0 } },
      { label: '偶尔干涩，休息10分钟后可缓解', value: 'B', score: { Z: 1, W: 0 } },
      { label: '眼睛湿润，无干涩或分泌物过多', value: 'C', score: { Z: 0, W: 0 } },
      { label: '少许分泌物，微黏，无不适', value: 'D', score: { Z: 0, W: 1 } },
      { label: '眼屎多，晨起糊眼，易发红', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q19',
    text: '大便的典型状态（每周≥5次）？',
    dimension: 'Z/W',
    options: [
      { label: '干硬如羊粪，排便难，需用力', value: 'A', score: { Z: 2, W: 0 } },
      { label: '偏干，排出费力，成形但较硬', value: 'B', score: { Z: 1, W: 0 } },
      { label: '大便成形，软硬适中，排便顺畅', value: 'C', score: { Z: 0, W: 0 } },
      { label: '偏软，有时黏马桶，需冲2次', value: 'D', score: { Z: 0, W: 1 } },
      { label: '黏腻不成形，难冲净，便意不尽', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q20',
    text: '每周≥3次下午3-4点的感觉是？',
    dimension: 'Z/W',
    options: [
      { label: '燥热烦躁，想喝冷饮缓解', value: 'A', score: { Z: 2, W: 0 } },
      { label: '有些燥，想喝水，喝后舒适', value: 'B', score: { Z: 1, W: 0 } },
      { label: '精神平稳，无燥热或困重感', value: 'C', score: { Z: 0, W: 0 } },
      { label: '有些昏沉，精力不济，需小憩', value: 'D', score: { Z: 0, W: 1 } },
      { label: '困倦沉重，头如裹布，不想动', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q21',
    text: '出汗情况（日常活动后）？',
    dimension: 'Z/W',
    options: [
      { label: '很少出汗，运动1小时也少汗', value: 'A', score: { Z: 2, W: 0 } },
      { label: '出汗不多，正常活动后微微出汗', value: 'B', score: { Z: 1, W: 0 } },
      { label: '出汗量适中，活动后微汗', value: 'C', score: { Z: 0, W: 0 } },
      { label: '易出汗，汗稍黏，贴身衣物易潮', value: 'D', score: { Z: 0, W: 1 } },
      { label: '大汗淋漓，汗黏有味，需及时换衣', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'Q22',
    text: '潮湿天气（如回南天、梅雨季）的感受？',
    dimension: 'Z/W',
    options: [
      { label: '皮肤舒服些，喜欢湿润环境', value: 'A', score: { Z: 2, W: 0 } },
      { label: '无明显感觉，适应良好', value: 'B', score: { Z: 1, W: 0 } },
      { label: '适应良好，无舒服或不适感', value: 'C', score: { Z: 0, W: 0 } },
      { label: '有些不爽，略感身体沉重', value: 'D', score: { Z: 0, W: 1 } },
      { label: '非常难受，困倦乏力，关节酸痛', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  // 维度四：气血运行 (K/M)
  {
    id: 'Q23',
    text: '身体疼痛的特点（每月≥1次）？',
    dimension: 'K/M',
    options: [
      { label: '固定位置刺痛/胀痛，按压后加重', value: 'A', score: { K: 2, M: 0 } },
      { label: '疼痛位置较固定，休息后缓解', value: 'B', score: { K: 1, M: 0 } },
      { label: '无明显疼痛，或偶尔轻微酸痛', value: 'C', score: { K: 0, M: 0 } },
      { label: '游走性酸痛，位置不定', value: 'D', score: { K: 0, M: 1 } },
      { label: '全身性酸痛或敏感痛，触碰后不适', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'Q24',
    text: '情绪压抑时（每周≥2次）的身体感受？',
    dimension: 'K/M',
    options: [
      { label: '胸闷胁胀，像有石头堵着', value: 'A', score: { K: 2, M: 0 } },
      { label: '有些闷，叹气后缓解', value: 'B', score: { K: 1, M: 0 } },
      { label: '情绪压抑但无明显身体不适', value: 'C', score: { K: 0, M: 0 } },
      { label: '心烦不安，静不下来', value: 'D', score: { K: 0, M: 1 } },
      { label: '心慌手抖，坐立难安', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'Q25',
    text: '睡眠的主要问题（每周≥3天）？',
    dimension: 'K/M',
    options: [
      { label: '入睡难，思绪纷扰，30分钟以上才能睡', value: 'A', score: { K: 2, M: 0 } },
      { label: '需要较长时间（15-30分钟）入睡', value: 'B', score: { K: 1, M: 0 } },
      { label: '入睡顺利（10分钟内），睡眠深', value: 'C', score: { K: 0, M: 0 } },
      { label: '睡眠浅，易惊醒，醒后需5分钟内再睡', value: 'D', score: { K: 0, M: 1 } },
      { label: '多梦纷纭，醒后疲乏', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'Q26',
    text: '对外界刺激（噪音、强光、异味）的反应？',
    dimension: 'K/M',
    options: [
      { label: '迟钝，但不适感持久（超过1小时）', value: 'A', score: { K: 2, M: 0 } },
      { label: '适应尚可，反应平缓', value: 'B', score: { K: 1, M: 0 } },
      { label: '对刺激不敏感也不过敏', value: 'C', score: { K: 0, M: 0 } },
      { label: '较敏感，不适来得快，持续30分钟内', value: 'D', score: { K: 0, M: 1 } },
      { label: '非常敏感，反应剧烈，需立即远离', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'Q27',
    text: '皮肤容易出现的状况？',
    dimension: 'K/M',
    options: [
      { label: '固定位置长痘/色斑，长期不消退', value: 'A', score: { K: 2, M: 0 } },
      { label: '特定部位易有问题（如额头、下巴长痘）', value: 'B', score: { K: 1, M: 0 } },
      { label: '皮肤状态稳定，无频繁长痘或过敏', value: 'C', score: { K: 0, M: 0 } },
      { label: '易泛红，换季敏感，遇刺激后发红', value: 'D', score: { K: 0, M: 1 } },
      { label: '易过敏起疹，反复发作，瘙痒明显', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'Q28',
    text: '压力大时（每周≥2次）身体反应倾向？',
    dimension: 'K/M',
    options: [
      { label: '固定部位胀痛（如胃/头），持续2小时以上', value: 'A', score: { K: 2, M: 0 } },
      { label: '某部位不适感较固定，1小时内缓解', value: 'B', score: { K: 1, M: 0 } },
      { label: '压力大但无明显身体不适', value: 'C', score: { K: 0, M: 0 } },
      { label: '全身肌肉紧张酸痛，按摩后减轻', value: 'D', score: { K: 0, M: 1 } },
      { label: '心慌腹泻或皮肤起疹，压力缓解后消失', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
];

export const GOLDEN_QUESTIONS: Question[] = [
  // 维度一 Golden Question
  {
    id: 'GQ1_1',
    text: '基础体温倾向（晨起未活动时，连续1周监测）：',
    dimension: 'Y/A',
    isGolden: true,
    triggerCondition: { dimension: 'Y/A', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '常低于 36.3℃', value: 'A', score: { Y: 2, A: 0 } },
      { label: '约 36.3-36.5℃', value: 'B', score: { Y: 1, A: 0 } },
      { label: '约 36.5-36.7℃', value: 'C', score: { Y: 0, A: 0 } },
      { label: '约 36.7-36.9℃', value: 'D', score: { Y: 0, A: 1 } },
      { label: '常高于 36.9℃', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  {
    id: 'GQ1_2',
    text: '对寒凉食物（冰饮、生鱼片、凉拌菜）的耐受度：',
    dimension: 'Y/A',
    isGolden: true,
    triggerCondition: { dimension: 'Y/A', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '完全不耐受，食用后必腹痛腹泻', value: 'A', score: { Y: 2, A: 0 } },
      { label: '耐受度低，偶尔食用无明显不适', value: 'B', score: { Y: 1, A: 0 } },
      { label: '适量食用无不适，过量可能轻微腹胀', value: 'C', score: { Y: 0, A: 0 } },
      { label: '耐受度中等，适量食用无问题', value: 'D', score: { Y: 0, A: 1 } },
      { label: '耐受度高，经常食用无不适', value: 'E', score: { Y: 0, A: 2 } },
    ],
  },
  // 维度二 Golden Question
  {
    id: 'GQ2_1',
    text: '腹部按压感（空腹状态）：',
    dimension: 'X/S',
    isGolden: true,
    triggerCondition: { dimension: 'X/S', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '腹部柔软，喜按，按后舒服', value: 'A', score: { X: 2, S: 0 } },
      { label: '腹部偏软，无抵抗，按压无不适', value: 'B', score: { X: 1, S: 0 } },
      { label: '腹部软硬适中，按压无喜恶感', value: 'C', score: { X: 0, S: 0 } },
      { label: '腹部有些弹力，轻微抵抗，按压无明显不适', value: 'D', score: { X: 0, S: 1 } },
      { label: '腹部硬满，拒按，按压后胀痛不适', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  {
    id: 'GQ2_2',
    text: '舌象特征（晨起空腹）：',
    dimension: 'X/S',
    isGolden: true,
    triggerCondition: { dimension: 'X/S', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '舌头颜色偏淡，舌苔薄而白', value: 'A', score: { X: 2, S: 0 } },
      { label: '舌头颜色淡红，舌苔薄，无异味', value: 'B', score: { X: 1, S: 0 } },
      { label: '舌头颜色淡红，舌苔薄白，无异味，大小适中', value: 'C', score: { X: 0, S: 0 } },
      { label: '舌头颜色偏红，舌苔黏腻，有轻微异味', value: 'D', score: { X: 0, S: 1 } },
      { label: '舌头颜色暗红，舌苔厚腻，异味明显', value: 'E', score: { X: 0, S: 2 } },
    ],
  },
  // 维度三 Golden Question
  {
    id: 'GQ3_1',
    text: '嘴唇状态（日常无涂唇膏）：',
    dimension: 'Z/W',
    isGolden: true,
    triggerCondition: { dimension: 'Z/W', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '干裂起皮，需频繁涂唇膏，每周≥3次脱皮', value: 'A', score: { Z: 2, W: 0 } },
      { label: '偏干，偶尔起皮，每月1-2次', value: 'B', score: { Z: 1, W: 0 } },
      { label: '嘴唇湿润饱满，无脱皮或肿胀，颜色自然', value: 'C', score: { Z: 0, W: 0 } },
      { label: '湿润但有时微肿，无脱皮', value: 'D', score: { Z: 0, W: 1 } },
      { label: '肿胀，唇周易长痘，有黏腻感', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  {
    id: 'GQ3_2',
    text: '晨起面部状态（无护肤化妆）：',
    dimension: 'Z/W',
    isGolden: true,
    triggerCondition: { dimension: 'Z/W', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '紧绷干燥，细纹明显，需立即补水', value: 'A', score: { Z: 2, W: 0 } },
      { label: '稍干，轻微紧绷，涂保湿品后缓解', value: 'B', score: { Z: 1, W: 0 } },
      { label: '面部水润有光泽，无干燥或油光，手感清爽', value: 'C', score: { Z: 0, W: 0 } },
      { label: '微油，略有浮肿，洗脸后清爽', value: 'D', score: { Z: 0, W: 1 } },
      { label: '油光满面，眼睑浮肿，毛孔堵塞感', value: 'E', score: { Z: 0, W: 2 } },
    ],
  },
  // 维度四 Golden Question
  {
    id: 'GQ4_1',
    text: '按压肋下反应（两侧肋骨下方）：',
    dimension: 'K/M',
    isGolden: true,
    triggerCondition: { dimension: 'K/M', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '明显胀痛或硬结，按压后持续不适', value: 'A', score: { K: 2, M: 0 } },
      { label: '轻微胀感，按压后迅速缓解', value: 'B', score: { K: 1, M: 0 } },
      { label: '按压无胀痛，无不适也无特殊感觉', value: 'C', score: { K: 0, M: 0 } },
      { label: '无胀痛但按压后心慌，持续1分钟内', value: 'D', score: { K: 0, M: 1 } },
      { label: '未按压即感紧张，按压后不安加剧', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
  {
    id: 'GQ4_2',
    text: '对咖啡因（咖啡、浓茶）的反应（下午3点后饮用）：',
    dimension: 'K/M',
    isGolden: true,
    triggerCondition: { dimension: 'K/M', minDiff: 1, maxDiff: 2 },
    options: [
      { label: '几乎无感觉，或更觉胀闷', value: 'A', score: { K: 2, M: 0 } },
      { label: '无明显影响，不影响睡眠', value: 'B', score: { K: 1, M: 0 } },
      { label: '有轻微兴奋感，不影响入睡时间', value: 'C', score: { K: 0, M: 0 } },
      { label: '有些兴奋，可能延迟入睡30分钟', value: 'D', score: { K: 0, M: 1 } },
      { label: '心慌失眠，明显不适，整夜难眠', value: 'E', score: { K: 0, M: 2 } },
    ],
  },
];

export const HABITS = [
  { value: 'sedentary', label: '久坐（每日坐着超过6小时）', tcmFocus: ['脾', '肉'], advice: '久坐伤肉，易致脾虚湿盛。建议每45分钟起身活动，多做拉伸。', warning: '注意腹部保暖，少吃生冷。' },
  { value: 'screen_time', label: '久视（每日看屏幕超过6小时）', tcmFocus: ['肝', '血'], advice: '久视伤血，易致肝血不足。建议多眺望远方，补充枸杞菊花茶。', warning: '注意眼部休息，避免熬夜。' },
  { value: 'standing', label: '久立（每日站立超过4小时）', tcmFocus: ['肾', '骨'], advice: '久立伤骨，易耗肾气。建议休息时抬高腿部，泡脚养肾。', warning: '注意腰腿保暖，避免负重。' },
  { value: 'speaking', label: '多言（每日说话超过4小时）', tcmFocus: ['肺', '气'], advice: '多言耗气，易致肺气虚。建议少说话，多喝罗汉果茶。', warning: '注意保护嗓子，避免受寒。' },
  { value: 'irregular_sleep', label: '熬夜/作息不规律', tcmFocus: ['肝', '肾', '阴'], advice: '熬夜耗伤阴血，易致肝肾阴虚。建议午间小憩，尽量早睡。', warning: '避免过度劳累，多吃滋阴之品。' },
  { value: 'stress', label: '精神压力大/思虑多', tcmFocus: ['心', '脾', '肝'], advice: '思虑伤脾，压力伤肝。建议多做深呼吸，听音乐放松。', warning: '保持心情舒畅，避免抑郁。' },
  { value: 'irregular_diet', label: '饮食不规律/重口味', tcmFocus: ['脾', '胃'], advice: '饮食不节伤脾胃。建议规律饮食，清淡为主。', warning: '少吃辛辣油腻，多吃养胃食物。' },
];
