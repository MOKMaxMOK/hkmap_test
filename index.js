import modern from './modern.json';
import heritage from './heritage.json';
import nightlife from './nightlife.json';
import indoor from './indoor.json';
import landmark from './landmark.json';
import film from './film.json';
import themepark from './themepark.json';
// 🔥 新增這兩行
import outdoor from './outdoor.json';
import game from './game.json';

export default [
    ...modern,
    ...heritage,
    ...nightlife,
    ...indoor,
    ...landmark,
    ...film,
    ...themepark,
    ...outdoor,
    ...game
];
