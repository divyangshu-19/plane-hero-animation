import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const HYER_HERO_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #000D10;
  color: #fff;
  overflow-x: hidden;
}

canvas { display: block; }

.hyer-hero {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
}

.hyer-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
  pointer-events: none;
}

.hyer-overlay {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.hyer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px;
  pointer-events: auto;
}

.hyer-logo svg { height: 20px; }

.hyer-nav ul { display: flex; list-style: none; gap: 40px; }
.hyer-nav a {
  color: #fff; text-decoration: none; font-size: 14px;
  font-weight: 400; letter-spacing: 0.5px; opacity: 0.7;
  transition: opacity 0.3s;
}
.hyer-nav a:hover { opacity: 1; }

.hyer-menu-btn {
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  pointer-events: auto;
}
.hyer-menu-btn span {
  display: block; width: 18px; height: 2px;
  background: #fff; position: relative;
}
.hyer-menu-btn span::before,
.hyer-menu-btn span::after {
  content: ''; position: absolute; width: 100%; height: 2px;
  background: #fff; left: 0;
}
.hyer-menu-btn span::before { top: -6px; }
.hyer-menu-btn span::after { top: 6px; }

.hyer-hero-content {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 0 48px;
}

.hyer-hero-title {
  font-size: 120px; font-weight: 300; letter-spacing: -3px;
  line-height: 1; margin-bottom: auto; padding-top: 80px;
  opacity: 0; transform: translateY(40px);
  animation: hyerFadeUp 1s 0.3s forwards;
}

.hyer-hero-bottom {
  display: flex; justify-content: space-between;
  align-items: flex-end; padding-bottom: 48px;
  opacity: 0; transform: translateY(40px);
  animation: hyerFadeUp 1s 0.6s forwards;
}

.hyer-hero-subtitle {
  font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
  opacity: 0.6; font-weight: 400;
}

.hyer-hero-buttons { display: flex; gap: 16px; }
.hyer-hero-buttons a {
  display: inline-block; padding: 12px 28px;
  border: 1px solid rgba(255,255,255,0.25); color: #fff;
  text-decoration: none; font-size: 13px; letter-spacing: 1px;
  text-transform: uppercase; transition: all 0.3s;
  pointer-events: auto;
}
.hyer-hero-buttons a:hover { background: #fff; color: #000D10; }

.hyer-scroll-indicator {
  position: absolute; bottom: 100px; left: 50%;
  transform: translateX(-50%); z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; opacity: 0;
  animation: hyerFadeUp 1s 1s forwards; pointer-events: none;
}
.hyer-scroll-indicator span {
  font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
  opacity: 0.4;
}
.hyer-scroll-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
}

@keyframes hyerFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

.hyer-scroll-section { min-height: 200vh; }

.hyer-controls-toggle {
  position: fixed; bottom: 24px; right: 24px; z-index: 1000;
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px); transition: background 0.2s;
}
.hyer-controls-toggle:hover { background: rgba(255,255,255,0.2); }

.hyer-controls-panel {
  position: fixed; bottom: 80px; right: 24px; z-index: 999;
  width: 360px; max-height: 75vh;
  background: rgba(0,13,16,0.94);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 20px;
  overflow-y: auto; display: none;
  backdrop-filter: blur(12px);
}
.hyer-controls-panel.open { display: block; }

.hyer-controls-panel::-webkit-scrollbar { width: 4px; }
.hyer-controls-panel::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2); border-radius: 2px;
}

.hyer-controls-panel h3 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
  color: rgba(255,255,255,0.4); margin-bottom: 8px;
}

.hyer-preset-row {
  display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;
}
.hyer-preset-btn {
  padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.6);
  font-size: 10px; cursor: pointer; transition: all 0.2s;
  pointer-events: auto;
}
.hyer-preset-btn:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
.hyer-preset-btn.active {
  background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3);
  color: #fff;
}

.hyer-control-group {
  margin-bottom: 12px; padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.hyer-control-group:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.hyer-control-group label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 2px;
}
.hyer-control-group label span { color: rgba(255,255,255,0.8); font-family: monospace; font-size: 10px; }

.hyer-control-row { display: flex; gap: 8px; margin-bottom: 4px; }
.hyer-control-row .field { flex: 1; }

.hyer-controls-panel input[type="range"] {
  width: 100%; height: 3px; -webkit-appearance: none;
  background: rgba(255,255,255,0.15); border-radius: 2px;
  outline: none; pointer-events: auto;
}
.hyer-controls-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px;
  border-radius: 50%; background: rgba(255,255,255,0.6);
  cursor: pointer;
}
.hyer-controls-panel input[type="range"]::-moz-range-thumb {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255,255,255,0.6); cursor: pointer; border: none;
}

.hyer-controls-panel select {
  width: 100%; padding: 5px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05); color: #fff;
  font-size: 11px; outline: none; pointer-events: auto;
}

.hyer-preset-string-row {
  display: flex; gap: 6px; margin-top: 8px;
}
.hyer-preset-string-row input {
  flex: 1; padding: 6px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05); color: #fff;
  font-size: 10px; font-family: monospace; outline: none;
  pointer-events: auto;
}
.hyer-preset-string-row button {
  padding: 6px 12px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08); color: #fff;
  font-size: 10px; cursor: pointer; white-space: nowrap;
  pointer-events: auto;
}
.hyer-preset-string-row button:hover { background: rgba(255,255,255,0.15); }

@media (max-width: 768px) {
  .hyer-header { padding: 20px 24px; }
  .hyer-hero-content { padding: 0 24px; }
  .hyer-hero-title { font-size: 48px; letter-spacing: -1px; }
  .hyer-nav ul { gap: 20px; }
  .hyer-nav a { font-size: 12px; }
  .hyer-hero-bottom { flex-direction: column; align-items: flex-start; gap: 20px; }
  .hyer-controls-panel { width: 300px; right: 12px; bottom: 72px; }
}
`;

// --- Easing functions ---
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

// --- Default presets ---
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

export class HyerHero {
  constructor(elementOrSelector, options = {}) {
    this.el = typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

    const ov = options.overlay || {};

    this.options = {
      model: options.model || 'plane1.glb',
      overlay: {
        logo: ov.logo !== undefined ? ov.logo : null,
        nav: ov.nav !== undefined ? ov.nav : [
          { text: 'Solutions', href: '#' },
          { text: 'About us', href: '#' },
          { text: 'Contact', href: '#' },
        ],
        title: ov.title !== undefined ? ov.title : '',
        subtitle: ov.subtitle !== undefined ? ov.subtitle : 'Flights, stays and personalised experiences.',
        buttons: ov.buttons !== undefined ? ov.buttons : [
          { text: 'Hyer\u00ae Stays', href: '#' },
          { text: 'Hyer\u00ae Travel', href: '#' },
        ],
        scrollIndicator: ov.scrollIndicator !== undefined ? ov.scrollIndicator : true,
      },
      controls: options.controls !== undefined ? options.controls : true,
      preset: options.preset || 'flyover',
      camera: { z: 12, y: 2, ...(options.camera || {}) },
      presets: { ...(options.presets || {}) },
      easings: { ...(options.easings || {}) },
      onReady: options.onReady || null,
      onProgress: options.onProgress || null,
    };

    this.presets = { ...DEFAULT_PRESETS, ...this.options.presets };
    this.easings = { ...EASINGS, ...this.options.easings };

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

    this._init();
  }

  _injectStyles() {
    if (this._stylesInjected) return;
    const id = 'hyer-hero-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = HYER_HERO_STYLES;
    document.head.appendChild(style);
    this._stylesInjected = true;
  }

  _createStructure() {
    this.el.classList.add('hyer-hero');

    // Canvas container (fixed, covers viewport)
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'hyer-canvas';
    document.body.appendChild(this.canvasContainer);

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'hyer-overlay';

    const ov = this.options.overlay;

    // Header
    if (ov.nav || ov.logo !== false) {
      const header = document.createElement('header');
      header.className = 'hyer-header';

      if (ov.logo !== false) {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'hyer-logo';
        if (ov.logo) {
          logoDiv.innerHTML = ov.logo;
        } else {
          logoDiv.innerHTML = '<svg viewBox="0 0 959 376" fill="none" xmlns="http://www.w3.org/2000/svg" style="height:20px;">' +
            '<path d="M254.658 0H195.027V302.128H254.658V0Z" fill="white"/>' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H59.6306V302.128H0V0ZM59.6313 123.237H195.028C195.028 150.129 173.28 171.643 146.622 171.643H59.6313V123.237Z" fill="white"/>' +
            '<path d="M291.372 375.088V330.892H313.119C332.295 330.892 340.713 331.359 350.535 307.507L353.107 301.193L267.286 77.8706H330.19L380.935 239.458L433.082 77.8706H491.31L409.23 295.347C382.572 365.033 371.347 374.854 315.458 374.854H291.372V375.088Z" fill="white"/>' +
            '<path d="M540.885 205.784C544.158 244.134 570.115 262.842 597.475 262.842C615.481 262.842 632.786 256.528 644.478 237.119H703.875C691.715 270.559 659.21 307.507 597.943 307.507C525.918 307.507 483.826 253.722 483.826 189.181C483.826 122.535 530.128 72.9595 596.306 72.9595C665.524 72.9595 708.318 126.744 706.213 205.784H540.885ZM541.82 166.264H647.986C646.817 128.381 620.158 115.052 595.838 115.052C574.324 115.052 546.263 128.381 541.82 166.264Z" fill="white"/>' +
            '<path d="M857.278 133.292C848.86 132.123 841.844 132.123 833.426 132.123C805.131 132.123 786.423 142.646 786.423 184.738V302.362H728.897V77.8706H785.488V117.157C798.349 89.329 818.46 78.3383 844.651 78.3383C848.392 78.3383 853.303 78.806 857.044 79.2737V133.292H857.278Z" fill="white"/>' +
            '<path d="M917.843 82.3136C895.16 82.3136 876.687 63.8398 876.687 41.1568C876.687 18.4738 895.16 0 917.843 0C940.526 0 959 18.4738 959 41.1568C959 63.8398 940.526 82.3136 917.843 82.3136ZM917.843 7.01537C898.902 7.01537 883.702 22.4492 883.702 41.1568C883.702 60.0983 899.136 75.2983 917.843 75.2983C936.785 75.2983 951.985 59.8645 951.985 41.1568C951.985 22.2153 936.551 7.01537 917.843 7.01537Z" fill="white"/>' +
            '<path d="M919.014 44.8982H917.143H910.829V60.0982H903.112V21.5137H915.74C928.368 21.5137 933.278 25.0214 933.278 33.2059C933.278 37.649 931.174 41.3905 926.263 43.2613L934.915 59.8643H926.497L919.014 44.8982ZM910.829 27.3598V39.0521H917.143C923.223 39.0521 925.561 37.1813 925.561 33.2059C925.561 28.7629 921.82 27.3598 916.675 27.3598H910.829Z" fill="white"/>' +
            '</svg>';
        }
        header.appendChild(logoDiv);
      }

      if (ov.nav) {
        const nav = document.createElement('nav');
        nav.className = 'hyer-nav';
        const ul = document.createElement('ul');
        ov.nav.forEach(item => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.text;
          li.appendChild(a);
          ul.appendChild(li);
        });
        nav.appendChild(ul);
        header.appendChild(nav);
      }

      const menuBtn = document.createElement('button');
      menuBtn.className = 'hyer-menu-btn';
      menuBtn.innerHTML = '<span></span>';
      header.appendChild(menuBtn);

      this.overlay.appendChild(header);
    }

    // Hero content
    if (ov.title !== false || ov.subtitle !== false || ov.buttons) {
      const heroContent = document.createElement('div');
      heroContent.className = 'hyer-hero-content';

      if (ov.title !== false) {
        const h1 = document.createElement('h1');
        h1.className = 'hyer-hero-title';
        h1.textContent = ov.title || '';
        heroContent.appendChild(h1);
      }

      const showBottom = ov.subtitle !== false || (ov.buttons && ov.buttons.length > 0);
      if (showBottom) {
        const bottom = document.createElement('div');
        bottom.className = 'hyer-hero-bottom';

        if (ov.subtitle !== false) {
          const sub = document.createElement('span');
          sub.className = 'hyer-hero-subtitle';
          sub.textContent = ov.subtitle || '';
          bottom.appendChild(sub);
        }

        if (ov.buttons && ov.buttons.length > 0) {
          const btnGroup = document.createElement('div');
          btnGroup.className = 'hyer-hero-buttons';
          ov.buttons.forEach(b => {
            const a = document.createElement('a');
            a.href = b.href;
            a.textContent = b.text;
            btnGroup.appendChild(a);
          });
          bottom.appendChild(btnGroup);
        }

        heroContent.appendChild(bottom);
      }

      this.overlay.appendChild(heroContent);
    }

    // Scroll indicator
    if (ov.scrollIndicator) {
      const si = document.createElement('div');
      si.className = 'hyer-scroll-indicator';
      si.innerHTML = '<span>Scroll</span><div class="hyer-scroll-line"></div>';
      this.overlay.appendChild(si);
    }

    this.el.appendChild(this.overlay);
  }

  _initThreeJS() {
    const container = this.canvasContainer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000D10);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, this.options.camera.y, this.options.camera.z);
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
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8, sizeAttenuation: true,
    }));
    this.scene.add(this.stars);

    // Plane group
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
      (error) => console.error('Error loading model:', error)
    );
    this.scene.add(this.planeGroup);
  }

  _initControls() {
    if (!this.options.controls) return;

    // Toggle button
    this.controlsToggle = document.createElement('button');
    this.controlsToggle.className = 'hyer-controls-toggle';
    this.controlsToggle.innerHTML = '&#9881;';
    document.body.appendChild(this.controlsToggle);

    // Panel
    this.controlsPanel = document.createElement('div');
    this.controlsPanel.className = 'hyer-controls-panel';

    // Build panel HTML
    let panelHTML = '';

    // Presets
    panelHTML += '<h3>Presets</h3><div class="hyer-preset-row" id="hyer-preset-row"></div>';

    // Easing
    panelHTML += '<div class="hyer-control-group">';
    panelHTML += '<label>Easing <select id="hyer-easing-select" style="width:auto;display:inline-block;margin-left:8px;"></select></label>';
    panelHTML += '</div>';

    // Position
    panelHTML += '<h3>Position</h3><div class="hyer-control-group">';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Start X <span id="v-sx">-6</span></label><input type="range" id="sx" min="-15" max="15" step="0.5" value="-6"></div>';
    panelHTML += '<div class="field"><label>End X <span id="v-ex">5</span></label><input type="range" id="ex" min="-15" max="15" step="0.5" value="5"></div>';
    panelHTML += '</div>';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Start Y <span id="v-sy">0.5</span></label><input type="range" id="sy" min="-10" max="10" step="0.5" value="0.5"></div>';
    panelHTML += '<div class="field"><label>End Y <span id="v-ey">0</span></label><input type="range" id="ey" min="-10" max="10" step="0.5" value="0"></div>';
    panelHTML += '</div>';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Start Z <span id="v-sz">-6</span></label><input type="range" id="sz" min="-20" max="10" step="0.5" value="-6"></div>';
    panelHTML += '<div class="field"><label>End Z <span id="v-ez">6</span></label><input type="range" id="ez" min="-20" max="10" step="0.5" value="6"></div>';
    panelHTML += '</div></div>';

    // Scale
    panelHTML += '<h3>Scale</h3><div class="hyer-control-group">';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Start <span id="v-ss">2.0</span></label><input type="range" id="ss" min="0" max="10" step="0.1" value="2"></div>';
    panelHTML += '<div class="field"><label>End <span id="v-es">4.4</span></label><input type="range" id="es" min="0" max="10" step="0.1" value="4.4"></div>';
    panelHTML += '</div></div>';

    // Rotation
    panelHTML += '<h3>Rotation</h3><div class="hyer-control-group">';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Pitch (X) <span id="v-rx">-0.03</span></label><input type="range" id="rx" min="-3" max="3" step="0.01" value="-0.03"></div>';
    panelHTML += '<div class="field"><label>Yaw (Y) <span id="v-ry">0.75</span></label><input type="range" id="ry" min="-3" max="3" step="0.01" value="0.75"></div>';
    panelHTML += '</div>';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Roll (Z) <span id="v-rz">0.08</span></label><input type="range" id="rz" min="-3" max="3" step="0.01" value="0.08"></div>';
    panelHTML += '</div></div>';

    // Motion
    panelHTML += '<h3>Motion</h3><div class="hyer-control-group">';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Scroll Speed <span id="v-speed">0.35</span></label><input type="range" id="speed" min="0.05" max="1.5" step="0.01" value="0.35"></div>';
    panelHTML += '<div class="field"><label>Float Amp <span id="v-floatAmp">0.05</span></label><input type="range" id="floatAmp" min="0" max="1" step="0.01" value="0.05"></div>';
    panelHTML += '</div>';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Float Speed <span id="v-floatSpd">1.0</span></label><input type="range" id="floatSpd" min="0" max="5" step="0.1" value="1"></div>';
    panelHTML += '</div></div>';

    // Camera
    panelHTML += '<h3>Camera</h3><div class="hyer-control-group">';
    panelHTML += '<div class="hyer-control-row">';
    panelHTML += '<div class="field"><label>Cam Z <span id="v-camZ">12</span></label><input type="range" id="camZ" min="5" max="30" step="0.5" value="12"></div>';
    panelHTML += '<div class="field"><label>Cam Y <span id="v-camY">2</span></label><input type="range" id="camY" min="-5" max="10" step="0.25" value="2"></div>';
    panelHTML += '</div></div>';

    // Share
    panelHTML += '<h3>Share</h3><div class="hyer-control-group" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">';
    panelHTML += '<div class="hyer-preset-string-row"><input type="text" id="hyer-preset-string" readonly placeholder="Copy settings..."><button id="hyer-copy-btn">Copy</button></div>';
    panelHTML += '<div class="hyer-preset-string-row" style="margin-top:4px;"><input type="text" id="hyer-import-string" placeholder="Paste settings here..."><button id="hyer-import-btn">Apply</button></div>';
    panelHTML += '</div>';

    this.controlsPanel.innerHTML = panelHTML;
    document.body.appendChild(this.controlsPanel);

    // Wire up controls
    this.easingSelect = document.getElementById('hyer-easing-select');
    if (this.easingSelect) {
      Object.keys(this.easings).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        this.easingSelect.appendChild(opt);
      });
    }

    // Preset buttons
    const presetRow = document.getElementById('hyer-preset-row');
    if (presetRow) {
      Object.keys(this.presets).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'hyer-preset-btn';
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
          document.querySelectorAll('.hyer-preset-btn').forEach(b => b.classList.remove('active'));
          this._activePreset = null;
        });
      }
    });

    // Toggle
    this.controlsToggle.addEventListener('click', () => {
      this.controlsPanel.classList.toggle('open');
    });

    // Copy
    const copyBtn = document.getElementById('hyer-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const str = this.encodeSettings();
        const input = document.getElementById('hyer-preset-string');
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
    const importBtn = document.getElementById('hyer-import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.getElementById('hyer-import-string');
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

    // Apply default preset
    this.applyPreset(this.options.preset);
  }

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
    document.querySelectorAll('.hyer-preset-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.hyer-preset-btn[data-preset="${key}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    this._activePreset = key;
  }

  getSettings() {
    const obj = {};
    if (this.easingSelect) obj.easing = this.easingSelect.value;
    SLIDER_IDS.forEach(id => {
      if (this.sliders[id]) obj[id] = parseFloat(this.sliders[id].value);
    });
    return obj;
  }

  encodeSettings() {
    return JSON.stringify(this.getSettings());
  }

  loadSettings(obj) {
    SLIDER_IDS.forEach(id => {
      if (id in obj && this.sliders[id]) {
        this.sliders[id].value = obj[id];
        if (this.valueSpans[id]) {
          this.valueSpans[id].textContent = Number(obj[id]).toFixed(2);
        }
      }
    });
    if (obj.easing && this.easingSelect) this.easingSelect.value = obj.easing;
    document.querySelectorAll('.hyer-preset-btn').forEach(b => b.classList.remove('active'));
    this._activePreset = null;
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
    this._onScroll(); // initial scroll state
  }

  destroy() {
    this._destroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    if (this.canvasContainer && this.canvasContainer.parentNode) {
      this.canvasContainer.parentNode.removeChild(this.canvasContainer);
    }
    if (this.controlsToggle && this.controlsToggle.parentNode) {
      this.controlsToggle.parentNode.removeChild(this.controlsToggle);
    }
    if (this.controlsPanel && this.controlsPanel.parentNode) {
      this.controlsPanel.parentNode.removeChild(this.controlsPanel);
    }
  }
}
