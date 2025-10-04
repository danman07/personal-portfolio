'use strict';

/* Helpers */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const elementToggleFunc = (elem) => elem && elem.classList.toggle("active");

/* Sidebar (mobile) */
const sidebar = qs("[data-sidebar]");
const sidebarBtn = qs("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
}

/* Testimonials modal */
const testimonialsItem = qsa("[data-testimonials-item]");
const modalContainer = qs("[data-modal-container]");
const modalCloseBtn = qs("[data-modal-close-btn]");
const overlay = qs("[data-overlay]");
const modalImg = qs("[data-modal-img]");
const modalTitle = qs("[data-modal-title]");
const modalText = qs("[data-modal-text]");

const testimonialsModalFunc = () => {
  if (modalContainer && overlay) {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  }
};

if (
  testimonialsItem.length &&
  modalContainer &&
  modalCloseBtn &&
  overlay &&
  modalImg &&
  modalTitle &&
  modalText
) {
  testimonialsItem.forEach((item) => {
    item.addEventListener("click", function () {
      const avatar = this.querySelector("[data-testimonials-avatar]");
      const title = this.querySelector("[data-testimonials-title]");
      const text = this.querySelector("[data-testimonials-text]");

      if (avatar) {
        modalImg.src = avatar.src;
        modalImg.alt = avatar.alt || "";
      }
      if (title) modalTitle.innerHTML = title.innerHTML;
      if (text) modalText.innerHTML = text.innerHTML;

      testimonialsModalFunc();
    });
  });

  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  overlay.addEventListener("click", testimonialsModalFunc);
}

/* Custom select + filtering */
const select = qs("[data-select]");
const selectItems = qsa("[data-select-item]");
const selectValue = qs("[data-selecct-value]");
const filterBtn = qsa("[data-filter-btn]");
const filterItems = qsa("[data-filter-item]");

const filterFunc = (selectedValue) => {
  filterItems.forEach((item) => {
    if (selectedValue === "all" || selectedValue === item.dataset.category) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

if (select) {
  select.addEventListener("click", function () {
    elementToggleFunc(this);
  });
}

if (selectItems.length) {
  selectItems.forEach((it) => {
    it.addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });
}

if (filterBtn.length) {
  let lastClickedBtn = filterBtn[0];
  filterBtn.forEach((btn) => {
    btn.addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  });
}

/* Contact form validation + Web3Forms AJAX */
const form = qs("form[data-form]");
const formInputs = qsa("[data-form-input]");
const formBtn = qs("[data-form-btn]");
const statusEl = qs("#form-status");

// NEW: single timer handle to avoid overlapping timeouts
let statusTimer = null;

if (form && formInputs.length && formBtn) {
  const setStatus = (msg, state) => {
    if (!statusEl) return;

    // Cancel any previous auto-hide
    if (statusTimer) {
      clearTimeout(statusTimer);
      statusTimer = null;
    }

    // Update text + state classes
    statusEl.textContent = msg;
    statusEl.classList.remove("is-sending", "is-success", "is-error");
    if (state) statusEl.classList.add(state);

    // Auto-hide after 6s on success
    if (state === "is-success") {
      statusTimer = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.classList.remove("is-sending", "is-success", "is-error");
        statusTimer = null;
      }, 6000);
    }
  };

  const validate = () => {
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  };
  formInputs.forEach((inp) => inp.addEventListener("input", validate));
  validate();

  form.addEventListener("submit", async (e) => {
    const action = form.getAttribute("action") || "";
    if (action.includes("api.web3forms.com/submit")) {
      e.preventDefault();
      formBtn.setAttribute("disabled", "");
      setStatus("Sending...", "is-sending");

      try {
        const formData = new FormData(form);
        const res = await fetch(action, { method: "POST", body: formData });
        const data = await res.json().catch(() => ({}));

        if (res.ok && (data.success === true || data.message)) {
          setStatus("Thanks! Message sent.", "is-success");
          form.reset();
          validate();
        } else {
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } catch (err) {
        setStatus("Sorry, something went wrong. Try again later.", "is-error");
      } finally {
        formBtn.removeAttribute("disabled");
      }
    }
    // Otherwise let normal submission proceed
  });
}



/* Page navigation (dataset-based, single source of truth) */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = qsa("[data-nav-link]");
  const pages = qsa("[data-page]");

  const activate = (target) => {
    pages.forEach((page) =>
      page.classList.toggle("active", page.dataset.page === target)
    );
    navLinks.forEach((link) =>
      link.classList.toggle(
        "active",
        link.textContent.trim().toLowerCase() === target
      )
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  navLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.textContent.trim().toLowerCase();
      activate(target);
    });
  });
});
