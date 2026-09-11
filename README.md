# hkmap_test
This is a Hong Kong travel map platform that aggregates popular Hong Kong tourism offerings found online, including attractions, entertainment, and more.
Locations are displayed on the map using markers.
<img width="2880" height="1462" alt="image" src="https://github.com/user-attachments/assets/d6fb1d21-9707-4a0c-8c70-cc8aac760ad4" />

You can filter results by region and category.
<img width="2880" height="1446" alt="image" src="https://github.com/user-attachments/assets/1dc14cfc-5afe-4d67-9931-999392ef3690" />
<img width="2880" height="1460" alt="image" src="https://github.com/user-attachments/assets/50c06677-a808-4a7c-b53b-3ed8e3e88fec" />

The language selection can apply globally.
<img width="2880" height="1460" alt="image" src="https://github.com/user-attachments/assets/44355036-810b-4d0e-a906-56187595e9eb" />


Clicking a marker opens a information card （The information card will automatically center itself.） 
and allows you to navigate to Google Maps or Amap (高德地圖).
<img width="2870" height="1448" alt="image" src="https://github.com/user-attachments/assets/95b6e59a-6fcc-42cc-bef4-6bbd6c492f5f" />

All images are either taken by the author or sourced from locations where usage is explicitly authorized.
Images are missing for some attractions; users can add them manually as follows:
Image storage path:
\images

Then, locate the JSON file corresponding to the attraction's category within the \attraction folder and update the "images" field:
"images": ["insert image path here"]

To add a new attraction, 
You can add it to the JSON using the following example：
{
        "id": "spot_001",  //id number, definded by you
        "category": "indoor",  plz followed by json file name
        "region": "yau-tsim-mong", //region name
        "lat": 22.3010111,     
        "lng": 114.177655,
        // lat and lng ,if you dont know how to get it, you can refer my github project:https://github.com/MOKMaxMOK/Batch_obtain_lat-lng
        
        "name": {
            "zh-HK": "香港科學館",  //traditional chinese name
            "zh-CN": "香港科学馆",   //simply chinese name
            "en": "Hong Kong Science Museum"  //english name
        },
        "description": {
            "zh-HK": "互動展品多，偏「玩住學」型娛樂。",   //traditional chinese description
            "zh-CN": "互动展品多，偏“玩中学”型娱乐。",     //simply chinese description
            "en": "Features many interactive exhibits, focusing on 'edutainment' where learning meets fun."    //english description
        },
        "images": [
            "Hong Kong Science Museum.jpg",    image 1  path
            "Hong Kong Science Museum.jpg(2)",  image 2 path
            "Hong Kong Science Museum.jpg(3)"   image 3  path
        ]
    },

In addition to map mode, you can also view the information in list mode.
<img width="2860" height="1448" alt="image" src="https://github.com/user-attachments/assets/a6984c97-ae0d-4646-af7e-c4c6a5c3cb80" />


<img width="2880" height="1458" alt="image" src="https://github.com/user-attachments/assets/ca9c997b-b8f3-4553-a220-800ebbf49289" />

You can add team information and contact details, and use one-click shortcuts to open Gmail with pre-filled message content.
<img width="2876" height="1448" alt="image" src="https://github.com/user-attachments/assets/9657cc16-8e60-410e-a0ba-702c2cfd513b" />

Website Changelog
<img width="2872" height="1334" alt="image" src="https://github.com/user-attachments/assets/8bd10f50-0678-49c0-942e-0c21902a1147" />

