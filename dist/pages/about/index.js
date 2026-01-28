"use strict";(wx["webpackJsonp"]=wx["webpackJsonp"]||[]).push([[422],{8282:function(e,s,n){var c=n(3897),t=n(758),i=n(5490),a=n(1093),o=n.n(a),r=n(6070);

function AboutPage(){
  (0,t.useEffect)(function(){
    console.log("[About] 关于体系页面已加载");
  },[]);

  var handleStartAssessment=function(){
    o().navigateTo({
      url:"/pages/user-info/index",
      success:function(){
        console.log("跳转到体质测评页面成功");
      },
      fail:function(e){
        console.error("页面跳转失败:",e);
        o().showToast({title:"跳转失败",icon:"none"});
      }
    });
  };

  // 四维体系数据
  var dimensions=[
    {name:"寒热",pair:"寒 ↔ 热",desc:"体温倾向"},
    {name:"虚实",pair:"虚 ↔ 实",desc:"正邪状态"},
    {name:"燥湿",pair:"燥 ↔ 湿",desc:"津液代谢"},
    {name:"气血",pair:"气滞 ↔ 血瘀",desc:"运行状态"}
  ];

  // 9种体质
  var constitutions=[
    "平和质","气虚质","阳虚质","阴虚质",
    "痰湿质","湿热质","血瘀质","气郁质",
    "特禀质"
  ];

  // 核心特色
  var features=[
    {icon:"1",title:"四维二元辨识",desc:"采用寒热、虚实、燥湿、气血四个核心维度进行精准辨识"},
    {icon:"2",title:"9种基础体质",desc:"基于中医体质学说，识别9种基础体质类型，精准描述个体健康状态"},
    {icon:"3",title:"五级梯度判定",desc:"每个维度采用五级梯度评分，从轻微到明显，量化体质偏颇程度"},
    {icon:"4",title:"AI智能调理",desc:"结合人工智能技术，根据体质特点生成个性化的饮食、运动、起居调理方案"}
  ];

  return (0,r.jsx)(i.BM,{className:"about-page",scrollY:true,children:(0,r.jsxs)(i.Ss,{className:"about-container",children:[
    // 头部区域
    (0,r.jsxs)(i.Ss,{className:"header-section",children:[
      (0,r.jsxs)(i.EY,{className:"main-title",children:[
        "TCM-BTI"," ",
        (0,r.jsx)(i.EY,{className:"accent-text",children:"体系介绍"})
      ]}),
      (0,r.jsx)(i.EY,{className:"sub-title",children:"重构中医体质理论的数字化健康解决方案"})
    ]}),

    // 什么是 TCM-BTI
    (0,r.jsxs)(i.Ss,{className:"section-card",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"什么是 TCM-BTI？"}),
      (0,r.jsx)(i.EY,{className:"section-content",children:"TCM-BTI（Traditional Chinese Medicine Body Type Identification）是一套创新的中医体质辨识系统。它将传统中医理论与现代数字技术相结合，通过四维二元辨识体系，帮助用户精准了解自身体质特点，获得个性化的健康调理建议。"}),
      (0,r.jsxs)(i.Ss,{className:"quote-box",children:[
        (0,r.jsx)(i.EY,{className:"quote-text",children:"\"探寻身体的山水画卷，解码您的体质语言\""})
      ]})
    ]}),

    // 四维辨识体系
    (0,r.jsxs)(i.Ss,{className:"section-card",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"四维辨识体系"}),
      (0,r.jsx)(i.EY,{className:"section-content",children:"TCM-BTI 采用四个核心维度对体质进行全面评估，每个维度都是一组二元对立的特性："}),
      (0,r.jsx)(i.Ss,{className:"dimension-grid",style:{marginTop:"24rpx"},children:
        dimensions.map(function(d,idx){
          return (0,r.jsxs)(i.Ss,{className:"dimension-item",key:idx,children:[
            (0,r.jsx)(i.EY,{className:"dimension-name",children:d.name}),
            (0,r.jsx)(i.EY,{className:"dimension-pair",children:d.pair}),
            (0,r.jsx)(i.EY,{className:"dimension-desc",children:d.desc})
          ]});
        })
      })
    ]}),

    // 核心特色
    (0,r.jsxs)(i.Ss,{className:"section-card",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"核心特色"}),
      (0,r.jsx)(i.Ss,{className:"feature-list",children:
        features.map(function(f,idx){
          return (0,r.jsxs)(i.Ss,{className:"feature-item",key:idx,children:[
            (0,r.jsx)(i.Ss,{className:"feature-icon",children:
              (0,r.jsx)(i.EY,{className:"feature-icon-text",children:f.icon})
            }),
            (0,r.jsxs)(i.Ss,{className:"feature-content",children:[
              (0,r.jsx)(i.EY,{className:"feature-title",children:f.title}),
              (0,r.jsx)(i.EY,{className:"feature-desc",children:f.desc})
            ]})
          ]});
        })
      })
    ]}),

    // 9种体质
    (0,r.jsxs)(i.Ss,{className:"section-card constitution-section",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"9种基础体质"}),
      (0,r.jsx)(i.EY,{className:"section-content",children:"基于四维辨识体系，TCM-BTI 可识别出9种基础体质类型："}),
      (0,r.jsx)(i.Ss,{className:"constitution-grid",style:{marginTop:"24rpx"},children:
        constitutions.map(function(c,idx){
          return (0,r.jsx)(i.Ss,{className:"constitution-item",key:idx,children:
            (0,r.jsx)(i.EY,{className:"constitution-name",children:c})
          });
        })
      })
    ]}),

    // 科学依据
    (0,r.jsxs)(i.Ss,{className:"section-card",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"科学依据"}),
      (0,r.jsx)(i.EY,{className:"section-content",children:"TCM-BTI 体系参考了中华中医药学会发布的《中医体质分类与判定》（ZYYXH/T157-2009）标准，并在此基础上进行创新和拓展，形成更加精细化的四维辨识模型。"}),
      (0,r.jsxs)(i.Ss,{className:"standard-info",children:[
        (0,r.jsx)(i.EY,{className:"standard-title",children:"参考标准"}),
        (0,r.jsx)(i.EY,{className:"standard-desc",children:"《中医体质分类与判定》ZYYXH/T157-2009 是由中华中医药学会发布的官方标准，用于规范中医体质的分类和判定方法。"})
      ]})
    ]}),

    // 使用说明
    (0,r.jsxs)(i.Ss,{className:"section-card",children:[
      (0,r.jsx)(i.EY,{className:"section-title",children:"使用说明"}),
      (0,r.jsx)(i.EY,{className:"section-content",children:"体质测评问卷基于近几个月的身体状态进行评估，建议在安静、放松的状态下完成测评。测评结果仅供健康参考，如有健康问题请及时就医。"})
    ]}),

    // 行动按钮
    (0,r.jsx)(i.Ss,{className:"action-section",children:
      (0,r.jsx)(i.$n,{className:"start-button",onClick:handleStartAssessment,type:"primary",children:"开始体质测评"})
    }),

    // 底部信息
    (0,r.jsxs)(i.Ss,{className:"footer-section",children:[
      (0,r.jsx)(i.EY,{className:"footer-text",children:"TCM-BTI 中医体质评估系统"}),
      (0,r.jsx)(i.EY,{className:"footer-text",children:"探寻身体的山水画卷，解码您的体质语言"}),
      (0,r.jsxs)(i.EY,{className:"footer-text",style:{marginTop:"20rpx"},children:[
        "了解更多：",
        (0,r.jsx)(i.EY,{className:"footer-link",children:"zhongyiti.com"})
      ]})
    ]})
  ]})});
}

var d={navigationBarTitleText:"关于 TCM-BTI 体系"};
Page((0,c.createPageConfig)(AboutPage,"pages/about/index",{root:{cn:[]}},d||{}));
}},function(e){var s=function(s){return e(e.s=s)};e.O(0,[907,96],function(){return s(8282)});e.O()}]);
