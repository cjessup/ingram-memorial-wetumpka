(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var groups = document.querySelectorAll("[data-stagger]");
    Array.prototype.forEach.call(groups, function (group) {
      var kids = [];
      for (var i = 0; i < group.children.length; i++) {
        if (group.children[i].classList.contains("reveal")) kids.push(group.children[i]);
      }
      kids.forEach(function (el, index) {
        el.style.transitionDelay = Math.min(index, 8) * 70 + "ms";
      });
    });

    var nodes = document.querySelectorAll(".reveal");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    Array.prototype.forEach.call(nodes, function (el) {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
  }

  var filter = document.getElementById("symbol-filter");
  if (filter) {
    var entries = document.querySelectorAll(".entry");
    var empty = document.getElementById("filter-empty");
    filter.addEventListener("input", function () {
      var query = filter.value.trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(entries, function (entry) {
        var match = !query || entry.textContent.toLowerCase().indexOf(query) !== -1;
        entry.hidden = !match;
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }

  var form = document.getElementById("demo-form");
  var formNote = document.getElementById("form-note");
  if (form && formNote) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      formNote.hidden = false;
      formNote.textContent = "This is a demo form. Nothing was sent.";
    });
  }

  var links = Array.prototype.slice.call(document.querySelectorAll("a.zoom"));
  if (!links.length || typeof HTMLDialogElement === "undefined") return;

  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML =
    '<div class="lightbox-bar">' +
    '<button type="button" class="lightbox-prev">Previous</button>' +
    '<button type="button" class="lightbox-next">Next</button>' +
    '<button type="button" class="lightbox-close">Close</button>' +
    "</div><figure><img alt=''><figcaption></figcaption></figure>";
  document.body.appendChild(dialog);

  var img = dialog.querySelector("img");
  var caption = dialog.querySelector("figcaption");
  var group = [];
  var index = 0;

  function paint() {
    var link = group[index];
    var inner = link.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = inner ? inner.alt : "";
    caption.textContent = link.getAttribute("data-caption") || (inner ? inner.alt : "");
  }

  function show(next) {
    if (!group.length) return;
    index = (next + group.length) % group.length;
    if (reduce) {
      paint();
      return;
    }
    img.classList.add("is-fading");
    window.setTimeout(function () {
      paint();
      img.classList.remove("is-fading");
    }, 180);
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (!dialog.showModal) return;
      event.preventDefault();
      var name = link.getAttribute("data-group") || "all";
      group = links.filter(function (item) {
        return (item.getAttribute("data-group") || "all") === name;
      });
      index = group.indexOf(link);
      paint();
      dialog.showModal();
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", function () {
    dialog.close();
  });
  dialog.querySelector(".lightbox-prev").addEventListener("click", function () {
    show(index - 1);
  });
  dialog.querySelector(".lightbox-next").addEventListener("click", function () {
    show(index + 1);
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", function (event) {
    if (!dialog.open) return;
    if (event.key === "ArrowRight") show(index + 1);
    if (event.key === "ArrowLeft") show(index - 1);
  });
})();
