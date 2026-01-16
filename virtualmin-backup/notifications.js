document.addEventListener("DOMContentLoaded", () => {
  const bell = document.getElementById("notificationBell");
  const dropdown = document.getElementById("notificationDropdown");
  const countSpan = document.getElementById("notificationCount");
  const list = document.getElementById("notificationList");
  const clearBtn = document.getElementById("clearNotifications");

  let dropdownOpen = false;
  const API_URL = "https://apilageai.lk/notific.php";

  // Toggle dropdown
  bell.addEventListener("click", () => {
    dropdownOpen = !dropdownOpen;
    dropdown.style.display = dropdownOpen ? "block" : "none";
    if (dropdownOpen) loadNotifications();
  });

  // Load notifications
  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}?action=get`, { cache: "no-cache" });
      const data = await res.json();

      list.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        list.innerHTML = "<li class='no-notification'>No notifications</li>";
        countSpan.style.display = "none";
      } else {
        countSpan.textContent = data.length;
        countSpan.style.display = "inline";
        data.forEach(n => {
          const li = document.createElement("li");
          li.innerHTML = `
            <span>${escapeHTML(n.message)}</span>
            <button class="delete-btn" data-id="${n.id}" title="Delete">&times;</button>
          `;
          list.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  // Delete single notification
  list.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      fetch(`${API_URL}?action=delete&id=${id}`)
        .then(() => loadNotifications())
        .catch(err => console.error("Delete error:", err));
    }
  });

  // Clear all notifications
  clearBtn.addEventListener("click", () => {
    fetch(`${API_URL}?action=clear`)
      .then(() => loadNotifications())
      .catch(err => console.error("Clear error:", err));
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
      dropdownOpen = false;
    }
  });

  // Auto refresh notification count every 30 seconds
  setInterval(() => {
    refreshCountOnly();
  }, 30000);

  async function refreshCountOnly() {
    try {
      const res = await fetch(`${API_URL}?action=get`, { cache: "no-cache" });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        countSpan.textContent = data.length;
        countSpan.style.display = "inline";
      } else {
        countSpan.style.display = "none";
      }
    } catch (err) {
      console.error("Failed to refresh notification count:", err);
    }
  }

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
    });
  }

  // Initial count load
  refreshCountOnly();
});