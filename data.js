// ==========================================
// 1. 靜態資料設定 (Data)
// ==========================================
const i18n = {
    map: { 'zh-HK': '地圖', 'zh-CN': '地图', en: 'Map' },
    list: { 'zh-HK': '列表', 'zh-CN': '列表', en: 'List' },
    type: { 'zh-HK': '類型', 'zh-CN': '类型', en: 'Type' },
    region: { 'zh-HK': '地區', 'zh-CN': '地区', en: 'Region' },
    all: { 'zh-HK': '全選', 'zh-CN': '全选', en: 'All' },
    none: { 'zh-HK': '清空', 'zh-CN': '清空', en: 'None' },
    quickSelect: { 'zh-HK': '大區快捷', 'zh-CN': '大区快捷', en: 'Quick Select' },
    selectLang: { 'zh-HK': '選擇語言', 'zh-CN': '选择语言', en: 'Language' },
    google: { 'zh-HK': 'Google 地圖', 'zh-CN': 'Google 地图', en: 'Google Maps' },
    amap: { 'zh-HK': '高德地圖', 'zh-CN': '高德地图', en: 'Amap' },
    aboutSiteTitle: { 'zh-HK': '關於網站', 'zh-CN': '关于网站', en: 'About Website' },
    siteIntro: { 'zh-HK': '本網站旨在為旅客提供最全面的香港旅遊指南。', 'zh-CN': '本网站旨在为旅客提供最全面的香港旅游指南。', en: 'Comprehensive Hong Kong travel guide.' },
    changelog: { 'zh-HK': '更新日誌', 'zh-CN': '更新日志', en: 'Changelog' },
    contactTitle: { 'zh-HK': '聯絡我們', 'zh-CN': '联系我们', en: 'Contact Us' },
    teamIntro: { 'zh-HK': '我們團隊由幾個人類組成，歡迎聯絡！', 'zh-CN': '我们团队由几个人类组成，欢迎联系！', en: 'Our team is made up of a few humans.' },
    techSupport: { 'zh-HK': '技術支持', 'zh-CN': '技术支持', en: 'Tech Support' },
    techDesc: { 'zh-HK': '發現Bug或有建議？', 'zh-CN': '发现Bug或有建议？', en: 'Found a bug?' },
    bizInquiry: { 'zh-HK': '商業聯絡', 'zh-CN': '商业联络', en: 'Business' },
    bizDesc: { 'zh-HK': '合作提案或廣告投放。', 'zh-CN': '合作提案或广告投放。', en: 'Partnerships & Ads.' },
    sendEmail: { 'zh-HK': '發送郵件', 'zh-CN': '发送邮件', en: 'Send Email' },
    subjectTech: { 'zh-HK': '技術支持與反饋', 'zh-CN': '技术支持与反馈', en: 'Tech Support' },
    subjectBiz: { 'zh-HK': '商業合作諮詢', 'zh-CN': '商业合作咨询', en: 'Business Inquiry' }
};

const versions = [
    { id: 'v1.1.0', date: '2030-02-10', updates: [{ 'zh-HK': '初始版本', 'zh-CN': '初始版本', en: 'Initial Version' }] },
    {
        id: 'v1.1.1', date: '', updates: [
            { 'zh-HK': '新增 AI 行程規劃功能', 'zh-CN': '新增 AI 行程规划功能', en: 'Added AI Trip Planner' },
            { 'zh-HK': '新增行程儲存功能', 'zh-CN': '新增行程保存功能', en: 'Added Trip Saving' },
            { 'zh-HK': '新增景點評分功能', 'zh-CN': '新增景点评分功能', en: 'Added Attraction Ratings' },
            { 'zh-HK': '新增景點收藏功能', 'zh-CN': '新增景点收藏功能', en: 'Added Attraction Bookmarking' },
            { 'zh-HK': '新增景點圖片上傳功能', 'zh-CN': '新增景点图片上传功能', en: 'Added Photo Uploads' },
            { 'zh-HK': '新增景點投稿功能', 'zh-CN': '新增景点投稿功能', en: 'Added New Attraction Submission' }
        ]
    }
];

const files = [
    { id: 'film', file: 'attraction/film.json', color: '#FF6D00', label: { 'zh-HK': '影視取景', 'zh-CN': '影视取景', en: 'Film' } },
    { id: 'landmark', file: 'attraction/landmark.json', color: '#0F9D58', label: { 'zh-HK': '地標建築', 'zh-CN': '地标建筑', en: 'Landmark' } },
    { id: 'nightlife', file: 'attraction/nightlife.json', color: '#673AB7', label: { 'zh-HK': '夜生活', 'zh-CN': '夜生活', en: 'Nightlife' } },
    { id: 'modern', file: 'attraction/modern.json', color: '#4285F4', label: { 'zh-HK': '現代景觀', 'zh-CN': '现代景观', en: 'Modern' } },
    { id: 'heritage', file: 'attraction/heritage.json', color: '#DB4437', label: { 'zh-HK': '歷史文化', 'zh-CN': '历史文化', en: 'Heritage' } },
    { id: 'indoor', file: 'attraction/indoor.json', color: '#F4B400', label: { 'zh-HK': '室內娛樂', 'zh-CN': '室内娱乐', en: 'Indoor' } },
    { id: 'outdoor', file: 'attraction/outdoor.json', color: '#795548', label: { 'zh-HK': '自然郊遊', 'zh-CN': '自然郊游', en: 'Outdoor' } },
    { id: 'themepark', file: 'attraction/themepark.json', color: '#E91E63', label: { 'zh-HK': '主題樂園', 'zh-CN': '主题乐园', en: 'Theme Park' } },
    { id: 'game', file: 'attraction/game.json', color: '#00BCD4', label: { 'zh-HK': '運動競技', 'zh-CN': '运动竞技', en: 'Sports' } }
];

const regions = [
    { id: 'central-and-western', m: 'hk', n: { 'zh-HK': '中西區', 'zh-CN': '中西区', en: 'Central & Western' } },
    { id: 'eastern', m: 'hk', n: { 'zh-HK': '東區', 'zh-CN': '东区', en: 'Eastern' } },
    { id: 'southern', m: 'hk', n: { 'zh-HK': '南區', 'zh-CN': '南区', en: 'Southern' } },
    { id: 'wan-chai', m: 'hk', n: { 'zh-HK': '灣仔', 'zh-CN': '湾仔', en: 'Wan Chai' } },
    { id: 'kowloon-city', m: 'kln', n: { 'zh-HK': '九龍城', 'zh-CN': '九龙城', en: 'Kowloon City' } },
    { id: 'kwun-tong', m: 'kln', n: { 'zh-HK': '觀塘', 'zh-CN': '观塘', en: 'Kwun Tong' } },
    { id: 'sham-shui-po', m: 'kln', n: { 'zh-HK': '深水埗', 'zh-CN': '深水埗', en: 'Sham Shui Po' } },
    { id: 'wong-tai-sin', m: 'kln', n: { 'zh-HK': '黃大仙', 'zh-CN': '黄大仙', en: 'Wong Tai Sin' } },
    { id: 'yau-tsim-mong', m: 'kln', n: { 'zh-HK': '油尖旺', 'zh-CN': '油尖旺', en: 'Yau Tsim Mong' } },
    { id: 'islands', m: 'isl', n: { 'zh-HK': '離島', 'zh-CN': '离岛', en: 'Islands' } },
    { id: 'kwai-tsing', m: 'nt', n: { 'zh-HK': '葵青', 'zh-CN': '葵青', en: 'Kwai Tsing' } },
    { id: 'north', m: 'nt', n: { 'zh-HK': '北區', 'zh-CN': '北区', en: 'North' } },
    { id: 'sha-tin', m: 'nt', n: { 'zh-HK': '沙田', 'zh-CN': '沙田', en: 'Sha Tin' } },
    { id: 'tai-po', m: 'nt', n: { 'zh-HK': '大埔', 'zh-CN': '大埔', en: 'Tai Po' } },
    { id: 'tsuen-wan', m: 'nt', n: { 'zh-HK': '荃灣', 'zh-CN': '荃湾', en: 'Tsuen Wan' } },
    { id: 'tuen-mun', m: 'nt', n: { 'zh-HK': '屯門', 'zh-CN': '屯门', en: 'Tuen Mun' } },
    { id: 'yuen-long', m: 'nt', n: { 'zh-HK': '元朗', 'zh-CN': '元朗', en: 'Yuen Long' } },
    { id: 'sai-kung', m: 'nt', n: { 'zh-HK': '西貢', 'zh-CN': '西贡', en: 'Sai Kung' } }
];

const macros = [
    { id: 'hk', n: { 'zh-HK': '港島', 'zh-CN': '港岛', en: 'HK Island' } },
    { id: 'kln', n: { 'zh-HK': '九龍', 'zh-CN': '九龙', en: 'Kowloon' } },
    { id: 'nt', n: { 'zh-HK': '新界', 'zh-CN': '新界', en: 'New Territories' } },
    { id: 'isl', n: { 'zh-HK': '離島', 'zh-CN': '离岛', en: 'Islands' } }
];

const hkBounds = [[113.76, 22.13], [114.50, 22.57]];
const extendedBounds = [[113.70, 22.10], [114.60, 22.65]];

const IMAGE_BASE = 'images/';
const MAX_AUTO_IMAGES = 3;
const IMAGE_EXT = '.jpg';
let popupLoadToken = 0;
