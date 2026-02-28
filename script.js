

// ==========================================
// 2. 工具函數 (Utils)
// ==========================================
function resolveImageUrl(img) {
    if (!img) return '';
    if (/^(https?:)?\/\//i.test(img) || img.startsWith('data:')) return img;
    return encodeURI(IMAGE_BASE + img);
}

function sanitizeFileBase(s) {
    return (s || '').replace(/[\\/:*?"<>|]/g, '').trim();
}

function buildAutoImageUrlsByEnName(enName) {
    const base = sanitizeFileBase(enName);
    if (!base) return [];
    const urls = [resolveImageUrl(base + IMAGE_EXT)];
    for (let i = 2; i <= MAX_AUTO_IMAGES; i++) {
        urls.push(resolveImageUrl(`${base}(${i})${IMAGE_EXT}`));
    }
    return urls;
}

function hydratePopupImages(spotData, token, isModal = false) {
    const container = isModal ? document.getElementById('spot-detail-content') : activePopup?.getElement?.();
    if (!container) return;
    const strip = container.querySelector('.popup-img-strip');
    const spinner = container.querySelector('.spinner');
    if (!strip || !spinner) return;

    const urls = buildAutoImageUrlsByEnName(spotData?.name?.en || '');
    if (!urls.length) {
        spinner.style.display = 'none';
        return;
    }

    let loadedAny = false, idx = 0;
    const loadNext = () => {
        if (token !== popupLoadToken) return;
        if (idx >= urls.length) {
            if (!loadedAny) spinner.style.display = 'none';
            return;
        }
        const url = urls[idx++];
        const img = new Image();
        img.decoding = 'async';
        img.alt = spotData?.name?.en || '';
        img.onload = () => {
            if (token !== popupLoadToken) return;
            loadedAny = true;
            spinner.style.display = 'none';
            strip.appendChild(img);
            loadNext();
        };
        img.onerror = () => {
            if (token !== popupLoadToken) return;
            loadNext();
        };
        img.src = url;
    };
    loadNext();
}

function getBarBottom() {
    const bar = document.querySelector('.controls-bar');
    return bar ? Math.round(bar.getBoundingClientRect().bottom) : 50;
}

function isMobile() {
    return window.innerWidth < 768;
}

function getPin(c) {
    const x = document.createElement('canvas'); x.width = 64; x.height = 64;
    const z = x.getContext('2d');
    z.fillStyle = c;
    z.beginPath(); z.arc(32, 24, 20, 0, Math.PI * 2); z.fill();
    z.beginPath(); z.moveTo(12, 24); z.lineTo(32, 60); z.lineTo(52, 24); z.fill();
    z.fillStyle = 'white'; z.beginPath(); z.arc(32, 24, 8, 0, Math.PI * 2); z.fill();
    return x.toDataURL();
}


// ==========================================
// 3. 全域變數與初始化 (Main)
// ==========================================
let map, allData = [], filteredData = [], markers = [], curLang = 'zh-HK';
let selCats = files.map(f => f.id), selRegs = regions.map(r => r.id);
let lastCenter = null, lastZoom = null, activePopup = null, currentSpotData = null, hoverPopup = null;

let isLegendDocked = false;
let isLegendExpanded = true;
let preDockState = null;

try {
    const s = navigator.language.toLowerCase();
    curLang = s === 'zh-cn' || s === 'zh-sg' ? 'zh-CN' : s.startsWith('zh') ? 'zh-HK' : 'en';
} catch (e) { }

window.onload = async () => {
    initMap();
    await loadData();
    updateUI();
    makeDraggable(document.getElementById('legend-drag'));
};

function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        // 👇 就是這行，把你原本的貼回來
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [114.1694, 22.3193],
        zoom: 11,
        maxZoom: 22,
        maxBounds: hkBounds,
        attributionControl: false
    });
    

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
    map.on('click', () => closePopup());
    map.on('moveend', () => {
        if (!activePopup) {
            const b = map.getMaxBounds ? map.getMaxBounds() : null;
            if (b && b.getWest && b.getWest() < hkBounds[0][0]) map.setMaxBounds(hkBounds);
        }
    });
}

async function loadData() {
    const res = await Promise.all(files.map(f => fetch(f.file).then(r => r.json()).then(d => d.map(x => ({ ...x, cat: f.id }))).catch(() => [])));
    allData = res.flat();
    filterData();
}

function filterData() {
    filteredData = allData.filter(d => selCats.includes(d.cat) && selRegs.includes(d.region));
    renderMarkers();
    renderList();
}

function renderMarkers() {
    markers.forEach(m => m.remove());
    markers = [];

    filteredData.forEach(d => {
        const conf = files.find(f => f.id === d.cat);
        const el = document.createElement('div');
        el.style.cssText = `background-image:url(${getPin(conf.color)});width:42px;height:42px;background-size:contain;cursor:pointer;pointer-events:auto;`;
        let startX, startY, isDrag = false, clickTimer = null;

        el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; isDrag = false; }, { passive: true });
        el.addEventListener('touchmove', e => { if (Math.abs(e.touches[0].clientX - startX) > 5 || Math.abs(e.touches[0].clientY - startY) > 5) isDrag = true; }, { passive: true });

        el.addEventListener('mouseenter', () => {
            const name = d.name[curLang] || d.name.en;
            if (hoverPopup) hoverPopup.remove();
            hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: [0, -35], className: 'hover-popup-container' })
                .setLngLat([d.lng, d.lat])
                .setHTML(`<div class="hover-label">${name}</div>`)
                .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            if (hoverPopup) { hoverPopup.remove(); hoverPopup = null; }
        });

        const handleAction = (isDouble) => {
            if (!activePopup) { lastCenter = map.getCenter(); lastZoom = map.getZoom(); }
            const legend = document.getElementById('legend-drag');
            let offsetH = 150;
            if (isMobile() && isLegendExpanded && legend) {
                const barBottom = getBarBottom();
                offsetH = (barBottom + 80) / 2 + 120;
            }
            if (isDouble) {
                map.setMaxBounds(hkBounds);
                map.easeTo({ center: [d.lng, d.lat], zoom: 15, duration: 600 });
            } else {
                map.setMaxBounds(extendedBounds);
                map.easeTo({ center: [d.lng, d.lat], zoom: map.getZoom(), offset: [0, offsetH], duration: 500 });
            }
            showPopup(d, conf.color);
        };

        const clickHandler = e => {
            if (isDrag) return;
            e.stopPropagation();
            e.preventDefault();
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; handleAction(true); }
            else { clickTimer = setTimeout(() => { clickTimer = null; handleAction(false); }, 300); }
        };

        el.addEventListener('touchend', clickHandler);
        el.addEventListener('click', clickHandler);
        markers.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([d.lng, d.lat]).addTo(map));
    });
}


// ==========================================
// 4. UI 操作與介面更新 (UI Logic)
// ==========================================
window.switchView = function (mode) {
    closeModal();
    ['map', 'list-view', 'about-site-view', 'contact-view'].forEach(v => document.getElementById(v).style.display = 'none');
    document.querySelector('.legend-group').style.display = 'none';
    document.getElementById('btn-map').className = 'view-btn';
    document.getElementById('btn-list').className = 'view-btn';

    if (mode === 'map') {
        document.getElementById('map').style.display = 'block';
        document.querySelector('.legend-group').style.display = 'flex';
        document.getElementById('btn-map').className = 'view-btn active';
        map.resize();
    } else if (mode === 'list') {
        document.getElementById('list-view').style.display = 'block';
        document.getElementById('btn-list').className = 'view-btn active';
    } else if (mode === 'aboutSite') {
        document.getElementById('about-site-view').style.display = 'block';
    } else if (mode === 'contact') {
        document.getElementById('contact-view').style.display = 'block';
    }
}

function updateUI() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const k = el.getAttribute('data-t');
        if (i18n[k]) el.innerText = i18n[k][curLang];
    });
    renderLangList();
    renderCatList();
    renderRegionList();
    renderLegend();
    renderList();
    renderChangelog();
    document.getElementById('mail-tech').href = `mailto:hkgentech@gmail.com?subject=${encodeURIComponent(i18n.subjectTech[curLang])}`;
    document.getElementById('mail-biz').href = `mailto:hkgentech@gmail.com?subject=${encodeURIComponent(i18n.subjectBiz[curLang])}`;
}

function generateCardHTML(d, c, p) {
    const n = d.name[curLang] || d.name.en;
    const de = d.description[curLang] || '';
    const cn = files.find(f => f.id === d.cat).label[curLang];
    const q = encodeURIComponent(n + ' Hong Kong');
    const cb = p ? `<div class="close-popup-btn" onclick="closePopup()">✕</div>` : `<div class="close-popup-btn" onclick="closeModal()">✕</div>`;
    return `<div class="detail-card">
        <div class="popup-media">${cb}<div class="spinner"></div><div class="popup-img-strip"></div></div>
        <div class="popup-info">
            <div class="popup-title">${n}</div>
            <div class="popup-badges"><span class="tag" style="background:${c}">${cn}</span></div>
            <div class="popup-desc">${de}</div>
            <div class="popup-actions">
                <a class="action-btn" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank">${i18n.google[curLang]}</a>
                <a class="action-btn" href="https://www.amap.com/search?query=${q}" target="_blank">${i18n.amap[curLang]}</a>
            </div>
        </div>
    </div>`;
}

window.showPopup = function (d, c) {
    currentSpotData = { d, c, isPopup: true };
    if (activePopup) activePopup.remove();
    popupLoadToken++;
    const token = popupLoadToken;

    activePopup = new maplibregl.Popup({ closeButton: false, maxWidth: 'none', offset: [0, -40] })
        .setLngLat([d.lng, d.lat])
        .setHTML(generateCardHTML(d, c, true))
        .addTo(map);
    requestAnimationFrame(() => hydratePopupImages(d, token, false));

    const legend = document.getElementById('legend-drag');
    if (isMobile() && legend && isLegendExpanded) {
        if (!preDockState) {
            preDockState = {
                top: legend.style.top,
                left: legend.style.left,
                right: legend.style.right,
                hasClassExpandLeft: legend.classList.contains('expand-left')
            };
        }

        // 統一把 TOP_LIMIT 設為 2
        const TOP_LIMIT = 2;
        isLegendDocked = true;
        legend.classList.add('dock-top');
        legend.classList.remove('expand-left');
        legend.style.top = TOP_LIMIT + 'px';
        // ❗ 這裡不需要再寫 left/right，因為 css 裡面已經加了 !important
    }
}

window.showListModal = function (d) {
    currentSpotData = { d, c: files.find(f => f.id === d.cat).color, isPopup: false };
    popupLoadToken++;
    const token = popupLoadToken;
    document.getElementById('spot-detail-content').innerHTML = generateCardHTML(d, currentSpotData.c, false);
    openModal('spot-detail');
    requestAnimationFrame(() => hydratePopupImages(d, token, true));
}

window.closePopup = function () {
    currentSpotData = null; popupLoadToken++;
    if (activePopup) {
        activePopup.remove();
        activePopup = null;
        map.setMaxBounds(hkBounds);
        if (lastCenter) {
            map.easeTo({ center: lastCenter, zoom: lastZoom, offset: [0, 0], duration: 600 });
            lastCenter = null;
        }
    }

    const legend = document.getElementById('legend-drag');
    if (preDockState && legend && isLegendExpanded) {
        isLegendDocked = false;
        legend.classList.remove('dock-top');
        if (preDockState.hasClassExpandLeft) legend.classList.add('expand-left');
        else legend.classList.remove('expand-left');
        legend.style.top = preDockState.top;
        legend.style.left = preDockState.left;
        legend.style.right = preDockState.right;
        preDockState = null;
    }
}

window.toggleLegend = function (show) {
    const legend = document.getElementById('legend-drag');
    const card = document.getElementById('legend-card');
    const btn = document.getElementById('legend-btn');
    isLegendExpanded = show;
    if (show) {
        legend.classList.add('is-expanded');
        if (isLegendDocked) {
            legend.style.left = '8px'; legend.style.right = '8px';
        } else {
            const isRightSide = legend.offsetLeft > window.innerWidth / 2;
            if (isRightSide) {
                legend.classList.add('expand-left');
                legend.style.right = (window.innerWidth - legend.offsetLeft - legend.offsetWidth) + 'px';
                legend.style.left = 'auto';
            } else {
                legend.classList.remove('expand-left');
                legend.style.left = legend.offsetLeft + 'px';
                legend.style.right = 'auto';
            }
        }
    } else {
        legend.classList.remove('is-expanded');
        if (isLegendDocked) {
            legend.style.right = '8px'; legend.style.left = 'auto';
        } else if (legend.classList.contains('expand-left')) {
            const currentRight = parseFloat(legend.style.right) || 8;
            const calculatedLeft = window.innerWidth - currentRight - 40;
            legend.style.left = calculatedLeft + 'px'; legend.style.right = 'auto';
        }
    }
    card.style.display = show ? 'block' : 'none';
    btn.style.display = show ? 'none' : 'flex';
}

function renderLangList() {
    const l = document.getElementById('lang-list'); l.innerHTML = '';
    [{ c: 'zh-HK', n: '繁體中文' }, { c: 'zh-CN', n: '简体中文' }, { c: 'en', n: 'English' }].forEach(x => {
        const d = document.createElement('div'); d.className = `menu-row ${curLang === x.c ? 'checked' : ''}`;
        d.innerHTML = `<div class="row-left"><div class="checkbox"></div>${x.n}</div>`;
        d.onclick = () => {
            curLang = x.c;
            updateUI();
            if (currentSpotData) {
                if (currentSpotData.isPopup) showPopup(currentSpotData.d, currentSpotData.c);
                else showListModal(currentSpotData.d);
            }
            closeModal();
        };
        l.appendChild(d);
    });
}

function renderCatList() {
    const l = document.getElementById('cat-list'); l.innerHTML = '';
    files.forEach(f => {
        const d = document.createElement('div'); d.className = `menu-row ${selCats.includes(f.id) ? 'checked' : ''}`;
        d.innerHTML = `<div class="row-left"><div class="checkbox"></div><span>${f.label[curLang]}</span></div>`;
        d.onclick = () => {
            selCats.includes(f.id) ? selCats = selCats.filter(x => x !== f.id) : selCats.push(f.id);
            filterData();
            updateUI();
        };
        l.appendChild(d);
    });
}

function renderRegionList() {
    const mc = document.getElementById('macro-list'); mc.innerHTML = '';
    macros.forEach(m => {
        const d = document.createElement('div'); d.className = 'macro-chip'; d.innerText = m.n[curLang];
        if (regions.filter(r => r.m === m.id).map(r => r.id).every(id => selRegs.includes(id))) d.classList.add('active');
        d.onclick = () => {
            const s = regions.filter(r => r.m === m.id).map(r => r.id);
            const a = s.every(x => selRegs.includes(x));
            selRegs = a ? selRegs.filter(x => !s.includes(x)) : [...new Set([...selRegs, ...s])];
            filterData(); updateUI();
        };
        mc.appendChild(d);
    });

    const rl = document.getElementById('region-list'); rl.innerHTML = '';
    regions.forEach(r => {
        const d = document.createElement('div'); d.className = `menu-row ${selRegs.includes(r.id) ? 'checked' : ''}`;
        d.innerHTML = `<div class="row-left"><div class="checkbox"></div><span>${r.n[curLang]}</span></div>`;
        d.onclick = () => {
            selRegs.includes(r.id) ? selRegs = selRegs.filter(x => x !== r.id) : selRegs.push(r.id);
            filterData(); updateUI();
        };
        rl.appendChild(d);
    });
}

function renderChangelog() {
    const c = document.getElementById('changelog-list'); c.innerHTML = '';
    versions.forEach((v, i) => {
        const ver = document.createElement('div'); ver.className = 'log-item';
        let updates = '';
        v.updates.forEach(u => updates += `<li>${u[curLang] || u.en}</li>`);
        ver.innerHTML = `<div class="version-badge" style="background:${i === 0 ? '#e3f2fd' : '#f5f5f5'};color:${i === 0 ? '#1976d2' : '#666'}">${v.id}</div><div class="log-content"><div class="log-date">${v.date}</div><ul>${updates}</ul></div>`;
        c.appendChild(ver);
    });
}

function renderList() {
    const con = document.getElementById('list-view'); con.innerHTML = '';
    filteredData.forEach(d => {
        const conf = files.find(f => f.id === d.cat), reg = regions.find(r => r.id === d.region);
        const card = document.createElement('div'); card.className = 'list-card';
        const imgUrl = buildAutoImageUrlsByEnName(d.name.en)[0] || '';
        card.onclick = () => showListModal(d);
        card.innerHTML = `<div class="list-img"><img src="${imgUrl}" onerror="this.style.display='none'" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"></div><div class="list-content"><div class="list-title">${d.name[curLang] || d.name.en}</div><div class="list-tags"><span class="tag" style="background:${conf.color}">${conf.label[curLang]}</span><span class="tag reg">${reg ? reg.n[curLang] : ''}</span></div><div class="list-desc">${d.description[curLang] || ''}</div></div>`;
        con.appendChild(card);
    });
}

function renderLegend() {
    const c = document.getElementById('legend-content'); c.innerHTML = '';
    files.forEach(f => {
        const d = document.createElement('div'); d.className = 'legend-item';
        d.innerHTML = `<div class="legend-dot" style="background:${f.color}"></div>${f.label[curLang]}`;
        c.appendChild(d);
    });
}

window.openModal = function (id) {
    document.getElementById('overlay').classList.add('show');
    document.querySelectorAll('.modal-card').forEach(e => e.classList.remove('show'));
    document.getElementById('modal-' + id).classList.add('show');
}

window.closeModal = function () {
    document.getElementById('overlay').classList.remove('show');
    document.querySelectorAll('.modal-card').forEach(e => e.classList.remove('show'));
};

window.toggleAll = function (t, v) {
    if (t === 'category') selCats = v ? files.map(f => f.id) : [];
    if (t === 'region') selRegs = v ? regions.map(r => r.id) : [];
    filterData(); updateUI();
}


// ==========================================
// 5. 圖例拖曳邏輯 (Drag Logic)
// ==========================================
function makeDraggable(el) {
    let isDragging = false, hasMoved = false, startX, startY, initialLeft, initialTop;
    const PADDING = 8;

    const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        // 如果移動距離超過 3px，才判定為正在拖曳
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
        }

        if (!hasMoved) return;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // ❗ 放寬吸頂判定範圍：距離頂部 20px 內都算想吸頂
        const TOP_LIMIT = 2;
        const DOCK_THRESH = TOP_LIMIT + 20;

        const cardRect = el.getBoundingClientRect();
        const halfWidth = cardRect.width / 2;
        const halfHeight = cardRect.height / 2;

        const maxTop = window.innerHeight - 50 - halfHeight;
        newTop = Math.max(TOP_LIMIT, Math.min(newTop, maxTop));

        const minLeft = -halfWidth + 20;
        const maxLeft = window.innerWidth - halfWidth - 20;
        newLeft = Math.min(Math.max(minLeft, newLeft), maxLeft);

        if (isLegendExpanded) {
            // ❗ 移除嚴格的左右邊界限制。只要拉到頂部 (<= DOCK_THRESH)，就判定為要吸頂
            const shouldDock = newTop <= DOCK_THRESH;

            if (shouldDock) {
                newTop = TOP_LIMIT;
                if (!isLegendDocked) {
                    isLegendDocked = true;
                    el.classList.add('dock-top');
                }
                el.style.top = newTop + 'px';
            } else {
                if (isLegendDocked) {
                    isLegendDocked = false;
                    el.classList.remove('dock-top');
                }
                el.style.left = newLeft + 'px';
                el.style.top = newTop + 'px';
                el.style.right = 'auto';
            }
        } else {
            // 如果是縮小成一個按鈕(非展開)的狀態，就不處理吸頂，單純跟隨滑鼠
            isLegendDocked = false;
            el.classList.remove('dock-top');
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
            el.style.right = 'auto';
        }
    };

    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');

        if (!hasMoved && e && e.target.id === 'legend-btn') {
            toggleLegend(true);
        } else if (!hasMoved && e && e.target.id === 'legend-close-btn') {
            toggleLegend(false);
        } else if (hasMoved) {
            preDockState = null;
            if (isLegendExpanded) {
                toggleLegend(true);
            }
        }
    };

    el.addEventListener('touchstart', e => {
        if (e.target.closest('.legend-card') || e.target.closest('.legend-btn')) {
            if (e.target.id !== 'legend-close-btn' && e.target.id !== 'legend-btn') {
                e.preventDefault();
            }
        }
        isDragging = true;
        hasMoved = false;
        el.classList.add('dragging');

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        // 修復：從橫向吸頂下拉時，為了避免寬度突變導致卡片跳位，
        // 強制把拖曳起始點設定在手指點擊的 X 座標正下方 (扣掉直向卡片一半寬度約 60px)
        if (isLegendDocked) {
            initialLeft = startX - 60;
        } else {
            initialLeft = el.offsetLeft;
        }
        initialTop = el.offsetTop;

    }, { passive: false });

    el.addEventListener('touchmove', e => {
        if (!isDragging) return;
        if (hasMoved) e.preventDefault();
        onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    el.addEventListener('touchend', (e) => onEnd(e.changedTouches[0] || e));

    el.addEventListener('mousedown', e => {
        isDragging = true;
        hasMoved = false;
        el.classList.add('dragging');

        startX = e.clientX;
        startY = e.clientY;

        // 滑鼠版本的下拉跳位修復
        if (isLegendDocked) {
            initialLeft = startX - 60;
        } else {
            initialLeft = el.offsetLeft;
        }
        initialTop = el.offsetTop;

        el.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        if (hasMoved) e.preventDefault();
        onMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        onEnd(e);
        el.style.cursor = 'move';
    });

    window.addEventListener('resize', () => {
        // Resize 時確保不會被擠到畫面外
        const TOP_LIMIT = 2;
        if (el.offsetTop <= TOP_LIMIT + 20 && isLegendExpanded) {
            el.style.top = TOP_LIMIT + 'px';
            isLegendDocked = true;
            el.classList.add('dock-top');
            // 交給 css 的 !important 去置中，這裡不需要修改 left/right
        }
    });
}
