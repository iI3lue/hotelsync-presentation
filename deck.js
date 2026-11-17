(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var slides = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
  var total = slides.length;
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var nextLabel = document.getElementById("nextLabel");
  var counter = document.getElementById("counter");
  var dotsNav = document.getElementById("dots");
  var homeBtn = document.getElementById("homeBtn");
  var progressFill = document.getElementById("progressFill");

  var index = 0;

  function fit() {
    var scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.setProperty("--scale", String(Math.max(scale, 0.2)));
  }

  var dots = slides.map(function (slide, i) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "dot-btn";
    button.setAttribute("aria-label", slide.dataset.title || "Diapositiva " + (i + 1));
    button.addEventListener("click", function () {
      go(i);
    });
    dotsNav.appendChild(button);
    return button;
  });

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
      slide.classList.toggle("is-before", i < index);
      slide.classList.toggle("is-after", i > index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    nextLabel.textContent = index === 0 ? "Comenzar" : "Siguiente";
    counter.textContent = index + 1 + " / " + total;
    progressFill.style.width = ((index + 1) / total) * 100 + "%";
    stage.classList.toggle("on-cover", index === 0);

    try {
      history.replaceState(null, "", "#/" + (index + 1));
    } catch {
    }
  }

  function go(target) {
    var next = Math.max(0, Math.min(total - 1, target));
    if (next === index) return;
    index = next;
    render();
  }

  function next() {
    go(index + 1);
  }

  function prev() {
    go(index - 1);
  }

  window.addEventListener("resize", fit);

  window.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
      case "Spacebar":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        event.preventDefault();
        prev();
        break;
      case "Home":
        event.preventDefault();
        go(0);
        break;
      case "End":
        event.preventDefault();
        go(total - 1);
        break;
      case "f":
      case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        break;
      default:
        break;
    }
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  homeBtn.addEventListener("click", function () {
    go(0);
  });

  var startX = null;
  stage.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse") return;
    startX = event.clientX;
  });
  stage.addEventListener("pointerup", function (event) {
    if (startX === null) return;
    var delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 45) {
      if (delta < 0) next();
      else prev();
    }
  });

  window.addEventListener("hashchange", function () {
    var match = location.hash.match(/^#\/(\d+)$/);
    if (!match) return;
    var target = Number(match[1]);
    if (Number.isFinite(target) && target >= 1 && target <= total && target - 1 !== index) {
      index = target - 1;
      render();
    }
  });

  var match = location.hash.match(/^#\/(\d+)$/);
  var fromHash = match ? Number(match[1]) : NaN;
  if (Number.isFinite(fromHash) && fromHash >= 1 && fromHash <= total) {
    index = fromHash - 1;
  }

  fit();
  render();
})();
