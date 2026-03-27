// ==================== AUTH GUARD ====================
(function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    var email = localStorage.getItem('userEmail');
    if (email) {
        document.getElementById('userEmail').textContent = email;
    }
})();

// ==================== LANGUAGE TOGGLE ====================
var currentLang = localStorage.getItem('rrd_lang') || 'en';
var activeTemplateConfig = null;

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('rrd_lang', lang);
    applyLang();
}

function applyLang() {
    document.getElementById('langEn').classList.toggle('active', currentLang === 'en');
    document.getElementById('langTe').classList.toggle('active', currentLang === 'te');
    var els = document.querySelectorAll('[data-' + currentLang + ']');
    els.forEach(function(el) {
        el.textContent = el.getAttribute('data-' + currentLang);
    });
}
applyLang();

// ==================== SUPABASE TRACKING ====================
var SUPABASE_URL = 'https://lrnadrqqpprphgmfbuuv.supabase.co';
var SUPABASE_KEY = 'sb_publishable_XUX5VIeRCR_OVBoqjiUc3w_Qar639er';

function sbRequest(method, table, data, query) {
    var url = SUPABASE_URL + '/rest/v1/' + table + (query || '');
    var opts = {
        method: method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': method === 'PATCH' ? 'return=minimal' : ''
        }
    };
    if (data) opts.body = JSON.stringify(data);
    return fetch(url, opts).catch(function() {});
}

// Update last_active_at on page load
(function() {
    var sid = localStorage.getItem('sessionId');
    if (sid) {
        sbRequest('PATCH', 'sessions', { last_active_at: new Date().toISOString(), page_views: undefined }, '?id=eq.' + sid);
        // Increment page_views via raw update
        fetch(SUPABASE_URL + '/rest/v1/rpc/increment_page_views', {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ session_id: parseInt(sid) })
        }).catch(function() {});
    }
})();

function syncPlotDataToSupabase(plotData) {
    var sid = localStorage.getItem('sessionId');
    if (sid) {
        sbRequest('PATCH', 'sessions', {
            last_active_at: new Date().toISOString(),
            plot_data: plotData
        }, '?id=eq.' + sid);
    }
}

// Auto-logout after 15 min inactivity
(function() {
    var TIMEOUT = 15 * 60 * 1000;
    var timer;
    function resetTimer() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('sessionId');
            window.location.href = 'login.html';
        }, TIMEOUT);
    }
    ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(function(evt) {
        document.addEventListener(evt, resetTimer);
    });
    resetTimer();
})();

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// ==================== DATA PERSISTENCE (localStorage) ====================
var STORAGE_KEY = 'plotGenerator_formData';

function saveFormData() {
    var compassTopEl = document.querySelector('input[name="compass_top"]:checked');
    var data = {
        mode: getMode(),
        n_ft: document.getElementById('n_ft').value,
        n_in: document.getElementById('n_in').value,
        s_ft: document.getElementById('s_ft').value,
        s_in: document.getElementById('s_in').value,
        e_ft: document.getElementById('e_ft').value,
        e_in: document.getElementById('e_in').value,
        w_ft: document.getElementById('w_ft').value,
        w_in: document.getElementById('w_in').value,
        road_north: document.getElementById('road_north').checked,
        road_south: document.getElementById('road_south').checked,
        road_east: document.getElementById('road_east').checked,
        road_west: document.getElementById('road_west').checked,
        compass_top: compassTopEl ? compassTopEl.value : 'N',
        title: document.getElementById('title').value,
        vendor: document.getElementById('vendor').value,
        vendees: document.getElementById('vendees').value,
        vendor_label: document.getElementById('vendor_label').value,
        vendee_label: document.getElementById('vendee_label').value,
        sig_label_1: document.getElementById('sig_label_1').value,
        sig_label_2: document.getElementById('sig_label_2').value,
        north_txt: document.getElementById('north_txt').value,
        south_txt: document.getElementById('south_txt').value,
        east_txt: document.getElementById('east_txt').value,
        west_txt: document.getElementById('west_txt').value,
        plot_center_txt: document.getElementById('plot_center_txt').value,
        open_area_txt: document.getElementById('open_area_txt').value,
        area_sqyd_override: document.getElementById('area_sqyd_override').value,
        area_sqm_override: document.getElementById('area_sqm_override').value,
        area_sqyd_manual: (document.getElementById('area_sqyd_override').dataset.manualOverride === '1'),
        area_sqm_manual: (document.getElementById('area_sqm_override').dataset.manualOverride === '1'),
        plinth: document.getElementById('plinth').value,
        plinth_manual: (document.getElementById('plinth').dataset.manualOverride === '1'),
        wit1: document.getElementById('wit1').value,
        wit2: document.getElementById('wit2').value,
        showInterior: document.getElementById('showInterior').value === 'true',
        dims_outside: document.getElementById('dims_outside').checked,
        trap_align: document.getElementById('trap_align').value,
        trap_valign: document.getElementById('trap_valign').value,
        trap_offset_h: document.getElementById('trap_offset_h').value,
        trap_offset_v: document.getElementById('trap_offset_v').value,
        show_room: document.getElementById('show_room').checked,
        room_label: document.getElementById('room_label').value,
        room_w_ft: document.getElementById('room_w_ft').value,
        room_w_in: document.getElementById('room_w_in').value,
        room_h_ft: document.getElementById('room_h_ft').value,
        room_h_in: document.getElementById('room_h_in').value,
        show_area_in_plot: document.getElementById('show_area_in_plot').checked,
        textSizes: textSizes,
        compassOffset: { x: compassOffset.x, y: compassOffset.y },
        sideOffsets: { N: sideOffsets.N, S: sideOffsets.S, E: sideOffsets.E, W: sideOffsets.W },
        plotPosOffset: { x: plotPosOffset.x, y: plotPosOffset.y },
        plotScaleAdj: plotScaleAdj,
        zoom: currentZoom,
        textOverrides: textOverrides
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFormData() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
        var data = JSON.parse(raw);

        if (data.mode === 'trapezoid') {
            document.getElementById('modeTrap').checked = true;
        } else {
            document.getElementById('modeRect').checked = true;
        }

        var fields = ['n_ft','n_in','s_ft','s_in','e_ft','e_in','w_ft','w_in'];
        fields.forEach(function(id) {
            if (data[id] !== undefined) document.getElementById(id).value = data[id];
        });

        var textFields = [
            'title','vendor','vendees','vendor_label','vendee_label','sig_label_1','sig_label_2',
            'north_txt','south_txt','east_txt','west_txt',
            'plot_center_txt','open_area_txt','area_sqyd_override','area_sqm_override','plinth','wit1','wit2',
            'room_label','room_w_ft','room_w_in','room_h_ft','room_h_in',
];
        textFields.forEach(function(id) {
            if (data[id] !== undefined) document.getElementById(id).value = data[id];
        });
        restoreAutoOverrideFlags(data);

        // Restore road checkboxes
        ['road_north','road_south','road_east','road_west'].forEach(function(id) {
            if (data[id] !== undefined) document.getElementById(id).checked = data[id];
        });
        if (data.compass_top) {
            var cEl = document.getElementById('compass_top_' + data.compass_top.toLowerCase());
            if (cEl) cEl.checked = true;
        }

        if (data.showInterior !== undefined) {
            document.getElementById('showInterior').value = data.showInterior ? 'true' : 'false';
        }

        // Checkbox fields
        if (data.compassOffset) {
            compassOffset.x = data.compassOffset.x || 0;
            compassOffset.y = data.compassOffset.y || 0;
            document.getElementById('compass_x_val').textContent = compassOffset.x;
            document.getElementById('compass_y_val').textContent = compassOffset.y;
        }
        if (data.sideOffsets) {
            sideOffsets.N = data.sideOffsets.N || 0;
            sideOffsets.S = data.sideOffsets.S || 0;
            sideOffsets.E = data.sideOffsets.E || 0;
            sideOffsets.W = data.sideOffsets.W || 0;
            ['N','S','E','W'].forEach(function(s) { document.getElementById('side_off_' + s).textContent = sideOffsets[s]; });
        }
        if (data.plotPosOffset) {
            plotPosOffset.x = data.plotPosOffset.x || 0;
            plotPosOffset.y = data.plotPosOffset.y || 0;
            document.getElementById('plot_pos_x').textContent = plotPosOffset.x;
            document.getElementById('plot_pos_y').textContent = plotPosOffset.y;
        }
        if (data.plotScaleAdj !== undefined) {
            plotScaleAdj = data.plotScaleAdj || 0;
            document.getElementById('plot_scale_val').textContent = plotScaleAdj;
        }
        if (data.textOverrides) {
            textOverrides = data.textOverrides;
        }
        if (data.dims_outside !== undefined) {
            document.getElementById('dims_outside').checked = data.dims_outside;
        }
        if (data.trap_align) {
            document.getElementById('trap_align').value = data.trap_align;
        }
        if (data.trap_valign) {
            document.getElementById('trap_valign').value = data.trap_valign;
        }
        if (data.trap_offset_h) {
            document.getElementById('trap_offset_h').value = data.trap_offset_h;
        }
        if (data.trap_offset_v) {
            document.getElementById('trap_offset_v').value = data.trap_offset_v;
        }
        if (data.show_room !== undefined) {
            document.getElementById('show_room').checked = data.show_room;
            document.getElementById('room_fields').style.display = data.show_room ? 'block' : 'none';
        }
        if (data.show_area_in_plot !== undefined) {
            document.getElementById('show_area_in_plot').checked = data.show_area_in_plot;
        }

        if (data.textSizes) {
            for (var key in data.textSizes) {
                if (textSizes.hasOwnProperty(key)) {
                    var val = data.textSizes[key];
                    if (key === 'title') {
                        val = Math.max(12, Math.min(18, val));
                    } else {
                        val = Math.max(10, Math.min(14, val));
                    }
                    textSizes[key] = val;
                    var el = document.getElementById(key + '_size');
                    if (el) el.textContent = textSizes[key] + 'px';
                }
            }
        }

        if (data.zoom) {
            currentZoom = data.zoom;
            document.getElementById('zoom_value').textContent = currentZoom + '%';
            applyZoom();
        }

        return true;
    } catch (e) {
        return false;
    }
}

// Auto-save and live redraw on any input change (debounced)
var saveTimeout;
var drawTimeout;

function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormData, 500);
}

function scheduleDraw() {
    clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
        if (getMode() === 'rectangle') syncRectangleFields();
        drawMap();
    }, 150);
}

function initAutoOverrideField(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.dataset.manualOverride = (el.value !== '' && el.value !== null) ? '1' : '0';
    el.addEventListener('input', function() {
        this.dataset.manualOverride = (this.value !== '' && this.value !== null) ? '1' : '0';
    });
}

function restoreAutoOverrideFlags(data) {
    var sqyd = document.getElementById('area_sqyd_override');
    var sqm = document.getElementById('area_sqm_override');
    var plinth = document.getElementById('plinth');
    if (sqyd) sqyd.dataset.manualOverride = data && data.area_sqyd_manual ? '1' : '0';
    if (sqm) sqm.dataset.manualOverride = data && data.area_sqm_manual ? '1' : '0';
    if (plinth) plinth.dataset.manualOverride = data && data.plinth_manual ? '1' : '0';
}

function autoOverrideSelfHeal(inputEl, autoValue) {
    if (!inputEl) return;
    if (inputEl.dataset.manualOverride !== '1') return;
    var cur = parseFloat(inputEl.value);
    if (isNaN(cur)) return;
    // If stored/manual value is effectively same as current auto value, treat it as auto mode.
    if (Math.abs(cur - autoValue) < 0.01) {
        inputEl.dataset.manualOverride = '0';
    }
}

document.addEventListener('input', function() {
    scheduleSave();
    scheduleDraw();
});
document.addEventListener('change', function() {
    scheduleSave();
    scheduleDraw();
});

// ==================== SVG SETUP ====================
var SVG_NS = 'http://www.w3.org/2000/svg';
var svg = document.getElementById('mapSvg');
var A4_WIDTH = 793;
var A4_HEIGHT = 1122;

// Layer references
var layerBorder = document.getElementById('layer-border');
var layerPlot = document.getElementById('layer-plot');
var layerDimensions = document.getElementById('layer-dimensions');
var layerText = document.getElementById('layer-text');

function svgClear() {
    [layerBorder, layerPlot, layerDimensions, layerText].forEach(function(g) {
        while (g.firstChild) g.removeChild(g.firstChild);
    });
}

function svgElem(tag, attrs, parent) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) {
        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
}

// Text measurement using temporary SVG text element
function svgMeasureText(text, fontSize, fontWeight) {
    var t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('font-family', 'Arial, sans-serif');
    t.setAttribute('font-size', fontSize);
    if (fontWeight) t.setAttribute('font-weight', fontWeight);
    t.textContent = text;
    svg.appendChild(t);
    var w = t.getBBox().width;
    svg.removeChild(t);
    return w;
}

// ==================== TEXT SIZES ====================
var textSizes = {
    title: 14,
    vendor: 11,
    dimensions: 11,
    sidetext: 11,
    plotcenter: 12
};

// ==================== ZOOM (CSS transform, no distortion) ====================
var currentZoom = 60;

function adjustZoom(delta) {
    currentZoom = Math.max(20, Math.min(200, currentZoom + delta));
    document.getElementById('zoom_value').textContent = currentZoom + '%';
    applyZoom();
    scheduleSave();
    scheduleDraw();
}

function resetZoom() {
    currentZoom = 60;
    document.getElementById('zoom_value').textContent = currentZoom + '%';
    applyZoom();
    scheduleSave();
    scheduleDraw();
}

function applyZoom() {
    var wrapper = document.getElementById('canvasWrapper');
    var svg = document.getElementById('mapSvg');
    var s = currentZoom / 100;
    var w = parseFloat(svg.getAttribute('width')) || 793;
    var h = parseFloat(svg.getAttribute('height')) || 1122;
    // Use CSS width/height on SVG to scale it (no transform needed)
    svg.style.width = (w * s) + 'px';
    svg.style.height = (h * s) + 'px';
    // Clear any transform
    wrapper.style.transform = '';
    wrapper.style.width = '';
    wrapper.style.height = '';
}

// ==================== PINCH TO ZOOM ====================
(function() {
    var container = document.querySelector('.canvas-container');
    if (!container) return;

    var lastDist = 0;
    var pinching = false;

    container.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            pinching = true;
            lastDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchmove', function(e) {
        if (pinching && e.touches.length === 2) {
            var dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            var delta = dist - lastDist;
            if (Math.abs(delta) > 5) {
                var step = delta > 0 ? 5 : -5;
                currentZoom = Math.max(20, Math.min(200, currentZoom + step));
                document.getElementById('zoom_value').textContent = currentZoom + '%';
                applyZoom();
                lastDist = dist;
            }
            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) {
            if (pinching) {
                pinching = false;
                scheduleSave();
            }
        }
    });
})();

// ==================== TEXT SIZE CONTROLS ====================
function adjustSize(type, delta) {
    var min = 12, max = 18;
    textSizes[type] = Math.max(min, Math.min(max, textSizes[type] + delta));
    document.getElementById(type + '_size').textContent = textSizes[type] + 'px';
    scheduleSave();
    scheduleDraw();
}

function adjustBodySize(delta) {
    var min = 10, max = 14;
    var bodyTypes = ['vendor', 'dimensions', 'sidetext', 'plotcenter'];
    bodyTypes.forEach(function(type) {
        textSizes[type] = Math.max(min, Math.min(max, textSizes[type] + delta));
    });
    document.getElementById('body_size').textContent = textSizes.vendor + 'px';
    scheduleSave();
    scheduleDraw();
}

// ==================== COMPASS POSITION ====================
var compassOffset = { x: 0, y: 0 };
var plotPosOffset = { x: 0, y: 0 };
var plotScaleAdj = 0;

// Block layout offsets
var blockOffsets = {
    header:  { x: 0, y: 0, s: 0 },
    diagram: { x: 0, y: 0, s: 0 },
    area:    { x: 0, y: 0, s: 0 },
    compass: { x: 0, y: 0, s: 0 },
    footer:  { x: 0, y: 0, s: 0 }
};

function adjustBlock(block, axis, delta) {
    blockOffsets[block][axis] += delta;
    var el = document.getElementById('blk_' + block + '_' + axis);
    if (el) el.textContent = blockOffsets[block][axis];
    scheduleSave();
    scheduleDraw();
}

function adjustPlotPos(axis, delta) {
    plotPosOffset[axis] += delta;
    document.getElementById('plot_pos_' + axis).textContent = plotPosOffset[axis];
    scheduleSave();
    scheduleDraw();
}

function adjustPlotScale(delta) {
    plotScaleAdj += delta;
    document.getElementById('plot_scale_val').textContent = plotScaleAdj;
    scheduleSave();
    scheduleDraw();
}
var sideOffsets = { N: 0, S: 0, E: 0, W: 0 };

// Per-text-field overrides: { fieldName: { dx: 0, dy: 0, ds: 0 } }
var textOverrides = {};
var taActiveField = null; // currently selected field for toolbar

function adjustSideOffset(side, delta) {
    sideOffsets[side] += delta;
    document.getElementById('side_off_' + side).textContent = sideOffsets[side];
    scheduleSave();
    scheduleDraw();
}

function adjustCompass(axis, delta) {
    compassOffset[axis] += delta;
    document.getElementById('compass_' + axis + '_val').textContent = compassOffset[axis];
    scheduleSave();
    scheduleDraw();
}

function initBodySizeDisplay() {
    var el = document.getElementById('body_size');
    if (el) el.textContent = textSizes.vendor + 'px';
}

// ==================== ACCORDION SECTIONS ====================
function toggleSection(id) {
    document.getElementById(id).classList.toggle('open');
}

// ==================== MODE TOGGLE (Rectangle / Trapezoid) ====================
function getMode() {
    return document.getElementById('modeRect').checked ? 'rectangle' : 'trapezoid';
}

function syncRectangleFields() {
    document.getElementById('s_ft').value = document.getElementById('n_ft').value;
    document.getElementById('s_in').value = document.getElementById('n_in').value;
    document.getElementById('w_ft').value = document.getElementById('e_ft').value;
    document.getElementById('w_in').value = document.getElementById('e_in').value;
}

function updateModeUI() {
    if (activeTemplateConfig && activeTemplateConfig.type === 'rectangle') {
        document.getElementById('modeRect').checked = true;
    } else if (activeTemplateConfig && activeTemplateConfig.type === 'trapezoid') {
        document.getElementById('modeTrap').checked = true;
    }

    var isRect = getMode() === 'rectangle';
    var southRow = document.getElementById('southRow');
    var westRow = document.getElementById('westRow');
    var syncHint = document.getElementById('syncHint');
    var southInputs = [
        document.getElementById('s_ft'),
        document.getElementById('s_in')
    ];
    var westInputs = [
        document.getElementById('w_ft'),
        document.getElementById('w_in')
    ];
    var modeTrap = document.getElementById('modeTrap');
    var modeRect = document.getElementById('modeRect');
    var trapLabel = document.querySelector('label[for="modeTrap"]');
    var rectLabel = document.querySelector('label[for="modeRect"]');

    // If a template type is locked, keep only the associated mode option visible
    if (activeTemplateConfig && activeTemplateConfig.type === 'rectangle') {
        if (modeTrap) modeTrap.style.setProperty('display', 'none', 'important');
        if (trapLabel) trapLabel.style.setProperty('display', 'none', 'important');
        if (modeRect) modeRect.style.removeProperty('display');
        if (rectLabel) rectLabel.style.removeProperty('display');
    } else if (activeTemplateConfig && activeTemplateConfig.type === 'trapezoid') {
        if (modeRect) modeRect.style.setProperty('display', 'none', 'important');
        if (rectLabel) rectLabel.style.setProperty('display', 'none', 'important');
        if (modeTrap) modeTrap.style.removeProperty('display');
        if (trapLabel) trapLabel.style.removeProperty('display');
    }

    if (isRect) {
        southRow.classList.add('synced');
        westRow.classList.add('synced');
        syncHint.classList.add('visible');
        southInputs.forEach(function(el) { if (el) el.disabled = true; });
        westInputs.forEach(function(el) { if (el) el.disabled = true; });
        document.getElementById('trapAlignHRow').style.display = 'none';
        document.getElementById('trapAlignVRow').style.display = 'none';
        document.getElementById('trapHelpNote').style.display = 'none';
        syncRectangleFields();
    } else {
        southRow.classList.remove('synced');
        westRow.classList.remove('synced');
        syncHint.classList.remove('visible');
        southInputs.forEach(function(el) { if (el) el.disabled = false; });
        westInputs.forEach(function(el) { if (el) el.disabled = false; });
        document.getElementById('trapHelpNote').style.display = 'flex';
        updateTrapAlignVisibility();
    }
}

function updateTrapAlignVisibility() {
    if (getMode() === 'rectangle') return;
    var N = toFeet(document.getElementById('n_ft').value, document.getElementById('n_in').value);
    var S = toFeet(document.getElementById('s_ft').value, document.getElementById('s_in').value);
    var E = toFeet(document.getElementById('e_ft').value, document.getElementById('e_in').value);
    var W = toFeet(document.getElementById('w_ft').value, document.getElementById('w_in').value);
    document.getElementById('trapAlignHRow').style.display = (N !== S) ? 'block' : 'none';
    document.getElementById('trapAlignVRow').style.display = (E !== W) ? 'block' : 'none';
}

document.getElementById('modeRect').addEventListener('change', updateModeUI);
document.getElementById('modeTrap').addEventListener('change', updateModeUI);
['n_ft','n_in','s_ft','s_in','e_ft','e_in','w_ft','w_in'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', function() {
        updateTrapAlignVisibility();
    });
});

// Room toggle visibility
document.getElementById('show_room').addEventListener('change', function() {
    document.getElementById('room_fields').style.display = this.checked ? 'block' : 'none';
});

['n_ft', 'n_in'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', function() {
        if (getMode() === 'rectangle') {
            document.getElementById('s_ft').value = document.getElementById('n_ft').value;
            document.getElementById('s_in').value = document.getElementById('n_in').value;
        }
    });
});
['e_ft', 'e_in'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', function() {
        if (getMode() === 'rectangle') {
            document.getElementById('w_ft').value = document.getElementById('e_ft').value;
            document.getElementById('w_in').value = document.getElementById('e_in').value;
        }
    });
});

// ==================== UTILITY FUNCTIONS ====================
function toFeet(ft, inch) {
    ft = parseFloat(ft) || 0;
    inch = parseFloat(inch) || 0;
    return ft + inch / 12;
}

function ftStr(v) {
    var f = Math.floor(v);
    var i = Math.round((v - f) * 12);
    if (i === 12) { f++; i = 0; }
    return f + "'-" + i + '"';
}

// SVG word-wrap text helper
// Returns the Y position after the last line
function svgWrapText(layer, text, x, y, maxWidth, lineHeight, fontSize, opts) {
    opts = opts || {};
    var fw = opts.fontWeight || 'normal';
    var anchor = opts.textAnchor || 'start';
    var cls = opts.className || '';
    var field = opts.dataField || '';

    // Preserve leading spaces by converting to non-breaking spaces
    var leadingSpaces = text.match(/^(\s*)/)[0];
    var nbsp = '\u00A0';
    var preservedPrefix = leadingSpaces.replace(/ /g, nbsp);
    var trimmedText = text.substring(leadingSpaces.length);

    var words = trimmedText.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
        var test = line + (line ? ' ' : '') + words[i];
        if (svgMeasureText(test, fontSize, fw) > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    // Add preserved leading spaces to first line
    if (lines.length > 0) lines[0] = preservedPrefix + lines[0];

    var textEl = svgElem('text', {
        x: x, y: y,
        'font-family': 'Arial, sans-serif',
        'font-size': fontSize,
        'font-weight': fw,
        'text-anchor': anchor,
        'dominant-baseline': 'auto',
        fill: '#000'
    }, layer);
    if (cls) textEl.setAttribute('class', cls);
    if (field) textEl.setAttribute('data-field', field);

    for (var j = 0; j < lines.length; j++) {
        var tspan = svgElem('tspan', {
            x: x,
            dy: j === 0 ? '0' : lineHeight
        }, textEl);
        tspan.textContent = lines[j];
    }

    return y + (lines.length - 1) * lineHeight;
}

// Simple single-line SVG text
function svgText(layer, text, x, y, fontSize, opts) {
    opts = opts || {};
    var field = opts.dataField || '';

    // Apply per-field overrides (position offset + font size delta)
    if (field && textOverrides[field]) {
        var ov = textOverrides[field];
        x += (ov.dx || 0);
        y += (ov.dy || 0);
        fontSize += (ov.ds || 0);
        if (fontSize < 3) fontSize = 3;
    }

    var attrs = {
        x: x, y: y,
        'font-family': 'Arial, sans-serif',
        'font-size': fontSize,
        'font-weight': opts.fontWeight || 'normal',
        'text-anchor': opts.textAnchor || 'start',
        'dominant-baseline': opts.dominantBaseline || 'auto',
        fill: opts.fill || '#000'
    };
    if (opts.transform) attrs.transform = opts.transform;
    if (opts.textDecoration) attrs['text-decoration'] = opts.textDecoration;
    var el = svgElem('text', attrs, layer);
    if (opts.className) el.setAttribute('class', opts.className);
    if (field) el.setAttribute('data-field', field);
    el.textContent = text;
    return el;
}

// ==================== ROAD DIRECTION MAPPING ====================
function getRoadMapping() {
    return { bottom: 'S', top: 'N', left: 'W', right: 'E' };
}

function getCompassTopDirection() {
    var checked = document.querySelector('input[name="compass_top"]:checked');
    return checked ? checked.value : 'N';
}

function updateBoundaryInputLabels() {
    var topDir = getCompassTopDirection();
    var sideMapByTop = {
        N: { top: 'North', bottom: 'South', left: 'West', right: 'East', topShort: 'N', bottomShort: 'S', leftShort: 'W', rightShort: 'E' },
        S: { top: 'South', bottom: 'North', left: 'East', right: 'West', topShort: 'S', bottomShort: 'N', leftShort: 'E', rightShort: 'W' },
        E: { top: 'East', bottom: 'West', left: 'North', right: 'South', topShort: 'E', bottomShort: 'W', leftShort: 'N', rightShort: 'S' },
        W: { top: 'West', bottom: 'East', left: 'South', right: 'North', topShort: 'W', bottomShort: 'E', leftShort: 'S', rightShort: 'N' }
    };
    var s = sideMapByTop[topDir] || sideMapByTop.N;

    var n = document.getElementById('lbl_north_side');
    var so = document.getElementById('lbl_south_side');
    var e = document.getElementById('lbl_east_side');
    var w = document.getElementById('lbl_west_side');

    if (n) n.textContent = s.top + ' Side';
    if (so) so.textContent = s.bottom + ' Side';
    if (e) e.textContent = s.right + ' Side';
    if (w) w.textContent = s.left + ' Side';

    var dn = document.getElementById('lbl_dim_north');
    var ds = document.getElementById('lbl_dim_south');
    var de = document.getElementById('lbl_dim_east');
    var dw = document.getElementById('lbl_dim_west');
    if (dn) dn.textContent = s.topShort;
    if (ds) ds.textContent = s.bottomShort;
    if (de) de.textContent = s.rightShort;
    if (dw) dw.textContent = s.leftShort;

    var syncHint = document.getElementById('syncHint');
    if (syncHint) {
        syncHint.textContent = s.bottomShort + ' and ' + s.leftShort + ' are auto-synced in Rectangle mode';
    }
}

function getDimForVisualSide(mapping, side, dims) {
    return dims[mapping[side]];
}

function getTextForVisualSide(mapping, side, texts) {
    return texts[mapping[side]];
}

// ==================== AREA CALCULATION ====================
function calculateArea(topWidth, bottomWidth, height, isRect) {
    var sqft;
    if (isRect) {
        sqft = bottomWidth * height;
    } else {
        sqft = ((topWidth + bottomWidth) / 2) * height;
    }
    return {
        sqft: Math.round(sqft * 100) / 100,
        sqyd: Math.round((sqft / 9) * 100) / 100,
        sqm: Math.round((sqft * 0.092903) * 100) / 100
    };
}

// ==================== COMPASS ROSE (SVG) ====================
function drawCompass(layer, cx, cy, size, topDirection) {
    var r = size;
    var inner = r * 0.3; // inner diamond radius
    var lbl = r + 8; // label distance from center
    var rotMap = { N: 0, E: -90, S: 180, W: 90 };
    var rot = rotMap[topDirection] || 0;
    var group = svgElem('g', { transform: 'rotate(' + rot + ' ' + cx + ' ' + cy + ')' }, layer);

    // Outer circle
    svgElem('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: '#000', 'stroke-width': 1.2 }, group);

    // 4-pointed star: each cardinal direction has two triangles (filled + unfilled)
    // North pointer (filled black - left half, white - right half)
    svgElem('polygon', {
        points: cx + ',' + (cy - r) + ' ' + (cx - inner) + ',' + cy + ' ' + cx + ',' + (cy - inner * 0.5),
        fill: '#000', stroke: '#000', 'stroke-width': 0.5
    }, group);
    svgElem('polygon', {
        points: cx + ',' + (cy - r) + ' ' + (cx + inner) + ',' + cy + ' ' + cx + ',' + (cy - inner * 0.5),
        fill: '#fff', stroke: '#000', 'stroke-width': 0.5
    }, group);

    // South pointer
    svgElem('polygon', {
        points: cx + ',' + (cy + r) + ' ' + (cx - inner) + ',' + cy + ' ' + cx + ',' + (cy + inner * 0.5),
        fill: '#000', stroke: '#000', 'stroke-width': 0.5
    }, group);
    svgElem('polygon', {
        points: cx + ',' + (cy + r) + ' ' + (cx + inner) + ',' + cy + ' ' + cx + ',' + (cy + inner * 0.5),
        fill: '#fff', stroke: '#000', 'stroke-width': 0.5
    }, group);

    // East pointer
    svgElem('polygon', {
        points: (cx + r) + ',' + cy + ' ' + cx + ',' + (cy - inner) + ' ' + (cx + inner * 0.5) + ',' + cy,
        fill: '#000', stroke: '#000', 'stroke-width': 0.5
    }, group);
    svgElem('polygon', {
        points: (cx + r) + ',' + cy + ' ' + cx + ',' + (cy + inner) + ' ' + (cx + inner * 0.5) + ',' + cy,
        fill: '#fff', stroke: '#000', 'stroke-width': 0.5
    }, group);

    // West pointer
    svgElem('polygon', {
        points: (cx - r) + ',' + cy + ' ' + cx + ',' + (cy - inner) + ' ' + (cx - inner * 0.5) + ',' + cy,
        fill: '#000', stroke: '#000', 'stroke-width': 0.5
    }, group);
    svgElem('polygon', {
        points: (cx - r) + ',' + cy + ' ' + cx + ',' + (cy + inner) + ' ' + (cx - inner * 0.5) + ',' + cy,
        fill: '#fff', stroke: '#000', 'stroke-width': 0.5
    }, group);

    // Center dot
    svgElem('circle', { cx: cx, cy: cy, r: 1.5, fill: '#000' }, group);

    // Labels outside circle (keep labels upright, only rotate the symbol)
    var labelMap = {
        N: { top: 'N', bottom: 'S', right: 'E', left: 'W' },
        S: { top: 'S', bottom: 'N', right: 'W', left: 'E' },
        E: { top: 'E', bottom: 'W', right: 'S', left: 'N' },
        W: { top: 'W', bottom: 'E', right: 'N', left: 'S' }
    };
    var lm = labelMap[topDirection] || labelMap.N;
    svgText(layer, lm.top, cx, cy - lbl, 8, { fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'auto' });
    svgText(layer, lm.bottom, cx, cy + lbl + 4, 8, { fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'auto' });
    svgText(layer, lm.right, cx + lbl + 1, cy + 3, 8, { fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'auto' });
    svgText(layer, lm.left, cx - lbl - 1, cy + 3, 8, { fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'auto' });
}

// ==================== DIMENSION ENGINE (SVG) ====================
function drawDimensionLine(p1, p2, offset, normalDir, label) {
    var dimFontSize = textSizes.dimensions;
    var layer = layerDimensions;

    // Extension line endpoints (dotted lines from corners outward)
    var extLen = offset + 10;
    var e1s = { x: p1.x, y: p1.y };
    var e1e = { x: p1.x + normalDir.x * extLen, y: p1.y + normalDir.y * extLen };
    var e2s = { x: p2.x, y: p2.y };
    var e2e = { x: p2.x + normalDir.x * extLen, y: p2.y + normalDir.y * extLen };

    // Extension lines from plot edge to dimension line (thicker solid)
    svgElem('line', { x1: e1s.x, y1: e1s.y, x2: e1e.x, y2: e1e.y, stroke: '#000', 'stroke-width': 1.1 }, layer);
    svgElem('line', { x1: e2s.x, y1: e2s.y, x2: e2e.x, y2: e2e.y, stroke: '#000', 'stroke-width': 1.1 }, layer);

    // Dimension line (between arrows)
    var d1 = { x: p1.x + normalDir.x * offset, y: p1.y + normalDir.y * offset };
    var d2 = { x: p2.x + normalDir.x * offset, y: p2.y + normalDir.y * offset };

    var dx = d2.x - d1.x;
    var dy = d2.y - d1.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    var ux = dx / len, uy = dy / len;

    // Arrowheads at both ends of dimension line
    var arrowLen = 7;
    var arrowWing = 3;
    // Arrow at d1 points toward d2
    svgElem('line', {
        x1: d1.x, y1: d1.y,
        x2: d1.x + ux * arrowLen + (-uy) * arrowWing, y2: d1.y + uy * arrowLen + ux * arrowWing,
        stroke: '#000', 'stroke-width': 0.9
    }, layer);
    svgElem('line', {
        x1: d1.x, y1: d1.y,
        x2: d1.x + ux * arrowLen - (-uy) * arrowWing, y2: d1.y + uy * arrowLen - ux * arrowWing,
        stroke: '#000', 'stroke-width': 0.9
    }, layer);
    // Arrow at d2 points toward d1
    svgElem('line', {
        x1: d2.x, y1: d2.y,
        x2: d2.x - ux * arrowLen + (-uy) * arrowWing, y2: d2.y - uy * arrowLen + ux * arrowWing,
        stroke: '#000', 'stroke-width': 0.9
    }, layer);
    svgElem('line', {
        x1: d2.x, y1: d2.y,
        x2: d2.x - ux * arrowLen - (-uy) * arrowWing, y2: d2.y - uy * arrowLen - ux * arrowWing,
        stroke: '#000', 'stroke-width': 0.9
    }, layer);

    // Dimension text centered on line
    var midX = (d1.x + d2.x) / 2;
    var midY = (d1.y + d2.y) / 2;
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;

    // Dotted dimension line with a small center gap so it does not cut through text
    var textGap = svgMeasureText(label, dimFontSize, 'bold') + 10;
    var halfGap = Math.max(10, Math.min(len * 0.35, textGap / 2));
    var g1 = { x: midX - ux * halfGap, y: midY - uy * halfGap };
    var g2 = { x: midX + ux * halfGap, y: midY + uy * halfGap };
    svgElem('line', { x1: d1.x, y1: d1.y, x2: g1.x, y2: g1.y, stroke: '#000', 'stroke-width': 0.8, 'stroke-dasharray': '3,2' }, layer);
    svgElem('line', { x1: g2.x, y1: g2.y, x2: d2.x, y2: d2.y, stroke: '#000', 'stroke-width': 0.8, 'stroke-dasharray': '3,2' }, layer);

    svgText(layer, label, 0, 0, dimFontSize, {
        fontWeight: 'bold',
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        transform: 'translate(' + midX + ',' + midY + ') rotate(' + angle + ')'
    });
}

// ==================== DRAW SIDE TEXT (SVG) ====================
function drawBorderText(layer, text, cx, cy, fontSize, angle, maxWidth, dataField) {
    if (!text) return;
    var words = text.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
        var test = line + (line ? ' ' : '') + words[i];
        if (svgMeasureText(test, fontSize) > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);

    var lineH = fontSize + 2;
    var startY = -(lines.length - 1) * lineH / 2;

    var g = svgElem('g', {
        transform: 'translate(' + cx + ',' + cy + ') rotate(' + angle + ')'
    }, layer);

    for (var j = 0; j < lines.length; j++) {
        var opts = { textAnchor: 'middle', dominantBaseline: 'middle' };
        if (dataField) {
            opts.className = 'editable';
            opts.dataField = dataField;
        }
        svgText(g, lines[j], 0, startY + j * lineH, fontSize, opts);
    }
}

function drawSideText(p1, p2, offset, normalDir, text, fontSize, dataField) {
    if (!text) return 1;
    var layer = layerText;

    var midX = (p1.x + p2.x) / 2 + normalDir.x * offset;
    var midY = (p1.y + p2.y) / 2 + normalDir.y * offset;

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var edgeLen = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;

    // Word-wrap
    var maxWidth = edgeLen * 0.9;
    var words = text.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
        var test = line + (line ? ' ' : '') + words[i];
        if (svgMeasureText(test, fontSize) > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);

    var lineH = fontSize + 2;
    // First line at offset, extra lines grow inward (toward plot)
    var startY = -((lines.length - 1) * lineH);

    var g = svgElem('g', {
        transform: 'translate(' + midX + ',' + midY + ') rotate(' + angle + ')'
    }, layer);

    for (var j = 0; j < lines.length; j++) {
        var opts = { textAnchor: 'middle', dominantBaseline: 'middle' };
        if (dataField) {
            opts.className = 'editable';
            opts.dataField = dataField;
        }
        svgText(g, lines[j], 0, startY + j * lineH, fontSize, opts);
    }

    return lines.length;
}

// Count side text lines (for road offset calculation)
function countSideTextLines(p1, p2, text, fontSize) {
    if (!text) return 1;
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var edgeLen = Math.sqrt(dx * dx + dy * dy);
    var maxWidth = edgeLen * 0.9;
    var words = text.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
        var test = line + (line ? ' ' : '') + words[i];
        if (svgMeasureText(test, fontSize) > maxWidth && line) {
            lines.push(line);
            line = words[i];
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines.length;
}

// ==================== ROAD INDICATOR (SVG) ====================
function drawRoadIndicator(p1, p2, sideLabel, side, scale, sideOffset, dimsOutside) {
    var lineLayer = layerBorder; // keep road graphics below red plot outline
    var textLayer = layerText;   // keep road label text readable above
    var fs = textSizes.sidetext;

    var edgeDx = p2.x - p1.x;
    var edgeDy = p2.y - p1.y;
    var edgeLen = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);
    if (edgeLen === 0) return;

    // Unit vectors
    var eux = edgeDx / edgeLen, euy = edgeDy / edgeLen;

    // Compute outward normal perpendicular to the actual edge (follows slant)
    var outNorm;
    if (side === 'bottom') outNorm = { x: -euy, y: eux };   // rotate edge 90° CW (outward = downward)
    else if (side === 'top') outNorm = { x: euy, y: -eux };  // rotate edge 90° CCW (outward = upward)
    else if (side === 'left') outNorm = { x: euy, y: -eux };
    else outNorm = { x: -euy, y: eux };

    // Ensure outward normal actually points away from plot center
    // For bottom: outNorm.y should be positive; for top: negative; left: x negative; right: x positive
    if (side === 'bottom' && outNorm.y < 0) { outNorm.x = -outNorm.x; outNorm.y = -outNorm.y; }
    if (side === 'top' && outNorm.y > 0) { outNorm.x = -outNorm.x; outNorm.y = -outNorm.y; }
    if (side === 'left' && outNorm.x > 0) { outNorm.x = -outNorm.x; outNorm.y = -outNorm.y; }
    if (side === 'right' && outNorm.x < 0) { outNorm.x = -outNorm.x; outNorm.y = -outNorm.y; }

    // Apply side offset — shift the base edge outward
    var baseOff = sideOffset || 0;
    var bp1 = { x: p1.x + outNorm.x * baseOff, y: p1.y + outNorm.y * baseOff };
    var bp2 = { x: p2.x + outNorm.x * baseOff, y: p2.y + outNorm.y * baseOff };

    // Extend slightly beyond plot corners
    var ext = 20;
    var n1 = { x: bp1.x - eux * ext, y: bp1.y - euy * ext };
    var n2 = { x: bp2.x + eux * ext, y: bp2.y + euy * ext };

    // Near-side road line (attached to side, slightly extended)
    svgElem('line', { x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y, stroke: '#000', 'stroke-width': 0.9 }, lineLayer);

    // Far-side road line (parallel, offset outward)
    var farDist = 62;
    var f1 = { x: n1.x + outNorm.x * farDist, y: n1.y + outNorm.y * farDist };
    var f2 = { x: n2.x + outNorm.x * farDist, y: n2.y + outNorm.y * farDist };
    svgElem('line', { x1: f1.x, y1: f1.y, x2: f2.x, y2: f2.y, stroke: '#000', 'stroke-width': 0.9 }, lineLayer);

    // Add V/hill marks inside the road band (between the two road lines)
    var lightningInset = 10;
    var pulseInnerStart = farDist * 0.2;
    var pulseInnerEnd = farDist * 0.8;
    var lnStart = {
        x: n1.x + eux * lightningInset + outNorm.x * pulseInnerStart,
        y: n1.y + euy * lightningInset + outNorm.y * pulseInnerStart
    };
    var lnEnd = {
        x: n1.x + eux * lightningInset + outNorm.x * pulseInnerEnd,
        y: n1.y + euy * lightningInset + outNorm.y * pulseInnerEnd
    };
    drawRoadEndLightning(lineLayer, lnStart, lnEnd, eux, euy);
    var rnStart = {
        x: n2.x - eux * lightningInset + outNorm.x * pulseInnerStart,
        y: n2.y - euy * lightningInset + outNorm.y * pulseInnerStart
    };
    var rnEnd = {
        x: n2.x - eux * lightningInset + outNorm.x * pulseInnerEnd,
        y: n2.y - euy * lightningInset + outNorm.y * pulseInnerEnd
    };
    drawRoadEndLightning(lineLayer, rnStart, rnEnd, eux, euy);

    // Road text (supports multiline/wrap), rotated to follow edge angle
    // For outside dimensions, keep right-side text slightly more outward to avoid collisions.
    var textBandRatio = 0.5;
    if (dimsOutside) {
        textBandRatio = (side === 'right') ? 0.72 : 0.6;
    }
    var roadMidX = (bp1.x + bp2.x) / 2 + outNorm.x * farDist * textBandRatio;
    var roadMidY = (bp1.y + bp2.y) / 2 + outNorm.y * farDist * textBandRatio;
    var roadText = (sideLabel || '').toUpperCase();
    var edgeAngle = Math.atan2(edgeDy, edgeDx) * 180 / Math.PI;
    var maxRoadTextWidth = Math.max(60, edgeLen * 0.72);
    var roadLines = wrapRoadTextLines(roadText, fs, maxRoadTextWidth);
    var lineH = fs + 2;
    var startY = -((roadLines.length - 1) * lineH / 2);
    var tg = svgElem('g', {
        transform: 'translate(' + roadMidX + ',' + roadMidY + ') rotate(' + edgeAngle + ')'
    }, textLayer);
    for (var ri = 0; ri < roadLines.length; ri++) {
        svgText(tg, roadLines[ri], 0, startY + ri * lineH, fs, {
            textAnchor: 'middle',
            dominantBaseline: 'middle'
        });
    }
}

// Legacy helper (currently unused)
function drawBreakSymbol(layer, start, end, outNorm, eux, euy) {
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    // Simple Z shape: start -> upper jog -> lower jog -> end
    var zWidth = 5;
    var m1 = { x: start.x + dx * 0.33 + eux * zWidth, y: start.y + dy * 0.33 + euy * zWidth };
    var m2 = { x: start.x + dx * 0.66 - eux * zWidth, y: start.y + dy * 0.66 - euy * zWidth };
    var pts = [
        start.x + ',' + start.y,
        m1.x + ',' + m1.y,
        m2.x + ',' + m2.y,
        end.x + ',' + end.y
    ];

    svgElem('polyline', {
        points: pts.join(' '),
        fill: 'none', stroke: '#000', 'stroke-width': 0.8
    }, layer);
}

function drawRoadEndLightning(layer, start, end, eux, euy) {
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    // Straight on both ends, simple V notch in the middle
    var ux = dx / len;
    var uy = dy / len;
    // Scale notch size with road-band width so it keeps cutting clearly after road width changes
    var vDepth = Math.max(12, len * 0.42);
    var over = Math.max(12, len * 0.42);
    var s0 = { x: start.x - ux * over, y: start.y - uy * over };
    var e0 = { x: end.x + ux * over, y: end.y + uy * over };

    // Centered notch geometry (use full extended line length)
    var totalLen = len + (2 * over);
    var notchCenter = 0.68; // move notch closer to the far end
    var in1 = { x: s0.x + ux * (totalLen * (notchCenter - 0.05)), y: s0.y + uy * (totalLen * (notchCenter - 0.05)) };
    var in2 = { x: s0.x + ux * (totalLen * (notchCenter + 0.05)), y: s0.y + uy * (totalLen * (notchCenter + 0.05)) };
    // One straight side + one slant side
    // in1 -> knee: straight (perpendicular), knee -> in2: slant
    var knee = { x: in1.x + eux * vDepth, y: in1.y + euy * vDepth };

    svgElem('polyline', {
        points: [s0, in1, knee, in2, e0].map(function(p) { return p.x + ',' + p.y; }).join(' '),
        fill: 'none',
        stroke: '#000',
        'stroke-width': 1.3
    }, layer);
}

function wrapRoadTextLines(text, fontSize, maxWidth) {
    if (!text) return [''];
    var rawLines = text.split('\n');
    var out = [];
    for (var li = 0; li < rawLines.length; li++) {
        var line = rawLines[li].trim();
        if (!line) {
            out.push('');
            continue;
        }
        var words = line.split(/\s+/);
        var cur = '';
        for (var wi = 0; wi < words.length; wi++) {
            var test = cur ? (cur + ' ' + words[wi]) : words[wi];
            if (svgMeasureText(test, fontSize) > maxWidth && cur) {
                out.push(cur);
                cur = words[wi];
            } else {
                cur = test;
            }
        }
        if (cur) out.push(cur);
    }
    return out.length ? out : [''];
}

// ==================== MAIN DRAW FUNCTION ====================
function drawMap() {
    svgClear();

    var MARGIN = 20;
    var PAGE_WIDTH = A4_WIDTH - 2 * MARGIN;
    var PAGE_HEIGHT = A4_HEIGHT - 2 * MARGIN;
    var PAD = 28; // inner padding from border to content

    // ---- Layer: Border (outer rectangle) ----
    svgElem('rect', {
        x: MARGIN, y: MARGIN, width: PAGE_WIDTH, height: PAGE_HEIGHT,
        fill: 'none', stroke: '#000', 'stroke-width': 1.5
    }, layerBorder);

    // ---- Read inputs ----
    var N = toFeet(document.getElementById('n_ft').value, document.getElementById('n_in').value);
    var S = toFeet(document.getElementById('s_ft').value, document.getElementById('s_in').value);
    var E = toFeet(document.getElementById('e_ft').value, document.getElementById('e_in').value);
    var W = toFeet(document.getElementById('w_ft').value, document.getElementById('w_in').value);

    if (Math.min(N, S, E, W) <= 0) return;

    var mode = getMode();
    var isRect = (mode === 'rectangle');
    var mapping = getRoadMapping();

    var dims = { N: N, S: S, E: E, W: W };
    var sideTextsInput = {
        N: document.getElementById('north_txt').value.toUpperCase(),
        S: document.getElementById('south_txt').value.toUpperCase(),
        E: document.getElementById('east_txt').value.toUpperCase(),
        W: document.getElementById('west_txt').value.toUpperCase()
    };

    var visBottom = getDimForVisualSide(mapping, 'bottom', dims);
    var visTop    = getDimForVisualSide(mapping, 'top', dims);
    var visLeft   = getDimForVisualSide(mapping, 'left', dims);
    var visRight  = getDimForVisualSide(mapping, 'right', dims);

    var textBottom = getTextForVisualSide(mapping, 'bottom', sideTextsInput);
    var textTop    = getTextForVisualSide(mapping, 'top', sideTextsInput);
    var textLeft   = getTextForVisualSide(mapping, 'left', sideTextsInput);
    var textRight  = getTextForVisualSide(mapping, 'right', sideTextsInput);

    var T = visTop;
    var B = visBottom;
    var H = (visLeft + visRight) / 2;

    var area = calculateArea(T, B, H, isRect);
    var areaSqydInput = document.getElementById('area_sqyd_override');
    var areaSqmInput = document.getElementById('area_sqm_override');
    var plinthInput = document.getElementById('plinth');

    // Self-heal stale manual flags from older saved states.
    autoOverrideSelfHeal(areaSqydInput, area.sqyd);
    autoOverrideSelfHeal(areaSqmInput, area.sqm);
    autoOverrideSelfHeal(plinthInput, area.sqft);

    // Keep auto values in inputs unless user manually overrides.
    if (areaSqydInput && areaSqydInput.dataset.manualOverride !== '1') {
        areaSqydInput.value = area.sqyd.toFixed(2);
    }
    if (areaSqmInput && areaSqmInput.dataset.manualOverride !== '1') {
        areaSqmInput.value = area.sqm.toFixed(2);
    }
    if (plinthInput && plinthInput.dataset.manualOverride !== '1') {
        plinthInput.value = area.sqft.toFixed(2);
    }

    // ============================================================
    // ZONE 1 - HEADER (with block offset)
    // ============================================================
    var zone1Top = MARGIN + (blockOffsets.header.y || 0);

    // Editable labels
    var vendorLabel = document.getElementById('vendor_label').value.toUpperCase() || 'VENDOR';
    var vendeeLabel = document.getElementById('vendee_label').value.toUpperCase() || 'VENDEE';
    var sigVendorLabel = document.getElementById('sig_label_1').value.toUpperCase() || 'SIGNATURE OF ' + vendorLabel;
    var sigVendeeLabel = document.getElementById('sig_label_2').value.toUpperCase() || 'SIGNATURE OF ' + vendeeLabel;

    // Title text (full width, no need to reserve compass space)
    var titleText = document.getElementById('title').value.toUpperCase();
    var titleEndY = svgWrapText(layerText, titleText, MARGIN + PAD, zone1Top + PAD + 15, PAGE_WIDTH - 2 * PAD, textSizes.title + 6, textSizes.title, {
        fontWeight: 'bold', className: 'editable', dataField: 'title'
    });

    // Vendor / Vendee
    var vendorY = titleEndY + textSizes.title + 18;
    var vendorLabelW = svgMeasureText(vendorLabel, textSizes.vendor, 'bold');
    var vendeeLabelW = svgMeasureText(vendeeLabel, textSizes.vendor, 'bold');
    var labelColW = Math.max(vendorLabelW, vendeeLabelW) + 8;
    var colonX = MARGIN + PAD + labelColW;

    // Vendor label + lines (preserve empty lines and leading spaces)
    svgText(layerText, vendorLabel, MARGIN + PAD, vendorY, textSizes.vendor, { fontWeight: 'bold', textDecoration: 'underline', className: 'editable', dataField: 'vendor_label' });
    var vendorText = document.getElementById('vendor').value.toUpperCase();
    var vendorLines = vendorText.split('\n');
    var vendorEndY = vendorY;
    var vendorCurY = vendorY;
    var lineH = textSizes.vendor + 3;
    for (var vli = 0; vli < vendorLines.length; vli++) {
        var vPrefix = vli === 0 ? ': ' : '  ';
        if (vendorLines[vli].trim() === '') {
            // Empty line — just advance Y
            vendorCurY += lineH;
            vendorEndY = vendorCurY;
        } else {
            vendorEndY = svgWrapText(layerText, vPrefix + vendorLines[vli], colonX, vendorCurY, PAGE_WIDTH - labelColW - 100, lineH, textSizes.vendor, {
                className: 'editable', dataField: 'vendor'
            });
            vendorCurY = vendorEndY + lineH;
        }
    }

    // Vendee (preserve empty lines and leading spaces)
    var vendeeY = vendorEndY + textSizes.vendor + 14;
    svgText(layerText, vendeeLabel, MARGIN + PAD, vendeeY, textSizes.vendor, { fontWeight: 'bold', textDecoration: 'underline', className: 'editable', dataField: 'vendee_label' });
    var vendeeLines = document.getElementById('vendees').value.toUpperCase().split('\n');
    var lastVendeeY = vendeeY;
    var vendeeCurY = vendeeY;
    for (var vi = 0; vi < vendeeLines.length; vi++) {
        var prefix = vi === 0 ? ': ' : '  ';
        if (vendeeLines[vi].trim() === '') {
            vendeeCurY += lineH;
            lastVendeeY = vendeeCurY;
        } else {
            lastVendeeY = svgWrapText(layerText, prefix + vendeeLines[vi], colonX, vendeeCurY, PAGE_WIDTH - labelColW - 100, lineH, textSizes.vendor, {
                className: 'editable', dataField: 'vendees'
            });
            vendeeCurY = lastVendeeY + lineH;
        }
    }

    // ============================================================
    // ZONE 2 - DRAWING (left 60%) | SIDEBAR (right 40%)
    // ============================================================
    var zone2Top = lastVendeeY + 2 + (blockOffsets.diagram.y || 0);
    var FOOTER_HEIGHT = 195;
    var zone3Top = A4_HEIGHT - MARGIN - FOOTER_HEIGHT + (blockOffsets.footer.y || 0);
    var zone2Height = zone3Top - zone2Top - 10;

    var PLOT_ZONE_WIDTH = PAGE_WIDTH * 0.6;
    var SIDEBAR_WIDTH = PAGE_WIDTH * 0.4;

    var dimsOutside = document.getElementById('dims_outside').checked;
    var DRAW_MARGIN = 60 + textSizes.dimensions + textSizes.sidetext * 2;
    if (dimsOutside) DRAW_MARGIN += 20;
    var diagramScale = 1 + (blockOffsets.diagram.s || 0) / 100;
    var DRAW_WIDTH = Math.min(300, PLOT_ZONE_WIDTH - 2 * DRAW_MARGIN) * diagramScale;
    var DRAW_HEIGHT = Math.min(350, zone2Height - 2 * DRAW_MARGIN) * diagramScale;

    var drawCenterX = MARGIN + PLOT_ZONE_WIDTH / 2 - 20 + plotPosOffset.x + (blockOffsets.diagram.x || 0);
    var drawCenterY = zone2Top + DRAW_MARGIN + DRAW_HEIGHT / 2 + plotPosOffset.y;

    // ---- COORDINATE SYSTEM (Origin-based, bottom-left = 0,0) ----
    var scaleX = DRAW_WIDTH / Math.max(T, B);
    var scaleY = DRAW_HEIGHT / Math.max(visLeft, visRight);
    var scale = Math.min(scaleX, scaleY) * (1 + plotScaleAdj / 100);

    var plotPts;
    var leftH = visLeft * scale;
    var rightH = visRight * scale;
    var bW = B * scale;
    var tW = T * scale;

    if (isRect) {
        plotPts = [
            { x: 0, y: 0 },
            { x: bW, y: 0 },
            { x: bW, y: leftH },
            { x: 0, y: leftH }
        ];
    } else {
        var trapAlign = document.getElementById('trap_align').value;
        var trapVAlign = document.getElementById('trap_valign').value;

        // Horizontal offset for top edge (when T != B)
        var topOffsetX = 0;
        if (trapAlign === 'right') {
            topOffsetX = bW - tW;
        } else if (trapAlign === 'center') {
            topOffsetX = (bW - tW) / 2;
        } else if (trapAlign === 'custom') {
            var customH = (parseFloat(document.getElementById('trap_offset_h').value) || 0) * scale;
            topOffsetX = (tW > bW) ? -customH : customH;
        }

        // Vertical offset (when leftH != rightH)
        var maxH = Math.max(leftH, rightH);
        var leftBottomY = 0, rightBottomY = 0;
        var leftTopY = leftH, rightTopY = rightH;

        if (trapVAlign === 'top') {
            leftBottomY = maxH - leftH;
            rightBottomY = maxH - rightH;
            leftTopY = maxH;
            rightTopY = maxH;
        } else if (trapVAlign === 'center') {
            leftBottomY = (maxH - leftH) / 2;
            rightBottomY = (maxH - rightH) / 2;
            leftTopY = leftBottomY + leftH;
            rightTopY = rightBottomY + rightH;
        } else if (trapVAlign === 'custom') {
            var customV = (parseFloat(document.getElementById('trap_offset_v').value) || 0) * scale;
            if (leftH < rightH) {
                leftBottomY = customV;
                leftTopY = customV + leftH;
            } else {
                rightBottomY = customV;
                rightTopY = customV + rightH;
            }
        }
        // bottom: default — bottom flat, top slopes

        plotPts = [
            { x: 0, y: leftBottomY },
            { x: bW, y: rightBottomY },
            { x: topOffsetX + tW, y: rightTopY },
            { x: topOffsetX, y: leftTopY }
        ];
    }

    // Bounding box for centering
    var minPX = plotPts[0].x, maxPX = plotPts[0].x;
    var minPY = plotPts[0].y, maxPY = plotPts[0].y;
    for (var pi = 1; pi < 4; pi++) {
        if (plotPts[pi].x < minPX) minPX = plotPts[pi].x;
        if (plotPts[pi].x > maxPX) maxPX = plotPts[pi].x;
        if (plotPts[pi].y < minPY) minPY = plotPts[pi].y;
        if (plotPts[pi].y > maxPY) maxPY = plotPts[pi].y;
    }
    var plotW = maxPX - minPX;
    var plotH = maxPY - minPY;

    var offsetX = drawCenterX - (minPX + plotW / 2);
    var offsetY = drawCenterY + (minPY + plotH / 2);

    function toCanvas(pt) {
        return { x: pt.x + offsetX, y: offsetY - pt.y };
    }

    var canvasPts = [];
    for (var ci = 0; ci < 4; ci++) {
        canvasPts.push(toCanvas(plotPts[ci]));
    }

    // ---- Draw plot border in RED (Layer: Plot) ----
    var polyPoints = canvasPts.map(function(p) { return p.x + ',' + p.y; }).join(' ');
    svgElem('polygon', {
        points: polyPoints,
        fill: 'none', stroke: 'red', 'stroke-width': 2.5
    }, layerPlot);

    var plotCenterCanvas = {
        x: (canvasPts[0].x + canvasPts[1].x + canvasPts[2].x + canvasPts[3].x) / 4,
        y: (canvasPts[0].y + canvasPts[1].y + canvasPts[2].y + canvasPts[3].y) / 4
    };

    // ---- Plot center text (name/label) ----
    var plotCenterText = document.getElementById('plot_center_txt').value.toUpperCase();
    svgText(layerPlot, plotCenterText, plotCenterCanvas.x, plotCenterCanvas.y, textSizes.plotcenter, {
        fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'middle',
        className: 'editable', dataField: 'plot_center_txt'
    });
    // Underline below plot name
    var plotNameW = svgMeasureText(plotCenterText, textSizes.plotcenter, 'bold');
    svgElem('line', {
        x1: plotCenterCanvas.x - plotNameW / 2, y1: plotCenterCanvas.y + 5,
        x2: plotCenterCanvas.x + plotNameW / 2, y2: plotCenterCanvas.y + 5,
        stroke: '#000', 'stroke-width': 0.6
    }, layerPlot);

    // ---- Area text inside plot (optional) ----
    var showAreaInPlot = document.getElementById('show_area_in_plot').checked;
    var areaSqydOverride = parseFloat(areaSqydInput ? areaSqydInput.value : '');
    var areaSqmOverride = parseFloat(areaSqmInput ? areaSqmInput.value : '');
    var displaySqyd = isNaN(areaSqydOverride) ? area.sqyd : areaSqydOverride;
    var displaySqm = isNaN(areaSqmOverride) ? area.sqm : areaSqmOverride;

    if (showAreaInPlot) {
        svgText(layerPlot, '(Sq.Yds ' + displaySqyd.toFixed(2) + ')', plotCenterCanvas.x, plotCenterCanvas.y + 18, textSizes.plotcenter - 2, {
            textAnchor: 'middle', dominantBaseline: 'middle'
        });
    }

    // ---- Room inside plot (optional) ----
    var showRoom = document.getElementById('show_room').checked;
    if (showRoom) {
        var roomW = toFeet(document.getElementById('room_w_ft').value, document.getElementById('room_w_in').value);
        var roomH = toFeet(document.getElementById('room_h_ft').value, document.getElementById('room_h_in').value);
        var roomScaledW = roomW * scale;
        var roomScaledH = roomH * scale;
        var roomLabel = document.getElementById('room_label').value || 'ROOM';

        // Room at top-left corner with inset padding
        // For trapezoids, compute safe left boundary at each Y level
        var roomPad = 15;
        var roomY = canvasPts[3].y + roomPad;
        var roomBottomY = roomY + roomScaledH;

        // Left edge: interpolate from canvasPts[3](top-left) to canvasPts[0](bottom-left)
        // Find leftmost X at roomY and roomBottomY, take the rightmost (most inward)
        var leftTop = canvasPts[3], leftBot = canvasPts[0];
        var leftEdgeH = leftBot.y - leftTop.y;
        var leftXAtRoomTop = (leftEdgeH > 0) ? leftTop.x + (leftBot.x - leftTop.x) * ((roomY - leftTop.y) / leftEdgeH) : leftTop.x;
        var leftXAtRoomBot = (leftEdgeH > 0) ? leftTop.x + (leftBot.x - leftTop.x) * ((roomBottomY - leftTop.y) / leftEdgeH) : leftTop.x;
        var safeLeftX = Math.max(leftXAtRoomTop, leftXAtRoomBot) + roomPad;

        // Right edge: interpolate from canvasPts[2](top-right) to canvasPts[1](bottom-right)
        var rightTop = canvasPts[2], rightBot = canvasPts[1];
        var rightEdgeH = rightBot.y - rightTop.y;
        var rightXAtRoomTop = (rightEdgeH > 0) ? rightTop.x + (rightBot.x - rightTop.x) * ((roomY - rightTop.y) / rightEdgeH) : rightTop.x;
        var rightXAtRoomBot = (rightEdgeH > 0) ? rightTop.x + (rightBot.x - rightTop.x) * ((roomBottomY - rightTop.y) / rightEdgeH) : rightTop.x;
        var safeRightX = Math.min(rightXAtRoomTop, rightXAtRoomBot) - roomPad;

        // Bottom edge: don't exceed bottom of plot
        var plotBottomY = Math.max(canvasPts[0].y, canvasPts[1].y) - roomPad;

        var roomX = safeLeftX;

        // Clamp room width and height to stay inside plot
        var maxRoomW = safeRightX - safeLeftX;
        var maxRoomH = plotBottomY - roomY;
        var clampedW = Math.min(roomScaledW, maxRoomW);
        var clampedH = Math.min(roomScaledH, maxRoomH);
        if (clampedW < 10) clampedW = 10;
        if (clampedH < 10) clampedH = 10;

        // Outer rect
        svgElem('rect', {
            x: roomX, y: roomY, width: clampedW, height: clampedH,
            fill: 'none', stroke: '#000', 'stroke-width': 0.8
        }, layerPlot);
        // Inner rect (double line effect)
        var dbl = 3;
        if (clampedW > 2 * dbl + 4 && clampedH > 2 * dbl + 4) {
            svgElem('rect', {
                x: roomX + dbl, y: roomY + dbl, width: clampedW - 2 * dbl, height: clampedH - 2 * dbl,
                fill: 'none', stroke: '#000', 'stroke-width': 0.8
            }, layerPlot);
        }

        // Room label centered inside
        svgText(layerPlot, roomLabel.toUpperCase(), roomX + clampedW / 2, roomY + clampedH / 2, textSizes.plotcenter - 2, {
            fontWeight: 'bold', textAnchor: 'middle', dominantBaseline: 'middle'
        });

        // Room dimension text
        svgText(layerDimensions, ftStr(roomW), roomX + clampedW / 2, roomY + clampedH + 18, textSizes.dimensions - 1, {
            textAnchor: 'middle'
        });
        svgText(layerDimensions, ftStr(roomH), 0, 0, textSizes.dimensions - 1, {
            textAnchor: 'middle',
            transform: 'translate(' + (roomX + clampedW + 14) + ',' + (roomY + clampedH / 2) + ') rotate(-90)'
        });
    }

    // ---- Compute edge normals ----
    var leftMid = { x: (canvasPts[0].x + canvasPts[3].x) / 2, y: (canvasPts[0].y + canvasPts[3].y) / 2 };
    var leftDx = canvasPts[3].x - canvasPts[0].x;
    var leftDy = canvasPts[3].y - canvasPts[0].y;
    var leftAngle = Math.atan2(leftDy, leftDx) * 180 / Math.PI;
    var leftLen = Math.sqrt(leftDx * leftDx + leftDy * leftDy);
    var leftNorm = { x: leftDy / leftLen, y: -leftDx / leftLen };
    var toCenterL = { x: plotCenterCanvas.x - leftMid.x, y: plotCenterCanvas.y - leftMid.y };
    if (leftNorm.x * toCenterL.x + leftNorm.y * toCenterL.y < 0) {
        leftNorm.x = -leftNorm.x; leftNorm.y = -leftNorm.y;
    }

    var rightMid = { x: (canvasPts[1].x + canvasPts[2].x) / 2, y: (canvasPts[1].y + canvasPts[2].y) / 2 };
    var rightDx = canvasPts[2].x - canvasPts[1].x;
    var rightDy = canvasPts[2].y - canvasPts[1].y;
    var rightAngle = Math.atan2(rightDy, rightDx) * 180 / Math.PI;
    var rightLen = Math.sqrt(rightDx * rightDx + rightDy * rightDy);
    var rightNorm = { x: rightDy / rightLen, y: -rightDx / rightLen };
    var toCenterR = { x: plotCenterCanvas.x - rightMid.x, y: plotCenterCanvas.y - rightMid.y };
    if (rightNorm.x * toCenterR.x + rightNorm.y * toCenterR.y < 0) {
        rightNorm.x = -rightNorm.x; rightNorm.y = -rightNorm.y;
    }

    // Outward normals
    var leftOutNorm = { x: -leftNorm.x, y: -leftNorm.y };
    var rightOutNorm = { x: -rightNorm.x, y: -rightNorm.y };

    // ---- DIMENSIONS (Inside or Outside) ----
    var OUTSIDE_DIM_OFFSET = 18;
    var SIDE_TEXT_FROM_DIM_GAP = 34; // keep labels equally spaced from outside dimension line
    if (dimsOutside) {
        // Outside dimensions with extension lines + tick marks
        var DIM_OFFSET = OUTSIDE_DIM_OFFSET;
        // Bottom
        drawDimensionLine(canvasPts[0], canvasPts[1], DIM_OFFSET, { x: 0, y: 1 }, ftStr(visBottom));
        // Top
        drawDimensionLine(canvasPts[3], canvasPts[2], DIM_OFFSET, { x: 0, y: -1 }, ftStr(visTop));
        // Left
        drawDimensionLine(canvasPts[0], canvasPts[3], DIM_OFFSET, leftOutNorm, ftStr(visLeft));
        // Right
        drawDimensionLine(canvasPts[1], canvasPts[2], DIM_OFFSET, rightOutNorm, ftStr(visRight));
    } else {
        // Inside dimensions (text placed inside the plot)
        var DIM_INSET = 15;

        // Bottom
        var bottomMid = { x: (canvasPts[0].x + canvasPts[1].x) / 2, y: (canvasPts[0].y + canvasPts[1].y) / 2 };
        svgText(layerDimensions, ftStr(visBottom), bottomMid.x, bottomMid.y - DIM_INSET, textSizes.dimensions, {
            textAnchor: 'middle', dominantBaseline: 'middle'
        });

        // Top
        var topMid = { x: (canvasPts[3].x + canvasPts[2].x) / 2, y: (canvasPts[3].y + canvasPts[2].y) / 2 };
        svgText(layerDimensions, ftStr(visTop), topMid.x, topMid.y + DIM_INSET, textSizes.dimensions, {
            textAnchor: 'middle', dominantBaseline: 'middle'
        });

        // Left
        svgText(layerDimensions, ftStr(visLeft), 0, 0, textSizes.dimensions, {
            textAnchor: 'middle', dominantBaseline: 'middle',
            transform: 'translate(' + (leftMid.x + leftNorm.x * DIM_INSET) + ',' + (leftMid.y + leftNorm.y * DIM_INSET) + ') rotate(' + leftAngle + ')'
        });

        // Right
        svgText(layerDimensions, ftStr(visRight), 0, 0, textSizes.dimensions, {
            textAnchor: 'middle', dominantBaseline: 'middle',
            transform: 'translate(' + (rightMid.x + rightNorm.x * DIM_INSET) + ',' + (rightMid.y + rightNorm.y * DIM_INSET) + ') rotate(' + rightAngle + ')'
        });
    }

    // ---- ROAD & SIDE TEXTS ----
    // For outside dimensions, anchor label gap to the same DIM_OFFSET baseline for all sides
    var INSIDE_SIDE_TEXT_GAP = 38;
    var SIDE_TEXT_GAP = dimsOutside ? (OUTSIDE_DIM_OFFSET + SIDE_TEXT_FROM_DIM_GAP) : INSIDE_SIDE_TEXT_GAP;
    updateBoundaryInputLabels();

    var roadN = document.getElementById('road_north').checked;
    var roadS = document.getElementById('road_south').checked;
    var roadE = document.getElementById('road_east').checked;
    var roadW = document.getElementById('road_west').checked;

    // Side texts — skip sides that have road enabled (road indicator shows the text instead)
    var sideVisualAdjust = { N: -8, W: -12, E: 8, S: 10 };
    if (!roadN) drawSideText(canvasPts[3], canvasPts[2], SIDE_TEXT_GAP + sideVisualAdjust.N + sideOffsets.N, { x: 0, y: -1 }, textTop, textSizes.sidetext, 'north_txt');
    if (!roadW) drawSideText(canvasPts[0], canvasPts[3], SIDE_TEXT_GAP + sideVisualAdjust.W + sideOffsets.W, leftOutNorm, textLeft, textSizes.sidetext, 'west_txt');
    if (!roadE) drawSideText(canvasPts[1], canvasPts[2], SIDE_TEXT_GAP + sideVisualAdjust.E + sideOffsets.E, rightOutNorm, textRight, textSizes.sidetext, 'east_txt');
    if (!roadS) drawSideText(canvasPts[0], canvasPts[1], SIDE_TEXT_GAP + sideVisualAdjust.S + sideOffsets.S, { x: 0, y: 1 }, textBottom, textSizes.sidetext, 'south_txt');

    // Road indicators (pass side offset for position adjustment)
    if (roadN) drawRoadIndicator(canvasPts[3], canvasPts[2], textTop, 'top', scale, sideOffsets.N, dimsOutside);
    if (roadS) drawRoadIndicator(canvasPts[0], canvasPts[1], textBottom, 'bottom', scale, sideOffsets.S, dimsOutside);
    if (roadE) drawRoadIndicator(canvasPts[1], canvasPts[2], textRight, 'right', scale, sideOffsets.E, dimsOutside);
    if (roadW) drawRoadIndicator(canvasPts[0], canvasPts[3], textLeft, 'left', scale, sideOffsets.W, dimsOutside);

    // ============================================================
    // RIGHT SIDEBAR (40%) - Compass block + References block
    // ============================================================
    var fs = textSizes.sidetext;
    var fv = textSizes.vendor;
    var lineGap = fs + 5;

    var sidebarX = MARGIN + PLOT_ZONE_WIDTH + 25 + (blockOffsets.area.x || 0);
    var sidebarW = SIDEBAR_WIDTH - 10;
    var sidebarTop = zone2Top + 24;

    // Block 2 (right): Compass
    var compassCX = sidebarX + (sidebarW / 2) + (blockOffsets.compass.x || 0);
    var compassCY = sidebarTop + 44 + (blockOffsets.compass.y || 0);
    drawCompass(layerText, compassCX, compassCY, 24, getCompassTopDirection());

    // Block 3 (right): References below compass
    var sidebarY = sidebarTop + 104 + (blockOffsets.area.y || 0);

    // REFERENCES heading
    svgText(layerText, 'REFERENCES', sidebarX, sidebarY + fv, fv, { fontWeight: 'bold', textDecoration: 'underline' });

    // Including with red box
    var inclY = sidebarY + fv + 8 + fs;
    svgText(layerText, 'INCLUDING :', sidebarX, inclY, fs, { fontWeight: 'bold' });
    svgElem('rect', {
        x: sidebarX + svgMeasureText('INCLUDING : ', fs, 'bold') + 4, y: inclY - fs + 2, width: 16, height: 10,
        fill: 'none', stroke: 'red', 'stroke-width': 1.5
    }, layerText);

    // Area: Sq.Yds and Sq.Mts
    var areaY = inclY + lineGap + 6;
    var areaColonX = sidebarX + svgMeasureText('TOTAL AREA ', fs) + 4;
    var areaValueX = areaColonX + svgMeasureText(': ', fs) + 2;

    svgText(layerText, 'TOTAL AREA', sidebarX, areaY, fs, {});
    svgText(layerText, ':', areaColonX, areaY, fs, {});
    svgText(layerText, displaySqyd.toFixed(2) + ' Sq.Yards', areaValueX, areaY, fs, {
        className: 'editable', dataField: 'area_sqyd_override'
    });

    svgText(layerText, '( OR )', sidebarX + 30, areaY + lineGap, fs, {});
    svgText(layerText, ':', areaColonX, areaY + lineGap, fs, {});
    svgText(layerText, displaySqm.toFixed(2) + ' Sq.Mtrs', areaValueX, areaY + lineGap, fs, {
        className: 'editable', dataField: 'area_sqm_override'
    });

    // Plinth (if interior shown)
    var sidebarContentY = areaY + lineGap * 2 + 4;
    if (document.getElementById('showInterior').value === 'true') {
        var plinthArea = parseFloat(plinthInput ? plinthInput.value : '') || 0;
        if (plinthArea > 0) {
            svgText(layerText, 'PLINTH AREA', sidebarX, sidebarContentY, fs, {});
            svgText(layerText, ':', areaColonX, sidebarContentY, fs, {});
            svgText(layerText, plinthArea.toFixed(2) + ' Sq.Fts.', areaValueX, sidebarContentY, fs, {
                className: 'editable', dataField: 'plinth'
            });
            sidebarContentY += lineGap;
        }
        sidebarContentY += 8;
    } else {
        sidebarContentY += 8;
    }


    sidebarContentY += 8;

    // ============================================================
    // ZONE 3 - BOTTOM (Witnesses + Signatures)
    // ============================================================
    var witY = zone3Top + 5; // footer Y already includes blockOffsets.footer.y via zone3Top

    svgText(layerText, 'WITNESSES', MARGIN + PAD, witY + fv, fv, { fontWeight: 'bold', textDecoration: 'underline' });

    var wit1 = document.getElementById('wit1').value;
    var wit2 = document.getElementById('wit2').value;
    var witLine1 = witY + fv + 22 + fs;
    var witLine2 = witLine1 + lineGap + 20;

    svgText(layerText, '1.', MARGIN + PAD, witLine1, fs, { fontWeight: 'bold', textDecoration: 'underline' });
    svgText(layerText, wit1, MARGIN + PAD + 15, witLine1, fs, { className: 'editable', dataField: 'wit1' });
    svgText(layerText, '2.', MARGIN + PAD, witLine2, fs, { fontWeight: 'bold', textDecoration: 'underline' });
    svgText(layerText, wit2, MARGIN + PAD + 15, witLine2, fs, { className: 'editable', dataField: 'wit2' });

    // SIGNATURE OF VENDOR (right side, top)
    svgText(layerText, sigVendorLabel, sidebarX, witY + fv - 35, fv, { fontWeight: 'bold', textDecoration: 'underline', className: 'editable', dataField: 'sig_label_1' });

    // SIGNATURE OF VENDEE (right side, below vendor)
    svgText(layerText, sigVendeeLabel, sidebarX, witY + fv + 65, fv, { fontWeight: 'bold', textDecoration: 'underline', className: 'editable', dataField: 'sig_label_2' });
}

// ==================== PDF EXPORT (Vector, selectable text) ====================
function downloadPDF() {
    var jsPDF = window.jspdf.jsPDF;
    var svgElement = document.getElementById('mapSvg');

    var pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT]
    });

    pdf.svg(svgElement, {
        x: 0, y: 0,
        width: A4_WIDTH, height: A4_HEIGHT
    }).then(function() {
        pdf.save('plot-map.pdf');
    });
}

// ==================== CLICK-TO-EDIT TEXT ====================
// Map each data-field to its accordion section ID
var fieldToSection = {
    title: 'sec-header',
    vendor: 'sec-header',
    vendees: 'sec-header',
    vendor_label: 'sec-header',
    vendee_label: 'sec-header',
    compass_top: 'sec-compass',
    north_txt: 'sec-boundaries',
    south_txt: 'sec-boundaries',
    east_txt: 'sec-boundaries',
    west_txt: 'sec-boundaries',
    plot_center_txt: 'sec-boundaries',
    open_area_txt: 'sec-boundaries',
    area_sqyd_override: 'sec-dimensions',
    area_sqm_override: 'sec-dimensions',
    plinth: 'sec-dimensions',
    room_label: 'sec-boundaries',
    sig_label_1: 'sec-footer',
    sig_label_2: 'sec-footer',
    wit1: 'sec-footer',
    wit2: 'sec-footer'
};

(function() {
    var svgEl = document.getElementById('mapSvg');
    function handleEditableTap(target) {
        var field = target.getAttribute('data-field');
        if (!field) return;

        var inputEl = document.getElementById(field);
        if (!inputEl) return;

        // On mobile, switch to controls tab first
        if (window.innerWidth <= 1024) {
            switchMobileTab('controls');
        }

        // Open the corresponding accordion section if closed
        var sectionId = fieldToSection[field];
        if (sectionId) {
            var section = document.getElementById(sectionId);
            if (section && !section.classList.contains('open')) {
                section.classList.add('open');
            }
        }

        // Delay to let tab switch + section expand, then scroll and focus
        setTimeout(function() {
            inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputEl.focus();
            if (inputEl.select) inputEl.select();

            inputEl.style.borderColor = '#FFD93D';
            inputEl.style.boxShadow = '0 0 8px rgba(255, 217, 61, 0.5)';
            setTimeout(function() {
                inputEl.style.borderColor = '';
                inputEl.style.boxShadow = '';
            }, 2000);
        }, 300);
    }

    // Desktop: dblclick — show floating adjust toolbar
    svgEl.addEventListener('dblclick', function(e) {
        var target = e.target.closest('text.editable');
        if (!target) { taClose(); return; }
        var field = target.getAttribute('data-field');
        if (field) {
            taOpen(field, e.clientX, e.clientY);
        }
        handleEditableTap(target);
    });

    // Mobile: double-tap detection
    var lastTap = 0;
    var lastTarget = null;
    svgEl.addEventListener('touchend', function(e) {
        var target = e.target.closest('text.editable');
        if (!target) {
            lastTap = 0;
            lastTarget = null;
            return;
        }

        var now = Date.now();
        if (lastTarget === target && now - lastTap < 400) {
            e.preventDefault();
            handleEditableTap(target);
            lastTap = 0;
            lastTarget = null;
        } else {
            lastTap = now;
            lastTarget = target;
        }
    });
})();

// ==================== SAVED PLOTS MANAGEMENT ====================
var PLOTS_KEY = 'plotGenerator_savedPlots';
var ACTIVE_PLOT_KEY = 'plotGenerator_activePlot';

function getSavedPlots() {
    try {
        return JSON.parse(localStorage.getItem(PLOTS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function setSavedPlots(plots) {
    localStorage.setItem(PLOTS_KEY, JSON.stringify(plots));
}

function getActivePlotId() {
    return localStorage.getItem(ACTIVE_PLOT_KEY) || null;
}

function setActivePlotId(id) {
    localStorage.setItem(ACTIVE_PLOT_KEY, id);
}

function collectFormData() {
    var compassTopEl = document.querySelector('input[name="compass_top"]:checked');
    return {
        mode: getMode(),
        n_ft: document.getElementById('n_ft').value,
        n_in: document.getElementById('n_in').value,
        s_ft: document.getElementById('s_ft').value,
        s_in: document.getElementById('s_in').value,
        e_ft: document.getElementById('e_ft').value,
        e_in: document.getElementById('e_in').value,
        w_ft: document.getElementById('w_ft').value,
        w_in: document.getElementById('w_in').value,
        road_north: document.getElementById('road_north').checked,
        road_south: document.getElementById('road_south').checked,
        road_east: document.getElementById('road_east').checked,
        road_west: document.getElementById('road_west').checked,
        compass_top: compassTopEl ? compassTopEl.value : 'N',
        title: document.getElementById('title').value,
        vendor: document.getElementById('vendor').value,
        vendees: document.getElementById('vendees').value,
        vendor_label: document.getElementById('vendor_label').value,
        vendee_label: document.getElementById('vendee_label').value,
        sig_label_1: document.getElementById('sig_label_1').value,
        sig_label_2: document.getElementById('sig_label_2').value,
        north_txt: document.getElementById('north_txt').value,
        south_txt: document.getElementById('south_txt').value,
        east_txt: document.getElementById('east_txt').value,
        west_txt: document.getElementById('west_txt').value,
        plot_center_txt: document.getElementById('plot_center_txt').value,
        open_area_txt: document.getElementById('open_area_txt').value,
        area_sqyd_override: document.getElementById('area_sqyd_override').value,
        area_sqm_override: document.getElementById('area_sqm_override').value,
        area_sqyd_manual: (document.getElementById('area_sqyd_override').dataset.manualOverride === '1'),
        area_sqm_manual: (document.getElementById('area_sqm_override').dataset.manualOverride === '1'),
        plinth: document.getElementById('plinth').value,
        plinth_manual: (document.getElementById('plinth').dataset.manualOverride === '1'),
        wit1: document.getElementById('wit1').value,
        wit2: document.getElementById('wit2').value,
        showInterior: document.getElementById('showInterior').value === 'true',
        dims_outside: document.getElementById('dims_outside').checked,
        trap_align: document.getElementById('trap_align').value,
        trap_valign: document.getElementById('trap_valign').value,
        trap_offset_h: document.getElementById('trap_offset_h').value,
        trap_offset_v: document.getElementById('trap_offset_v').value,
        show_room: document.getElementById('show_room').checked,
        room_label: document.getElementById('room_label').value,
        room_w_ft: document.getElementById('room_w_ft').value,
        room_w_in: document.getElementById('room_w_in').value,
        room_h_ft: document.getElementById('room_h_ft').value,
        room_h_in: document.getElementById('room_h_in').value,
        show_area_in_plot: document.getElementById('show_area_in_plot').checked,
        textSizes: JSON.parse(JSON.stringify(textSizes)),
        compassOffset: { x: compassOffset.x, y: compassOffset.y },
        sideOffsets: { N: sideOffsets.N, S: sideOffsets.S, E: sideOffsets.E, W: sideOffsets.W },
        plotPosOffset: { x: plotPosOffset.x, y: plotPosOffset.y },
        plotScaleAdj: plotScaleAdj,
        zoom: currentZoom,
        textOverrides: JSON.parse(JSON.stringify(textOverrides)),
        blockOffsets: JSON.parse(JSON.stringify(blockOffsets))
    };
}

function applyFormData(data) {
    if (data.mode === 'trapezoid') {
        document.getElementById('modeTrap').checked = true;
    } else {
        document.getElementById('modeRect').checked = true;
    }

    var dimFields = ['n_ft','n_in','s_ft','s_in','e_ft','e_in','w_ft','w_in'];
    dimFields.forEach(function(id) {
        if (data[id] !== undefined) document.getElementById(id).value = data[id];
    });

    var textFields = [
        'title','vendor','vendees','vendor_label','vendee_label','sig_label_1','sig_label_2',
        'north_txt','south_txt','east_txt','west_txt',
        'plot_center_txt','open_area_txt','area_sqyd_override','area_sqm_override','plinth','wit1','wit2',
        'room_label','room_w_ft','room_w_in','room_h_ft','room_h_in'];
    textFields.forEach(function(id) {
        if (data[id] !== undefined) document.getElementById(id).value = data[id];
    });
    restoreAutoOverrideFlags(data);

    // Restore road checkboxes
    ['road_north','road_south','road_east','road_west'].forEach(function(id) {
        if (data[id] !== undefined) document.getElementById(id).checked = data[id];
    });
    if (data.compass_top) {
        var cEl = document.getElementById('compass_top_' + data.compass_top.toLowerCase());
        if (cEl) cEl.checked = true;
    }

    if (data.showInterior !== undefined) {
        document.getElementById('showInterior').value = data.showInterior ? 'true' : 'false';
    }

    // Checkbox fields
    if (data.dims_outside !== undefined) {
        document.getElementById('dims_outside').checked = data.dims_outside;
    }
    if (data.trap_align) {
        document.getElementById('trap_align').value = data.trap_align;
    }
    if (data.trap_valign) {
        document.getElementById('trap_valign').value = data.trap_valign;
    }
    if (data.trap_offset_h) {
        document.getElementById('trap_offset_h').value = data.trap_offset_h;
    }
    if (data.trap_offset_v) {
        document.getElementById('trap_offset_v').value = data.trap_offset_v;
    }
    if (data.show_room !== undefined) {
        document.getElementById('show_room').checked = data.show_room;
        document.getElementById('room_fields').style.display = data.show_room ? 'block' : 'none';
    }
    if (data.show_area_in_plot !== undefined) {
        document.getElementById('show_area_in_plot').checked = data.show_area_in_plot;
    }
    if (data.sideOffsets) {
        sideOffsets.N = data.sideOffsets.N || 0;
        sideOffsets.S = data.sideOffsets.S || 0;
        sideOffsets.E = data.sideOffsets.E || 0;
        sideOffsets.W = data.sideOffsets.W || 0;
        ['N','S','E','W'].forEach(function(s) { document.getElementById('side_off_' + s).textContent = sideOffsets[s]; });
    }

    if (data.textSizes) {
        for (var key in data.textSizes) {
            if (textSizes.hasOwnProperty(key)) {
                var val = data.textSizes[key];
                if (key === 'title') val = Math.max(12, Math.min(18, val));
                else val = Math.max(10, Math.min(14, val));
                textSizes[key] = val;
            }
        }
    }

    if (data.textOverrides) {
        textOverrides = data.textOverrides;
    }

    if (data.zoom) {
        currentZoom = data.zoom;
        document.getElementById('zoom_value').textContent = currentZoom + '%';
        applyZoom();
    }

    if (data.blockOffsets) {
        ['header','diagram','area','compass','footer'].forEach(function(blk) {
            if (data.blockOffsets[blk]) {
                blockOffsets[blk] = data.blockOffsets[blk];
                ['x','y','s'].forEach(function(axis) {
                    var el = document.getElementById('blk_' + blk + '_' + axis);
                    if (el) el.textContent = blockOffsets[blk][axis] || 0;
                });
            }
        });
    }

    updateModeUI();
    initBodySizeDisplay();
    drawMap();
}

function generatePlotName() {
    // Use whatever is in the plot name input
    var name = document.getElementById('plotName').value.trim();
    if (name) return name;
    // Auto-generate "Plot N"
    var plots = getSavedPlots();
    return 'Plot ' + (plots.length + 1);
}

function getNextPlotNumber() {
    var plots = getSavedPlots();
    var maxNum = 0;
    for (var i = 0; i < plots.length; i++) {
        var match = plots[i].name.match(/^Plot (\d+)$/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    }
    return maxNum + 1;
}

function toggleHistory() {
    var panel = document.getElementById('historyPanel');
    var btn = document.getElementById('historyBtn');
    if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        btn.classList.remove('active');
    } else {
        renderPlotList();
        panel.classList.add('show');
        btn.classList.add('active');
    }
}

function updatePlotName() {
    var activeId = getActivePlotId();
    if (!activeId) return;
    var plots = getSavedPlots();
    var name = document.getElementById('plotName').value.trim();
    if (!name) return;
    for (var i = 0; i < plots.length; i++) {
        if (plots[i].id === activeId) {
            plots[i].name = name;
            setSavedPlots(plots);
            break;
        }
    }
}

// ==================== MOBILE TAB SWITCHING ====================
function switchMobileTab(tab) {
    var controls = document.querySelector('.controls-panel');
    var canvas = document.querySelector('.canvas-container');
    var tabControls = document.getElementById('tabControls');
    var tabPreview = document.getElementById('tabPreview');

    if (tab === 'controls') {
        controls.classList.remove('mobile-hidden');
        canvas.classList.add('mobile-hidden');
        tabControls.classList.add('active');
        tabPreview.classList.remove('active');
    } else {
        controls.classList.add('mobile-hidden');
        canvas.classList.remove('mobile-hidden');
        tabControls.classList.remove('active');
        tabPreview.classList.add('active');
        // Redraw to ensure SVG renders correctly after becoming visible
        setTimeout(function() { drawMap(); }, 50);
    }
}

// Close history panel when clicking outside
document.addEventListener('click', function(e) {
    var panel = document.getElementById('historyPanel');
    var btn = document.getElementById('historyBtn');
    if (panel && panel.classList.contains('show') && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        panel.classList.remove('show');
        btn.classList.remove('active');
    }
});

function savePlot() {
    try {
        var plots = getSavedPlots();
        var activeId = getActivePlotId();
        var data = collectFormData();
        var now = new Date().toISOString();
        var plotNameInput = document.getElementById('plotName');
        var name = plotNameInput.value.trim() || ('Plot ' + getNextPlotNumber());
        var entry;

        if (activeId) {
            var found = false;
            for (var i = 0; i < plots.length; i++) {
                if (plots[i].id === activeId) {
                    plots[i].data = data;
                    plots[i].name = name;
                    plots[i].updatedAt = now;
                    found = true;
                    break;
                }
            }
            if (!found) {
                entry = { id: 'plot_' + Date.now(), name: name, data: data, createdAt: now, updatedAt: now };
                plots.unshift(entry);
                setActivePlotId(entry.id);
            }
        } else {
            entry = { id: 'plot_' + Date.now(), name: name, data: data, createdAt: now, updatedAt: now };
            plots.unshift(entry);
            setActivePlotId(entry.id);
        }

        plotNameInput.value = name;
        setSavedPlots(plots);
        saveFormData();
        renderPlotList();

        // Sync plot data to Supabase
        syncPlotDataToSupabase(data);

        // Brief visual feedback — desktop button
        var btn = document.querySelector('.btn-save');
        if (btn) {
            var origText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Saved!';
            btn.style.background = '#28a745';
            btn.style.color = '#fff';
            setTimeout(function() {
                btn.innerHTML = origText;
                btn.style.background = '';
                btn.style.color = '';
            }, 1500);
        }

        // Mobile tab bar feedback
        var tabBtn = document.getElementById('tabSave');
        if (tabBtn) {
            var origTab = tabBtn.innerHTML;
            tabBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Saved!';
            tabBtn.style.color = '#28a745';
            setTimeout(function() {
                tabBtn.innerHTML = origTab;
                tabBtn.style.color = '';
            }, 1500);
        }
    } catch (err) {
        alert('Save failed: ' + err.message);
        console.error('savePlot error:', err);
    }
}

function loadPlot(id) {
    var plots = getSavedPlots();
    for (var i = 0; i < plots.length; i++) {
        if (plots[i].id === id) {
            setActivePlotId(id);
            document.getElementById('plotName').value = plots[i].name;
            applyFormData(plots[i].data);
            saveFormData();
            renderPlotList();
            toggleHistory(); // close panel after selection
            goToEditor();
            return;
        }
    }
}

function deletePlot(id) {
    if (!confirm('Delete this saved plot?')) return;
    var plots = getSavedPlots();
    plots = plots.filter(function(p) { return p.id !== id; });
    setSavedPlots(plots);

    if (getActivePlotId() === id) {
        setActivePlotId(null);
    }
    renderPlotList();
}

function newPlot() {
    resetPlotDefaults();
    setActivePlotId(null);
    updateModeUI();
    drawMap();
    saveFormData();
    renderPlotList();
}

function resetPlotDefaults() {
    // Set new plot name
    document.getElementById('plotName').value = 'Plot ' + getNextPlotNumber();

    // Reset all fields to defaults
    document.getElementById('modeRect').checked = true;
    document.getElementById('n_ft').value = '20';
    document.getElementById('n_in').value = '0';
    document.getElementById('s_ft').value = '20';
    document.getElementById('s_in').value = '0';
    document.getElementById('e_ft').value = '20';
    document.getElementById('e_in').value = '0';
    document.getElementById('w_ft').value = '20';
    document.getElementById('w_in').value = '0';
    // Reset road checkboxes
    ['north','south','east','west'].forEach(function(side) {
        document.getElementById('road_' + side).checked = (side === 'south');
    });
    document.getElementById('compass_top_n').checked = true;
    document.getElementById('title').value = '';
    document.getElementById('vendor').value = '';
    document.getElementById('vendees').value = '';
    document.getElementById('vendor_label').value = 'VENDOR';
    document.getElementById('vendee_label').value = 'VENDEE';
    document.getElementById('sig_label_1').value = 'SIGNATURE OF VENDOR';
    document.getElementById('sig_label_2').value = 'SIGNATURE OF VENDEE';
    document.getElementById('north_txt').value = '';
    document.getElementById('south_txt').value = '';
    document.getElementById('east_txt').value = '';
    document.getElementById('west_txt').value = '';
    document.getElementById('plot_center_txt').value = 'PLOT NO.';
    document.getElementById('open_area_txt').value = '';
    document.getElementById('area_sqyd_override').value = '';
    document.getElementById('area_sqm_override').value = '';
    document.getElementById('plinth').value = '';
    restoreAutoOverrideFlags(null);
    document.getElementById('wit1').value = '';
    document.getElementById('wit2').value = '';
    document.getElementById('showInterior').value = 'true';
    document.getElementById('dims_outside').checked = false;
    document.getElementById('trap_align').value = 'left';
    document.getElementById('trap_valign').value = 'bottom';
    document.getElementById('trap_offset_h').value = '0';
    document.getElementById('trap_offset_v').value = '0';
    document.getElementById('trapAlignHRow').style.display = 'none';
    document.getElementById('trapAlignVRow').style.display = 'none';
    document.getElementById('trapCustomHRow').style.display = 'none';
    document.getElementById('trapCustomVRow').style.display = 'none';
    document.getElementById('trapHelpNote').style.display = 'none';
    document.getElementById('show_room').checked = false;
    document.getElementById('room_fields').style.display = 'none';
    document.getElementById('room_label').value = 'ROOM';
    document.getElementById('room_w_ft').value = '10';
    document.getElementById('room_w_in').value = '0';
    document.getElementById('room_h_ft').value = '10';
    document.getElementById('room_h_in').value = '0';
    document.getElementById('show_area_in_plot').checked = false;
    compassOffset = { x: 0, y: 0 };
    sideOffsets = { N: 0, S: 0, E: 0, W: 0 };
    ['N','S','E','W'].forEach(function(s) { document.getElementById('side_off_' + s).textContent = '0'; });
    blockOffsets = { header: {x:0,y:0,s:0}, diagram: {x:0,y:0,s:0}, area: {x:0,y:0,s:0}, compass: {x:0,y:0,s:0}, footer: {x:0,y:0,s:0} };
    ['header','diagram','area','compass','footer'].forEach(function(blk) {
        ['x','y','s'].forEach(function(axis) {
            var el = document.getElementById('blk_' + blk + '_' + axis);
            if (el) el.textContent = '0';
        });
    });
    plotPosOffset = { x: 0, y: 0 };
    plotScaleAdj = 0;
    var plotPosXEl = document.getElementById('plot_pos_x');
    var plotPosYEl = document.getElementById('plot_pos_y');
    var plotScaleEl = document.getElementById('plot_scale_val');
    var compassXEl = document.getElementById('compass_x_val');
    var compassYEl = document.getElementById('compass_y_val');
    if (plotPosXEl) plotPosXEl.textContent = '0';
    if (plotPosYEl) plotPosYEl.textContent = '0';
    if (plotScaleEl) plotScaleEl.textContent = '0';
    if (compassXEl) compassXEl.textContent = '0';
    if (compassYEl) compassYEl.textContent = '0';
    textOverrides = {};
}

function formatDate(isoStr) {
    var d = new Date(isoStr);
    var day = d.getDate().toString().padStart(2, '0');
    var mon = (d.getMonth() + 1).toString().padStart(2, '0');
    var yr = d.getFullYear();
    var hr = d.getHours().toString().padStart(2, '0');
    var min = d.getMinutes().toString().padStart(2, '0');
    return day + '/' + mon + '/' + yr + ' ' + hr + ':' + min;
}

function renderPlotList() {
    var container = document.getElementById('historyList');
    if (!container) return;
    var plots = getSavedPlots();
    var activeId = getActivePlotId();

    if (plots.length === 0) {
        container.innerHTML = '<div class="history-empty">No saved plots yet.<br>Click "Save Plot" to save your work.</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < plots.length; i++) {
        var p = plots[i];
        var isActive = p.id === activeId;
        html += '<div class="history-item' + (isActive ? ' active' : '') + '" onclick="loadPlot(\'' + p.id + '\')">';
        html += '<div class="hi-icon">' + (i + 1) + '</div>';
        html += '<div class="hi-info">';
        html += '<div class="hi-name">' + escapeHtml(p.name) + '</div>';
        html += '<div class="hi-time">' + formatDate(p.updatedAt || p.createdAt) + '</div>';
        html += '</div>';
        html += '<div class="hi-actions">';
        html += '<button onclick="event.stopPropagation(); deletePlot(\'' + p.id + '\')" title="Delete">&#x2715;</button>';
        html += '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== TEXT ADJUST TOOLBAR ====================
function taOpen(field, screenX, screenY) {
    taActiveField = field;
    var bar = document.getElementById('textAdjustBar');
    var nameEl = document.getElementById('taFieldName');

    // Friendly field name
    var names = {
        title: 'Title', vendor: 'Vendor', vendees: 'Vendees', vendor_label: 'Vendor Label',
        vendee_label: 'Vendee Label', north_txt: 'North Side', south_txt: 'South Side',
        east_txt: 'East Side', west_txt: 'West Side', plot_center_txt: 'Plot Label',
        area_sqyd_override: 'Total Area Sq.Yards', area_sqm_override: 'Total Area Sq.Mtrs',
        plinth: 'Plinth', wit1: 'Witness 1', wit2: 'Witness 2',
        sig_label_1: 'Signature 1', sig_label_2: 'Signature 2'
    };
    nameEl.textContent = names[field] || field;

    bar.classList.add('show');

    // Position near the click but keep in viewport
    var bw = 260, bh = 80;
    var px = Math.min(screenX + 10, window.innerWidth - bw - 10);
    var py = Math.max(screenY - bh - 10, 10);
    bar.style.left = px + 'px';
    bar.style.top = py + 'px';
}

function taClose() {
    document.getElementById('textAdjustBar').classList.remove('show');
    taActiveField = null;
}

// Close toolbar when clicking outside it or the SVG
document.addEventListener('mousedown', function(e) {
    var bar = document.getElementById('textAdjustBar');
    if (!bar.classList.contains('show')) return;
    if (bar.contains(e.target)) return;
    if (e.target.closest('#mapSvg')) return;
    taClose();
});

function taMove(dx, dy) {
    if (!taActiveField) return;
    if (!textOverrides[taActiveField]) textOverrides[taActiveField] = { dx: 0, dy: 0, ds: 0 };
    textOverrides[taActiveField].dx += dx;
    textOverrides[taActiveField].dy += dy;
    scheduleSave();
    scheduleDraw();
}

function taSize(ds) {
    if (!taActiveField) return;
    if (!textOverrides[taActiveField]) textOverrides[taActiveField] = { dx: 0, dy: 0, ds: 0 };
    textOverrides[taActiveField].ds += ds;
    scheduleSave();
    scheduleDraw();
}

function taReset() {
    if (!taActiveField) return;
    delete textOverrides[taActiveField];
    scheduleSave();
    scheduleDraw();
}

// ==================== APPLY TEMPLATE FROM PLOT-CHOICE ====================
function applyTemplateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var hasNewTrigger = params.get('template') === 'new';
    var urlType = params.get('type');
    var urlRoom = params.get('room');
    var urlContent = params.get('content');
    var hasUrlTemplate = (urlType === 'rectangle' || urlType === 'trapezoid');

    // No URL trigger and no explicit URL template => nothing to apply
    if (!hasNewTrigger && !hasUrlTemplate) return false;

    // Prefer URL payload, fallback to localStorage for backward compatibility
    var tpl = null;
    if (hasUrlTemplate) {
        tpl = {
            type: urlType,
            withRoom: (urlRoom === '1' || urlRoom === 'true'),
            contentMode: (urlContent === 'empty' ? 'empty' : 'sample')
        };
    } else {
        tpl = JSON.parse(localStorage.getItem('rrd_template') || 'null');
    }
    if (!tpl) return false;

    localStorage.removeItem('rrd_template');

    // Reset and apply template
    resetPlotDefaults();

    if (tpl.type === 'rectangle') {
        document.getElementById('modeRect').checked = true;
        document.getElementById('n_ft').value = '30';
        document.getElementById('n_in').value = '0';
        document.getElementById('s_ft').value = '30';
        document.getElementById('s_in').value = '0';
        document.getElementById('e_ft').value = '50';
        document.getElementById('e_in').value = '0';
        document.getElementById('w_ft').value = '50';
        document.getElementById('w_in').value = '0';
    } else {
        document.getElementById('modeTrap').checked = true;
        document.getElementById('n_ft').value = '28';
        document.getElementById('n_in').value = '6';
        document.getElementById('s_ft').value = '32';
        document.getElementById('s_in').value = '0';
        document.getElementById('e_ft').value = '45';
        document.getElementById('e_in').value = '0';
        document.getElementById('w_ft').value = '46';
        document.getElementById('w_in').value = '3';
    }

    // Optional sample prefill
    var useSampleData = (tpl.contentMode !== 'empty');
    if (useSampleData) {
        document.getElementById('title').value = 'PLAN SHOWING THE VACANT LAND PLOT NO.20, IN APPROVED LAYOUT\nL.P.NO.XXXX/LO/YYYY/20ZZ, OUT OF SURVEY NOs.XXX/A/1, XXX/A/2, XXX/B/1, XXX/B/2,\nXXX/C, XXX/D, XXX/E OF SAMPLE VILLAGE, SAMPLE MANDAL, SAMPLE DISTRICT,\nWITHIN THE LIMITS OF SAMPLE MUNICIPAL AUTHORITY,';
        document.getElementById('vendor').value = '1) SRI. SAMPLE VENDOR, S/o. SAMPLE FATHER\n2) SMT. CO-OWNER, W/o. SAMPLE VENDOR';
        document.getElementById('vendees').value = '1) SRI. SAMPLE BUYER, S/o. SAMPLE FATHER\n2) SMT. SAMPLE BUYER-2, W/o. SAMPLE BUYER';
        document.getElementById('vendor_label').value = 'VENDOR';
        document.getElementById('vendee_label').value = 'VENDEE';
        document.getElementById('north_txt').value = 'PLOT NO. 19 - PRIVATE PROPERTY';
        document.getElementById('south_txt').value = '30 FEET WIDE ROAD';
        document.getElementById('east_txt').value = 'PLOT NO. 21 - PRIVATE PROPERTY';
        document.getElementById('west_txt').value = 'PLOT NO. 18 - PRIVATE PROPERTY';
        document.getElementById('plot_center_txt').value = 'PLOT NO. 20';
        document.getElementById('open_area_txt').value = '';
        document.getElementById('area_sqyd_override').value = '';
        document.getElementById('area_sqm_override').value = '';
        document.getElementById('plinth').value = '';
        restoreAutoOverrideFlags(null);
        document.getElementById('wit1').value = '1) SRI. SAMPLE WITNESS - A';
        document.getElementById('wit2').value = '2) SRI. SAMPLE WITNESS - B';
        document.getElementById('road_south').checked = true;
        document.getElementById('road_north').checked = false;
        document.getElementById('road_east').checked = false;
        document.getElementById('road_west').checked = false;
    }

    if (tpl.withRoom) {
        document.getElementById('show_room').checked = true;
        document.getElementById('room_fields').style.display = 'block';
        document.getElementById('showInterior').value = 'true';
        document.getElementById('room_label').value = 'ROOM';
        document.getElementById('room_w_ft').value = '12';
        document.getElementById('room_w_in').value = '0';
        document.getElementById('room_h_ft').value = '10';
        document.getElementById('room_h_in').value = '0';
    } else {
        document.getElementById('show_room').checked = false;
        document.getElementById('room_fields').style.display = 'none';
    }

    // Save template type for visibility
    localStorage.setItem('rrd_active_template', JSON.stringify(tpl));

    setActivePlotId(null);
    updateModeUI();
    applyTemplateVisibility(tpl);

    // Clean URL
    window.history.replaceState({}, '', 'plot-generator.html');
    return true;
}

function applyTemplateVisibility(tpl) {
    if (!tpl) return;
    var isRect = tpl.type === 'rectangle';
    var hasRoom = tpl.withRoom;
    activeTemplateConfig = tpl;
    document.body.classList.remove('template-locked-rectangle', 'template-locked-trapezoid');
    document.body.classList.add(isRect ? 'template-locked-rectangle' : 'template-locked-trapezoid');

    var modeRect = document.getElementById('modeRect');
    var modeTrap = document.getElementById('modeTrap');
    // Hide mode tabs completely once template is chosen
    var modeToggle = document.querySelector('.mode-toggle');
    if (modeToggle) modeToggle.style.setProperty('display', 'none', 'important');

    // Lock mode selection to the chosen template
    modeRect.checked = isRect;
    modeTrap.checked = !isRect;
    modeRect.disabled = true;
    modeTrap.disabled = true;

    // Sync hint only for rectangle
    var syncHint = document.getElementById('syncHint');
    if (syncHint) syncHint.style.display = isRect ? 'block' : 'none';

    // Keep all four side rows visible (rectangle keeps S/W locked by mode logic)
    var southRow = document.getElementById('southRow');
    var westRow = document.getElementById('westRow');
    if (southRow) southRow.style.display = 'flex';
    if (westRow) westRow.style.display = 'flex';

    // For rectangle: hide all trapezoid-specific controls
    if (isRect) {
        document.getElementById('trapAlignHRow').style.display = 'none';
        document.getElementById('trapAlignVRow').style.display = 'none';
        document.getElementById('trapCustomHRow').style.display = 'none';
        document.getElementById('trapCustomVRow').style.display = 'none';
        document.getElementById('trapHelpNote').style.display = 'none';
    }

    // Room toggle — hide if template doesn't include room
    var roomToggleRow = document.getElementById('show_room').closest('.toggle-row');
    if (roomToggleRow) roomToggleRow.style.display = hasRoom ? 'flex' : 'none';
    if (!hasRoom) {
        document.getElementById('room_fields').style.display = 'none';
        document.getElementById('show_room').checked = false;
    } else {
        document.getElementById('show_room').checked = true;
        document.getElementById('room_fields').style.display = 'block';
    }

    // For rectangle without room — simplify dimensions section
    // Hide E/W labels showing "same as N/S" if rectangle
    if (isRect) {
        // In rectangle mode, N=S and E=W are synced, so dimensions already show correctly
    }

    // Add a visual indicator showing which template is active
    var templateBadge = document.getElementById('templateBadge');
    if (!templateBadge) {
        var h2 = document.querySelector('.controls-panel h2');
        if (h2) {
            templateBadge = document.createElement('span');
            templateBadge.id = 'templateBadge';
            templateBadge.style.cssText = 'display:inline-block;font-size:11px;background:#FFD93D;color:#1a1a1a;padding:2px 10px;border-radius:12px;margin-left:8px;font-weight:600;vertical-align:middle;';
            h2.appendChild(templateBadge);
        }
    }
    if (templateBadge) {
        var label = isRect ? 'Regular' : 'Irregular';
        if (hasRoom) label += ' + Room';
        templateBadge.textContent = label;
    }

    // Re-apply mode behaviors after template visibility updates
    updateModeUI();
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', function() {
    initAutoOverrideField('area_sqyd_override');
    initAutoOverrideField('area_sqm_override');
    initAutoOverrideField('plinth');
    var restored = loadFormData();

    if (!restored) {
        document.getElementById('zoom_value').textContent = currentZoom + '%';
        applyZoom();
    }

    // Set plot name from active plot or default
    var activeId = getActivePlotId();
    if (activeId) {
        var plots = getSavedPlots();
        for (var i = 0; i < plots.length; i++) {
            if (plots[i].id === activeId) {
                document.getElementById('plotName').value = plots[i].name;
                break;
            }
        }
    } else {
        document.getElementById('plotName').value = 'Plot ' + getNextPlotNumber();
    }

    // Sync user email
    var userData = JSON.parse(localStorage.getItem('plotgen_user') || '{}');
    if (userData.email) {
        document.getElementById('userEmail').textContent = userData.email;
    }

    // Check if coming from plot-choice with a new template
    var templateApplied = applyTemplateFromUrl();

    updateModeUI();
    initBodySizeDisplay();
    drawMap();
    saveFormData();

    // Apply template visibility (from URL or saved)
    if (!templateApplied) {
        var savedTpl = JSON.parse(localStorage.getItem('rrd_active_template') || 'null');
        if (savedTpl) applyTemplateVisibility(savedTpl);
    }

    // Mobile: default to controls tab, hide preview
    if (window.innerWidth <= 1024) {
        var canvas = document.querySelector('.canvas-container');
        if (canvas) canvas.classList.add('mobile-hidden');
    }

});
// ==================== TRAP ALIGN CUSTOM TOGGLE ====================
document.getElementById('trap_align').addEventListener('change', function() {
    document.getElementById('trapCustomHRow').style.display = this.value === 'custom' ? 'block' : 'none';
});
document.getElementById('trap_valign').addEventListener('change', function() {
    document.getElementById('trapCustomVRow').style.display = this.value === 'custom' ? 'block' : 'none';
});

// ==================== TRAP HELP MODAL ====================
function showTrapHelp() {
    document.getElementById('trapHelpModal').style.display = 'flex';
}
function closeTrapHelp() {
    document.getElementById('trapHelpModal').style.display = 'none';
}
