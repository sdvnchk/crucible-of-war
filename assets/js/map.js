class MapViewer {
  constructor(containerId, imgId) {
    this.container = document.getElementById(containerId);
    this.img = document.getElementById(imgId);
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.lastPinchDist = 0;
    this.MIN_SCALE = 0.3;
    this.MAX_SCALE = 10;
    this._hintTimer = null;

    this.img.ondragstart = () => false;
    this.img.style.transformOrigin = '0 0';
    this.img.style.userSelect = 'none';
    this.img.style.pointerEvents = 'none';
    this.img.style.willChange = 'transform';

    this.scaleEl = document.getElementById('map-scale');

    this.container.addEventListener('wheel',      e => this._onWheel(e),      { passive: false });
    this.container.addEventListener('mousedown',  e => this._onMouseDown(e));
    window.addEventListener('mousemove',          e => this._onMouseMove(e));
    window.addEventListener('mouseup',            () => this._onMouseUp());
    this.container.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false });
    this.container.addEventListener('touchmove',  e => this._onTouchMove(e),  { passive: false });
    this.container.addEventListener('touchend',   e => this._onTouchEnd(e));
    this.container.addEventListener('dblclick',   e => this._onDblClick(e));

    this.img.addEventListener('load', () => this._fitToContainer());
    if (this.img.complete) this._fitToContainer();

    const hint = document.getElementById('map-hint');
    if (hint) {
      this._hintTimer = setTimeout(() => hint.classList.add('hidden'), 4000);
    }
  }

  _fitToContainer() {
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const iw = this.img.naturalWidth  || this.img.width  || 1;
    const ih = this.img.naturalHeight || this.img.height || 1;
    this.scale = Math.min(cw / iw, ch / ih);
    this.tx = (cw - iw * this.scale) / 2;
    this.ty = (ch - ih * this.scale) / 2;
    this._apply();
  }

  _apply() {
    this.img.style.transform = `translate(${this.tx}px,${this.ty}px) scale(${this.scale})`;
    if (this.scaleEl) this.scaleEl.textContent = `${Math.round(this.scale * 100)}%`;
  }

  _zoom(factor, cx, cy) {
    const rect  = this.container.getBoundingClientRect();
    const px    = (cx !== undefined ? cx : rect.width  / 2);
    const py    = (cy !== undefined ? cy : rect.height / 2);
    const next  = Math.min(Math.max(this.scale * factor, this.MIN_SCALE), this.MAX_SCALE);
    const ratio = next / this.scale;
    this.tx = px - ratio * (px - this.tx);
    this.ty = py - ratio * (py - this.ty);
    this.scale = next;
    this._apply();
  }

  _onWheel(e) {
    e.preventDefault();
    const rect   = this.container.getBoundingClientRect();
    const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
    this._zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  }

  _onMouseDown(e) {
    if (e.button !== 0) return;
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.container.classList.add('dragging');
  }

  _onMouseMove(e) {
    if (!this.dragging) return;
    this.tx += e.clientX - this.lastX;
    this.ty += e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this._apply();
  }

  _onMouseUp() {
    this.dragging = false;
    this.container.classList.remove('dragging');
  }

  _onDblClick(e) {
    const rect = this.container.getBoundingClientRect();
    this._zoom(2, e.clientX - rect.left, e.clientY - rect.top);
  }

  _pinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.dragging = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      this.dragging = false;
      this.lastPinchDist = this._pinchDist(e.touches);
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this.dragging) {
      this.tx += e.touches[0].clientX - this.lastX;
      this.ty += e.touches[0].clientY - this.lastY;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      this._apply();
    } else if (e.touches.length === 2) {
      const dist   = this._pinchDist(e.touches);
      const factor = dist / this.lastPinchDist;
      const rect   = this.container.getBoundingClientRect();
      const cx     = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy     = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      this._zoom(factor, cx, cy);
      this.lastPinchDist = dist;
    }
  }

  _onTouchEnd(e) {
    if (e.touches.length < 1) this.dragging = false;
  }

  zoomIn()  { this._zoom(1.5); }
  zoomOut() { this._zoom(1 / 1.5); }
  reset()   { this._fitToContainer(); }
}
