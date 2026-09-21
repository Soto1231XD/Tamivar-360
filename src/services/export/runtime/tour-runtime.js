(function () {
  "use strict";

  // Duración del fundido al cambiar de escena, para que se sienta como un cambio de habitación.
  var SCENE_FADE_MS = 320;

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function TamivarTour(rootEl, project) {
    this.root = rootEl;
    this.project = project;
    this.currentSceneId = project.initialSceneId || (project.scenes[0] && project.scenes[0].id) || null;
    this.pannellumViewer = null;
    this.roomListOpen = false;
    this.render();
  }

  TamivarTour.prototype.getScene = function (id) {
    var scenes = this.project.scenes;
    for (var i = 0; i < scenes.length; i++) if (scenes[i].id === id) return scenes[i];
    return null;
  };

  TamivarTour.prototype.render = function () {
    this.root.innerHTML = "";
    this.root.classList.add("tmv-root");

    this.stage = el("div", "tmv-stage");
    this.root.appendChild(this.stage);

    this.buildTopbar();
    this.buildRoomList();
    this.buildInfoPanel();
    if (this.project.settings.showThumbnails && this.project.scenes.length > 1) this.buildThumbnails();
    this.buildFadeOverlay();

    this.renderScene();
  };

  TamivarTour.prototype.buildFadeOverlay = function () {
    this.fadeEl = el("div", "tmv-fade");
    this.fadeEl.setAttribute("aria-hidden", "true");
    this.fadeEl.style.transitionDuration = SCENE_FADE_MS + "ms";
    this.root.appendChild(this.fadeEl);
  };

  TamivarTour.prototype.buildTopbar = function () {
    var self = this;
    var bar = el("div", "tmv-topbar");

    var pill = el("div", "tmv-title-pill");
    var projectName = el("p", "tmv-project-name");
    projectName.textContent = this.project.name;
    this.sceneNameEl = el("p", "tmv-scene-name");
    pill.appendChild(projectName);
    pill.appendChild(this.sceneNameEl);

    var actions = el("div", "tmv-actions");

    if (this.project.settings.showRoomList) {
      this.roomListBtn = el("button", "tmv-icon-btn");
      this.roomListBtn.setAttribute("aria-label", "Ver habitaciones");
      this.roomListBtn.innerHTML = "&#9776;";
      this.roomListBtn.addEventListener("click", function () {
        self.toggleRoomList();
      });
      actions.appendChild(this.roomListBtn);
    }

    var fsBtn = el("button", "tmv-icon-btn");
    fsBtn.setAttribute("aria-label", "Pantalla completa");
    fsBtn.innerHTML = "&#9974;";
    fsBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) self.root.requestFullscreen && self.root.requestFullscreen();
      else document.exitFullscreen && document.exitFullscreen();
    });
    actions.appendChild(fsBtn);

    bar.appendChild(pill);
    bar.appendChild(actions);
    this.root.appendChild(bar);
  };

  TamivarTour.prototype.buildRoomList = function () {
    var self = this;
    this.roomListEl = el("div", "tmv-roomlist");
    var ordered = this.project.scenes.slice().sort(function (a, b) {
      return a.order - b.order;
    });
    ordered.forEach(function (scene) {
      var btn = el("button");
      btn.textContent = scene.name;
      btn.dataset.sceneId = scene.id;
      btn.addEventListener("click", function () {
        self.goToScene(scene.id);
        self.toggleRoomList(false);
      });
      self.roomListEl.appendChild(btn);
    });
    this.root.appendChild(this.roomListEl);
  };

  TamivarTour.prototype.toggleRoomList = function (force) {
    this.roomListOpen = typeof force === "boolean" ? force : !this.roomListOpen;
    this.roomListEl.classList.toggle("open", this.roomListOpen);
    if (this.roomListBtn) this.roomListBtn.classList.toggle("active", this.roomListOpen);
  };

  TamivarTour.prototype.buildInfoPanel = function () {
    var self = this;
    this.infoPanelEl = el("div", "tmv-info-panel");
    var closeBtn = el("button", "tmv-close");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function () {
      self.hideInfo();
    });
    this.infoTitleEl = el("h3");
    this.infoDescEl = el("p");
    this.infoPanelEl.appendChild(closeBtn);
    this.infoPanelEl.appendChild(this.infoTitleEl);
    this.infoPanelEl.appendChild(this.infoDescEl);
    this.root.appendChild(this.infoPanelEl);
  };

  TamivarTour.prototype.showInfo = function (hotspot) {
    this.infoTitleEl.textContent = hotspot.title || hotspot.label;
    this.infoDescEl.textContent = hotspot.description || "";
    this.infoPanelEl.classList.add("open");
  };

  TamivarTour.prototype.hideInfo = function () {
    this.infoPanelEl.classList.remove("open");
  };

  TamivarTour.prototype.buildThumbnails = function () {
    var self = this;
    this.thumbsEl = el("div", "tmv-thumbnails");
    var ordered = this.project.scenes.slice().sort(function (a, b) {
      return a.order - b.order;
    });
    this.thumbButtons = {};
    ordered.forEach(function (scene) {
      var btn = el("button", "tmv-thumb");
      var img = el("img");
      img.src = scene.thumbnail || scene.image;
      img.alt = scene.name;
      var label = el("span");
      label.textContent = scene.name;
      btn.appendChild(img);
      btn.appendChild(label);
      btn.addEventListener("click", function () {
        self.goToScene(scene.id);
      });
      self.thumbsEl.appendChild(btn);
      self.thumbButtons[scene.id] = btn;
    });
    this.root.appendChild(this.thumbsEl);
  };

  TamivarTour.prototype.updateActiveThumb = function () {
    if (!this.thumbButtons) return;
    for (var id in this.thumbButtons) {
      this.thumbButtons[id].classList.toggle("active", id === this.currentSceneId);
    }
  };

  TamivarTour.prototype.goToScene = function (id) {
    var self = this;
    if (id === this.currentSceneId || !this.getScene(id)) return;
    if (this.roomListOpen) this.toggleRoomList(false);

    this.fadeEl.classList.add("tmv-fade--visible");
    if (this._fadeTimeout) clearTimeout(this._fadeTimeout);
    this._fadeTimeout = setTimeout(function () {
      self.currentSceneId = id;
      self.hideInfo();
      self.renderScene();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.fadeEl.classList.remove("tmv-fade--visible");
        });
      });
    }, SCENE_FADE_MS);
  };

  TamivarTour.prototype.renderScene = function () {
    var scene = this.getScene(this.currentSceneId);
    this.stage.innerHTML = "";
    if (this.pannellumViewer) {
      this.pannellumViewer.destroy();
      this.pannellumViewer = null;
    }

    if (!scene) {
      var empty = el("div", "tmv-empty");
      empty.textContent = "Este recorrido todavía no tiene escenas.";
      this.stage.appendChild(empty);
      return;
    }

    if (this.sceneNameEl) this.sceneNameEl.textContent = scene.name;
    if (this.roomListEl) {
      var buttons = this.roomListEl.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active", buttons[i].dataset.sceneId === scene.id);
      }
    }
    this.updateActiveThumb();

    if (scene.type === "panorama") this.renderPanorama(scene);
    else this.renderImage(scene);
  };

  TamivarTour.prototype.buildHotspotMarker = function (container, hotspot) {
    var self = this;
    container.innerHTML = "";
    container.classList.add("tour-hotspot", "tour-hotspot--" + hotspot.type);
    var marker = el("span", "tour-hotspot__marker");
    marker.textContent = hotspot.type === "navigation" ? "↑" : "i";
    var label = el("span", "tour-hotspot__label");
    label.textContent = hotspot.label;
    container.appendChild(marker);
    container.appendChild(label);
    container.addEventListener("click", function (ev) {
      ev.stopPropagation();
      self.handleHotspotClick(hotspot);
    });
  };

  TamivarTour.prototype.handleHotspotClick = function (hotspot) {
    if (hotspot.type === "navigation") this.goToScene(hotspot.targetSceneId);
    else this.showInfo(hotspot);
  };

  TamivarTour.prototype.renderPanorama = function (scene) {
    var self = this;
    var container = el("div", "tmv-pano");
    this.stage.appendChild(container);

    var hotSpots = scene.hotspots
      .filter(function (h) {
        return h.kind === "360";
      })
      .map(function (h) {
        return {
          id: h.id,
          pitch: h.position.pitch,
          yaw: h.position.yaw,
          type: "info",
          cssClass: "pnlm-hotspot-base",
          createTooltipFunc: function (div) {
            self.buildHotspotMarker(div, h);
          },
        };
      });

    this.pannellumViewer = window.pannellum.viewer(container, {
      type: "equirectangular",
      panorama: scene.image,
      autoLoad: true,
      showControls: false,
      compass: false,
      autoRotate: this.project.settings.autoRotate ? 2 : 0,
      pitch: scene.initialView ? scene.initialView.pitch : 0,
      yaw: scene.initialView ? scene.initialView.yaw : 0,
      hfov: scene.initialView ? scene.initialView.hfov : 100,
      hotSpots: hotSpots,
    });
  };

  TamivarTour.prototype.renderImage = function (scene) {
    var self = this;
    var wrap = el("div", "tmv-image-wrap");
    var img = el("img", "tmv-image");
    img.src = scene.image;
    img.alt = scene.name;
    wrap.appendChild(img);

    scene.hotspots
      .filter(function (h) {
        return h.kind === "image";
      })
      .forEach(function (h) {
        var marker = el("button", "tour-hotspot--absolute");
        marker.style.left = h.position.x + "%";
        marker.style.top = h.position.y + "%";
        self.buildHotspotMarker(marker, h);
        wrap.appendChild(marker);
      });

    this.stage.appendChild(wrap);
  };

  window.TamivarTour = TamivarTour;

  document.addEventListener("DOMContentLoaded", function () {
    var data = window.__TAMIVAR_TOUR__;
    var root = document.getElementById("tamivar-tour");
    if (data && root) new TamivarTour(root, data.project);
  });
})();
