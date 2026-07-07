/**
 * PlaneHero — self-contained 3D plane scroll animation component.
 * ===============================================================
 *
 * WHAT IT DOES:
 *   Renders a 3D plane (GLTF model) in a fixed-position Three.js canvas
 *   that follows a configurable flight path driven by page scroll progress.
 *   The plane overlays the whole viewport (z-index: 1, pointer-events: none)
 *   so it can fly across section boundaries.
 *
 * HOW TO INTEGRATE INTO YOUR WEBSITE:
 *
 *   1. Copy `plane-component.js` and your `.glb` model into your project.
 *   2. Add an import map or bundler alias for Three.js (v0.160+):
 *        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
 *        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
 *   3. Create a container element in your HTML:
 *        <div id="hero"></div>
 *   4. Import and instantiate:
 *        import { PlaneHero } from './plane-component.js';
 *        new PlaneHero('#hero', { model: 'plane1.glb' });
 *   5. (Optional) Provide different flight paths per breakpoint:
 *        new PlaneHero('#hero', {
 *          model: 'plane1.glb',
 *          settings: {
 *            desktop: { easing: "easeInOut", sx: -6, sy: 0.5, sz: -6, ex: 5, ey: 0, ez: 6, ss: 2, es: 4.4, rx: -0.03, ry: 0.75, rz: 0.08, speed: 0.35, floatAmp: 0.05, floatSpd: 1, camZ: 12, camY: 2 },
 *            mobile:  { easing: "linear",    sx: -2, sy: 3,   sz: -8, ex: 2, ey: -1, ez: 4, ss: 1.5, es: 3.5, rx: 0.1,   ry: 0.5,  rz: 0.05, speed: 0.4,  floatAmp: 0.03, floatSpd: 0.8, camZ: 14, camY: 2.5 }
 *          }
 *        });
 *
 * GETTING YOUR SETTINGS STRING (for the settings option above):
 *   - Press Ctrl+Shift+H to toggle the hidden control panel.
 *   - Tune the sliders until the flight path looks right.
 *   - Click "Copy" in the panel — it copies a JSON string to clipboard.
 *   - Paste that string as the value for "desktop" or "mobile" key.
 *   - Or just use a single settings object (no breakpoint switching):
 *        settings: { easing: "easeInOut", sx: -6, ... }
 *
 * FLIGHT PATH & Y-AXIS FLEXIBILITY:
 *   The canvas uses position: fixed so it covers the entire viewport
 *   regardless of page content. The plane moves in 3D world-space.
 *   sy (start Y) and ey (end Y) control vertical position:
 *     - Positive values = plane appears higher in the viewport
 *     - Negative values = plane appears lower / below horizon
 *   This lets the plane start over a hero section (sy: 5) and
 *   descend as the user scrolls (ey: -2), flying across section
 *   boundaries seamlessly.
 *
 * OPTIONS REFERENCE:
 *   elementOrSelector   CSS selector or Element — container for the component
 *   options.model       string  — path to .glb model file (required)
 *   options.settings    object  — flight path settings (single or { desktop, mobile })
 *                                 If omitted, uses the "flyover" default preset.
 *   options.preset      string  — fallback preset key (ignored if settings is provided)
 *   options.controls    bool    — whether to build the control panel in DOM (default true)
 *                                 Hidden by default, toggle with Ctrl+Shift+H
 *   options.onReady     fn      — called with (instance) when model finishes loading
 *   options.onProgress  fn      — called with (scrollProgress 0-1) on scroll
 *
 * PUBLIC API:
 *   instance.getSettings()            — returns current slider values as object
 *   instance.encodeSettings()         — returns current slider values as JSON string
 *   instance.loadSettings(str|obj)    — applies settings from object or JSON string
 *   instance.toggleControls()         — show/hide the tuning panel
 *   instance.applyPreset(key)         — apply a built-in preset by key
 *   instance.destroy()                — tear down, remove DOM, free memory
 *
 * BUILT-IN PRESETS (use with applyPreset() or options.preset):
 *   "rightSweep", "flyover", "approach", "bankDive", "topDown"
 *
 * CSS:
 *   The component injects its own styles into <head>. Minimal footprint:
 *   a fixed canvas container and the (hidden) controls panel. No body
 *   resets, no fonts, no page-level styles. It will NOT interfere with
 *   your site's existing CSS.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const PLANE_COMPONENT_STYLES = `
canvas { display: block; }

.plane-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}

.plane-controls-panel {
  position: fixed; bottom: 80px; right: 24px; z-index: 999;
  width: 360px; max-height: 75vh;
  background: rgba(0,13,16,0.94);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 20px;
  overflow-y: auto; display: none;
  backdrop-filter: blur(12px);
  color: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.plane-controls-panel.open { display: block; }

.plane-controls-panel::-webkit-scrollbar { width: 4px; }
.plane-controls-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2); border-radius: 2px;
}

.plane-controls-panel h3 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
  color: rgba(255,255,255,0.4); margin-bottom: 8px;
}

.plane-preset-row {
  display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
}
.plane-preset-btn {
  padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.6);
  font-size: 10px; cursor: pointer; transition: all 0.2s;
  pointer-events: auto;
}
.plane-preset-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
.plane-preset-btn.active {
  background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3);
  color: #fff;
}

.plane-control-group {
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.plane-control-group:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.plane-control-group label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 2px;
}
.plane-control-group label span { color: rgba(255,255,255,0.8); font-family: monospace; font-size: 10px; }

.plane-control-row { display: flex; gap: 8px; margin-bottom: 4px; }
.plane-control-row .field { flex: 1; }

.plane-controls-panel input[type="range"] {
  width: 100%; height: 3px; -webkit-appearance: none;
  background: rgba(255,255,255,0.15); border-radius: 2px;
  outline: none; pointer-events: auto;
}
.plane-controls-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px;
  border-radius: 50%; background: rgba(255,255,255,0.6);
  cursor: pointer;
}
.plane-controls-panel input[type="range"]::-moz-range-thumb {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255,255,255,0.6); cursor: pointer; border: none;
}

.plane-controls-panel select {
  width: 100%; padding: 5px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05); color: #fff;
  font-size: 11px; outline: none; pointer-events: auto;
}

.plane-preset-string-row {
  display: flex; gap: 6px; margin-top: 8px;
}
.plane-preset-string-row input {
  flex: 1; padding: 6px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05); color: #fff;
  font-size: 10px; font-family: monospace; outline: none;
  pointer-events: auto;
}
.plane-preset-string-row button {
  padding: 6px 12px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08); color: #fff;
  font-size: 10px; cursor: pointer; white-space: nowrap;
  pointer-events: auto;
}
.plane-preset-string-row button:hover { background: rgba(255,255,255,0.15); }
`;

const EASINGS = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInElastic: (t) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3),
  easeOutBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

const DEFAULT_PRESETS = {
  rightSweep: {
    name: 'Right Sweep',
    sx: -6, sy: 0.5, sz: -6,
    ex: 5, ey: 0, ez: 6,
    ss: 2, es: 4.4,
    rx: -0.03, ry: 0.75, rz: 0.08,
    easing: 'easeInOut',
    speed: 0.35, floatAmp: 0.05, floatSpd: 1,
    camZ: 12, camY: 2,
  },
  flyover: {
    name: 'Flyover',
    sx: -3, sy: 5, sz: -12,
    ex: 3, ey: -2, ez: 4,
    ss: 1.5, es: 5,
    rx: -0.2, ry: 0.4, rz: 0.05,
    easing: 'linear',
    speed: 0.35, floatAmp: 0.08, floatSpd: 1.5,
    camZ: 12, camY: 2,
  },
  approach: {
    name: 'Approach',
    sx: 0, sy: 1, sz: -15,
    ex: 0, ey: 0.2, ez: 6,
    ss: 0.8, es: 6,
    rx: -0.05, ry: 0, rz: 0,
    easing: 'easeOutCubic',
    speed: 0.35, floatAmp: 0.03, floatSpd: 0.8,
    camZ: 14, camY: 2,
  },
  bankDive: {
    name: 'Bank & Dive',
    sx: -5, sy: 3, sz: -5,
    ex: 6, ey: -3, ez: 4,
    ss: 2, es: 5,
    rx: 0.25, ry: 0.6, rz: -0.35,
    easing: 'easeInCubic',
    speed: 0.35, floatAmp: 0.1, floatSpd: 2,
    camZ: 12, camY: 2,
  },
  topDown: {
    name: 'Top Down',
    sx: -4, sy: 0, sz: -10,
    ex: 4, ey: 0, ez: 10,
    ss: 1.5, es: 3.5,
    rx: 0, ry: 0.5, rz: 0.1,
    easing: 'easeInOutCubic',
    speed: 0.35, floatAmp: 0, floatSpd: 1,
    camZ: 14, camY: 4,
  },
};

const SLIDER_IDS = ['sx','sy','sz','ex','ey','ez','ss','es','rx','ry','rz','speed','floatAmp','floatSpd','camZ','camY'];

export class PlaneHero {
  /**
   * @param {string|Element} elementOrSelector  Container element or CSS selector
   * @param {object} options
   * @param {string}  options.model         Path to .glb model file
   * @param {object}  [options.settings]    Flight path settings (single obj or {desktop, mobile})
   * @param {string}  [options.preset]      Fallback preset key if no settings given
   * @param {boolean} [options.controls=true] Build hidden control panel in DOM
   * @param {function} [options.onReady]    Called with (instance) when model loads
   * @param {function} [options.onProgress] Called with (scrollProgress 0-1)
   */
  constructor(elementOrSelector, options = {}) {
    this.el = typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

    if (!this.el) {
      throw new Error('PlaneHero: container element not found');
    }

    this.options = {
      model: options.model || 'plane1.glb',
      settings: options.settings || null,
      preset: options.preset || null,
      controls: options.controls !== false,
      onReady: options.onReady || null,
      onProgress: options.onProgress || null,
    };

    this.presets = { ...DEFAULT_PRESETS };
    this.easings = { ...EASINGS };

    this.planeGroup = null;
    this.camera = null;
    this.renderer = null;
    this.scene = null;
    this.stars = null;
    this.sliders = {};
    this.valueSpans = {};
    this.easingSelect = null;
    this.time = 0;
    this.scrollProgress = 0;
    this.animFrameId = null;
    this._stylesInjected = false;
    this._activePreset = null;
    this._destroyed = false;
    this._currentBreakpoint = null;
    this._settingsConfig = null;

    // Parse settings config
    const s = this.options.settings;
    if (s) {
      if (s.desktop || s.mobile) {
        this._settingsConfig = s;
      } else {
        // Flat settings object — treat as single (no breakpoint switching)
        this._settingsConfig = { _single: s };
      }
    }

    this._init();
  }

  _injectStyles() {
    if (this._stylesInjected) return;
    const id = 'plane-component-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = PLANE_COMPONENT_STYLES;
    document.head.appendChild(style);
    this._stylesInjected = true;
  }

  _createStructure() {
    this.el.classList.add('plane-hero-container');

    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'plane-canvas';
    document.body.appendChild(this.canvasContainer);
  }

  _initThreeJS() {
    const container = this.canvasContainer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000D10);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 12);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffeedd, 2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    this.scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.8);
    fillLight.position.set(-3, 4, -5);
    this.scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 1);
    rimLight.position.set(0, -2, -8);
    this.scene.add(rimLight);

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 2000;
    const pos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 200;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8, sizeAttenuation: true,
    }));
    this.scene.add(this.stars);

    // Plane
    this.planeGroup = new THREE.Group();
    const loader = new GLTFLoader();
    loader.load(
      this.options.model,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });
        this.planeGroup.add(model);
        if (this.options.onReady) this.options.onReady(this);
      },
      undefined,
      (error) => console.error('PlaneHero: error loading model:', error)
    );
    this.scene.add(this.planeGroup);
  }

  _initControls() {
    if (!this.options.controls) return;

    this.controlsPanel = document.createElement('div');
    this.controlsPanel.className = 'plane-controls-panel';

    let html = '';

    // Presets
    html += '<h3>Presets</h3><div class="plane-preset-row" id="plane-preset-row"></div>';

    // Easing
    html += '<div class="plane-control-group">';
    html += '<label>Easing <select id="plane-easing-select" style="width:auto;display:inline-block;margin-left:8px;"></select></label>';
    html += '</div>';

    // Position
    html += '<h3>Position</h3><div class="plane-control-group">';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Start X <span id="v-sx">-6</span></label><input type="range" id="sx" min="-15" max="15" step="0.5" value="-6"></div>';
    html += '<div class="field"><label>End X <span id="v-ex">5</span></label><input type="range" id="ex" min="-15" max="15" step="0.5" value="5"></div>';
    html += '</div>';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Start Y <span id="v-sy">0.5</span></label><input type="range" id="sy" min="-10" max="10" step="0.5" value="0.5"></div>';
    html += '<div class="field"><label>End Y <span id="v-ey">0</span></label><input type="range" id="ey" min="-10" max="10" step="0.5" value="0"></div>';
    html += '</div>';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Start Z <span id="v-sz">-6</span></label><input type="range" id="sz" min="-20" max="10" step="0.5" value="-6"></div>';
    html += '<div class="field"><label>End Z <span id="v-ez">6</span></label><input type="range" id="ez" min="-20" max="10" step="0.5" value="6"></div>';
    html += '</div></div>';

    // Scale
    html += '<h3>Scale</h3><div class="plane-control-group">';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Start <span id="v-ss">2.0</span></label><input type="range" id="ss" min="0" max="50" step="0.1" value="2"></div>';
    html += '<div class="field"><label>End <span id="v-es">4.4</span></label><input type="range" id="es" min="0" max="50" step="0.1" value="4.4"></div>';
    html += '</div></div>';

    // Rotation
    html += '<h3>Rotation</h3><div class="plane-control-group">';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Pitch (X) <span id="v-rx">-0.03</span></label><input type="range" id="rx" min="-3" max="3" step="0.01" value="-0.03"></div>';
    html += '<div class="field"><label>Yaw (Y) <span id="v-ry">0.75</span></label><input type="range" id="ry" min="-3" max="3" step="0.01" value="0.75"></div>';
    html += '</div>';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Roll (Z) <span id="v-rz">0.08</span></label><input type="range" id="rz" min="-3" max="3" step="0.01" value="0.08"></div>';
    html += '</div></div>';

    // Motion
    html += '<h3>Motion</h3><div class="plane-control-group">';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Scroll Speed <span id="v-speed">0.35</span></label><input type="range" id="speed" min="0.05" max="1.5" step="0.01" value="0.35"></div>';
    html += '<div class="field"><label>Float Amp <span id="v-floatAmp">0.05</span></label><input type="range" id="floatAmp" min="0" max="1" step="0.01" value="0.05"></div>';
    html += '</div>';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Float Speed <span id="v-floatSpd">1.0</span></label><input type="range" id="floatSpd" min="0" max="5" step="0.1" value="1"></div>';
    html += '</div></div>';

    // Camera
    html += '<h3>Camera</h3><div class="plane-control-group">';
    html += '<div class="plane-control-row">';
    html += '<div class="field"><label>Cam Z <span id="v-camZ">12</span></label><input type="range" id="camZ" min="5" max="30" step="0.5" value="12"></div>';
    html += '<div class="field"><label>Cam Y <span id="v-camY">2</span></label><input type="range" id="camY" min="-5" max="10" step="0.25" value="2"></div>';
    html += '</div></div>';

    // Saved slots
    html += '<h3>Saved</h3><div class="plane-control-group" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">';
    for (let i = 1; i <= 3; i++) {
      html += '<div class="plane-preset-string-row" style="margin-top:4px;">';
      html += '<span style="font-size:10px;color:rgba(255,255,255,0.4);min-width:18px;line-height:28px;">S' + i + '</span>';
      html += '<input type="text" id="plane-slot-' + i + '" readonly placeholder="empty">';
      html += '<button id="plane-save-' + i + '">Save</button>';
      html += '<button id="plane-load-' + i + '">Load</button>';
      html += '</div>';
    }
    html += '</div>';

    // Share
    html += '<h3>Share</h3><div class="plane-control-group" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">';
    html += '<div class="plane-preset-string-row"><input type="text" id="plane-preset-string" readonly placeholder="Copy settings..."><button id="plane-copy-btn">Copy</button></div>';
    html += '<div class="plane-preset-string-row" style="margin-top:4px;"><input type="text" id="plane-import-string" placeholder="Paste settings here..."><button id="plane-import-btn">Apply</button></div>';
    html += '</div>';

    this.controlsPanel.innerHTML = html;
    document.body.appendChild(this.controlsPanel);

    // Easing dropdown
    this.easingSelect = document.getElementById('plane-easing-select');
    if (this.easingSelect) {
      Object.keys(this.easings).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        this.easingSelect.appendChild(opt);
      });
    }

    // Preset buttons
    const presetRow = document.getElementById('plane-preset-row');
    if (presetRow) {
      Object.keys(this.presets).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'plane-preset-btn';
        btn.textContent = this.presets[key].name;
        btn.dataset.preset = key;
        btn.addEventListener('click', () => this.applyPreset(key));
        presetRow.appendChild(btn);
      });
    }

    // Sliders
    SLIDER_IDS.forEach(id => {
      this.sliders[id] = document.getElementById(id);
      this.valueSpans[id] = document.getElementById('v-' + id);
    });

    SLIDER_IDS.forEach(id => {
      if (this.sliders[id]) {
        this.sliders[id].addEventListener('input', () => {
          if (this.valueSpans[id]) {
            this.valueSpans[id].textContent = parseFloat(this.sliders[id].value).toFixed(2);
          }
          document.querySelectorAll('.plane-preset-btn').forEach(b => b.classList.remove('active'));
          this._activePreset = null;
        });
      }
    });

    // Copy
    const copyBtn = document.getElementById('plane-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const str = this.encodeSettings();
        const input = document.getElementById('plane-preset-string');
        if (input) {
          input.value = str;
          input.select();
        }
        navigator.clipboard.writeText(str);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    }

    // Import
    const importBtn = document.getElementById('plane-import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.getElementById('plane-import-string');
        if (!input) return;
        try {
          const obj = JSON.parse(input.value);
          this.loadSettings(obj);
          importBtn.textContent = 'Applied!';
          setTimeout(() => { importBtn.textContent = 'Apply'; }, 2000);
        } catch {
          importBtn.textContent = 'Invalid!';
          setTimeout(() => { importBtn.textContent = 'Apply'; }, 2000);
        }
      });
    }

    // Saved slots
    for (let i = 1; i <= 3; i++) {
      const input = document.getElementById('plane-slot-' + i);
      const saveBtn = document.getElementById('plane-save-' + i);
      const loadBtn = document.getElementById('plane-load-' + i);
      const key = 'plane-slot-' + i;
      if (input) {
        const saved = localStorage.getItem(key);
        if (saved) input.value = saved;
      }
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const str = this.encodeSettings();
          if (input) {
            input.value = str;
            localStorage.setItem(key, str);
          }
          saveBtn.textContent = 'Saved!';
          setTimeout(() => { saveBtn.textContent = 'Save'; }, 2000);
        });
      }
      if (loadBtn) {
        loadBtn.addEventListener('click', () => {
          if (input && input.value) {
            try {
              this.loadSettings(input.value);
              loadBtn.textContent = 'Loaded!';
              setTimeout(() => { loadBtn.textContent = 'Load'; }, 2000);
            } catch {
              loadBtn.textContent = 'Invalid!';
              setTimeout(() => { loadBtn.textContent = 'Load'; }, 2000);
            }
          }
        });
      }
    }

    // Keyboard toggle: Ctrl+Shift+H
    this._onKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        this.toggleControls();
      }
    };
    window.addEventListener('keydown', this._onKeyDown);

    // Load initial settings (responsive or flat or default preset)
    if (this._settingsConfig) {
      this._updateBreakpoint();
    } else {
      this.applyPreset(this.options.preset || 'flyover');
    }
  }

  /** Toggle the debug control panel visibility */
  toggleControls() {
    if (!this.controlsPanel) return;
    this.controlsPanel.classList.toggle('open');
  }

  /** Apply a built-in preset by key */
  applyPreset(key) {
    const p = this.presets[key];
    if (!p) return;
    SLIDER_IDS.forEach(id => {
      if (id in p && this.sliders[id]) {
        this.sliders[id].value = p[id];
        if (this.valueSpans[id]) {
          this.valueSpans[id].textContent = Number(p[id]).toFixed(2);
        }
      }
    });
    if (this.easingSelect && p.easing) {
      this.easingSelect.value = p.easing;
    }
    document.querySelectorAll('.plane-preset-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.plane-preset-btn[data-preset="${key}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    this._activePreset = key;
  }

  /** Get current slider values as a plain object */
  getSettings() {
    const obj = {};
    if (this.easingSelect) obj.easing = this.easingSelect.value;
    SLIDER_IDS.forEach(id => {
      if (this.sliders[id]) obj[id] = parseFloat(this.sliders[id].value);
    });
    return obj;
  }

  /** Get current slider values as a JSON string */
  encodeSettings() {
    return JSON.stringify(this.getSettings());
  }

  /**
   * Load settings from a plain object or JSON string.
   * Accepts the same format that encodeSettings() produces.
   */
  loadSettings(input) {
    const obj = typeof input === 'string' ? JSON.parse(input) : input;
    if (!obj) return;
    SLIDER_IDS.forEach(id => {
      if (id in obj && this.sliders[id]) {
        this.sliders[id].value = obj[id];
        if (this.valueSpans[id]) {
          this.valueSpans[id].textContent = Number(obj[id]).toFixed(2);
        }
      }
    });
    if (obj.easing && this.easingSelect) this.easingSelect.value = obj.easing;
    document.querySelectorAll('.plane-preset-btn').forEach(b => b.classList.remove('active'));
    this._activePreset = null;
  }

  /** Apply settings for current viewport breakpoint based on _settingsConfig */
  _updateBreakpoint() {
    if (!this._settingsConfig) return;

    // _single means flat settings, no breakpoint switching
    if (this._settingsConfig._single) {
      if (this._currentBreakpoint !== '_single') {
        this._currentBreakpoint = '_single';
        this.loadSettings(this._settingsConfig._single);
      }
      return;
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const bp = isMobile ? 'mobile' : 'desktop';

    if (bp !== this._currentBreakpoint) {
      this._currentBreakpoint = bp;
      const s = this._settingsConfig[bp];
      if (s) {
        this.loadSettings(s);
      }
    }
  }

  _bindEvents() {
    this._onScroll = () => {
      const scrollY = window.scrollY;
      const speed = this.sliders.speed ? parseFloat(this.sliders.speed.value) : 0.35;
      const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) * speed;
      this.scrollProgress = Math.min(scrollY / maxScroll, 1);
      if (this.options.onProgress) this.options.onProgress(this.scrollProgress);
    };

    this._onResize = () => {
      const w = this.canvasContainer.clientWidth;
      const h = this.canvasContainer.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this._updateBreakpoint();
    };

    window.addEventListener('scroll', this._onScroll);
    window.addEventListener('resize', this._onResize);
  }

  _animate() {
    if (this._destroyed) return;
    this.animFrameId = requestAnimationFrame(() => this._animate());

    this.time += 0.01;

    const raw = this.scrollProgress;
    const easingFn = this.easingSelect
      ? (this.easings[this.easingSelect.value] || this.easings.linear)
      : this.easings.linear;
    const p = easingFn(raw);

    const getVal = (id, fallback) => {
      return this.sliders[id] ? parseFloat(this.sliders[id].value) : fallback;
    };

    const sx = getVal('sx', 0);
    const sy = getVal('sy', 0);
    const sz = getVal('sz', 0);
    const ex = getVal('ex', 0);
    const ey = getVal('ey', 0);
    const ez = getVal('ez', 0);
    const ss = getVal('ss', 1);
    const es = getVal('es', 1);
    const rx = getVal('rx', 0);
    const ry = getVal('ry', 0);
    const rz = getVal('rz', 0);
    const floatAmp = getVal('floatAmp', 0);
    const floatSpd = getVal('floatSpd', 1);
    const camZ = getVal('camZ', 12);
    const camY = getVal('camY', 2);

    if (this.planeGroup) {
      this.planeGroup.position.set(
        sx + (ex - sx) * p,
        sy + (ey - sy) * p + Math.sin(this.time * floatSpd) * floatAmp,
        sz + (ez - sz) * p
      );
      this.planeGroup.rotation.x = rx;
      this.planeGroup.rotation.y = ry;
      this.planeGroup.rotation.z = rz;

      const s = ss + (es - ss) * p;
      this.planeGroup.scale.set(s, s, s);
    }

    this.camera.position.set(0, camY, camZ);
    this.camera.lookAt(0, 0, 0);

    if (this.stars) {
      this.stars.rotation.y = this.time * 0.015;
      this.stars.rotation.x = Math.sin(this.time * 0.008) * 0.03;
    }

    this.renderer.render(this.scene, this.camera);
  }

  _init() {
    this._injectStyles();
    this._createStructure();
    this._initThreeJS();
    this._initControls();
    this._bindEvents();
    this._animate();
    this._onScroll();
  }

  /**
   * Full cleanup: remove DOM, event listeners, animation loop.
   * Call when you no longer need the component.
   */
  destroy() {
    this._destroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    if (this.canvasContainer && this.canvasContainer.parentNode) {
      this.canvasContainer.parentNode.removeChild(this.canvasContainer);
    }

    if (this.controlsPanel && this.controlsPanel.parentNode) {
      this.controlsPanel.parentNode.removeChild(this.controlsPanel);
    }
  }
}
