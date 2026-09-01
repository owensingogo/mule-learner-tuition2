/* =========================================
MULE LEARNER TUITION
Main Application JavaScript
========================================= */

"use strict";

/* ===== PAGE READY ===== */

document.addEventListener("DOMContentLoaded", function () {

/* Add current year automatically */
document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
});

/* Close mobile menus when a link is selected */
document.querySelectorAll("[data-menu-link]").forEach(function (link) {
    link.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
    });
});

});

/* ===== SAFE STORAGE ===== */

function saveData(key, value) {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch (error) {
console.error("Could not save data:", error);
return false;
}
}

function getData(key, defaultValue = null) {
try {
const data = localStorage.getItem(key);

    if (data === null) {
        return defaultValue;
    }

    return JSON.parse(data);

} catch (error) {
    console.error("Could not read data:", error);
    return defaultValue;
}

}

function removeData(key) {
try {
localStorage.removeItem(key);
return true;
} catch (error) {
console.error("Could not remove data:", error);
return false;
}
}

/* ===== USER SESSION ===== */

function getCurrentUser() {
return getData("muleCurrentUser", null);
}

function setCurrentUser(user) {
saveData("muleCurrentUser", user);
}

function clearCurrentUser() {
removeData("muleCurrentUser");
}

/* ===== LOGOUT ===== */

function muleLogout(redirectPage = "login.html") {

const confirmed = confirm("Are you sure you want to logout?");

if (!confirmed) {
    return;
}

clearCurrentUser();

window.location.href = redirectPage;

}

/* ===== ROLE CHECK ===== */

function requireLogin(redirectPage = "../login.html") {

const user = getCurrentUser();

if (!user) {
    window.location.href = redirectPage;
    return false;
}

return true;

}

function requireRole(role, redirectPage = "../login.html") {

const user = getCurrentUser();

if (!user) {
    window.location.href = redirectPage;
    return false;
}

if (user.role !== role) {
    alert("You do not have permission to access this page.");
    window.location.href = redirectPage;
    return false;
}

return true;

}

/* ===== ID GENERATOR ===== */

function generateId(prefix = "MLT") {

const time = Date.now().toString(36).toUpperCase();

const random = Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();

return prefix + "-" + time + "-" + random;

}

/* ===== DATE & TIME ===== */

function formatDate(dateValue) {

const date = new Date(dateValue);

if (isNaN(date.getTime())) {
    return "";
}

return date.toLocaleDateString("en-ZM", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});

}

function formatTime(dateValue) {

const date = new Date(dateValue);

if (isNaN(date.getTime())) {
    return "";
}

return date.toLocaleTimeString("en-ZM", {
    hour: "2-digit",
    minute: "2-digit"
});

}

/* ===== MONEY ===== */

function formatKwacha(amount) {

const number = Number(amount);

if (isNaN(number)) {
    return "K0";
}

return "K" + number.toLocaleString("en-ZM", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

}

/* ===== NOTIFICATIONS ===== */

function showMessage(message, type = "info") {

const oldMessage = document.querySelector(".mule-message");

if (oldMessage) {
    oldMessage.remove();
}

const box = document.createElement("div");

box.className = "mule-message";

box.textContent = message;

box.style.position = "fixed";
box.style.left = "14px";
box.style.right = "14px";
box.style.bottom = "18px";
box.style.padding = "13px";
box.style.borderRadius = "9px";
box.style.fontSize = "12px";
box.style.fontWeight = "700";
box.style.zIndex = "9999";
box.style.textAlign = "center";
box.style.boxShadow = "0 5px 20px rgba(0,0,0,.15)";

if (type === "success") {
    box.style.background = "#ecfdf3";
    box.style.color = "#027a48";
} else if (type === "error") {
    box.style.background = "#fff1f2";
    box.style.color = "#b42318";
} else if (type === "warning") {
    box.style.background = "#fff4db";
    box.style.color = "#7a4f00";
} else {
    box.style.background = "#eef3ff";
    box.style.color = "#173b8f";
}

document.body.appendChild(box);

setTimeout(function () {

    if (box) {
        box.remove();
    }

}, 3500);

}

/* ===== CONFIRMATION ===== */

function confirmAction(message, callback) {

if (confirm(message)) {

    if (typeof callback === "function") {
        callback();
    }

}

}

/* ===== SAFE TEXT ===== */

function escapeHTML(value) {

if (value === null || value === undefined) {
    return "";
}

return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* ===== MOBILE MENU ===== */

function toggleMenu() {

document.body.classList.toggle("menu-open");

}

/* ===== WHATSAPP SUPPORT ===== */

function openWhatsApp(message = "Hello Mule Learner Tuition, I need assistance.") {

const phone = "260978362800";

const url =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(message);

window.open(url, "_blank");

}

/* ===== GO BACK ===== */

function goBack() {

if (document.referrer) {
    history.back();
} else {
    window.location.href = "index.html";
}

}