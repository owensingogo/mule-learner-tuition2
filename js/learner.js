/* =========================================
MULE LEARNER TUITION
Learner JavaScript
========================================= */

"use strict";

/* ===== LEARNER SESSION ===== */

function getLearner() {

try {
    return JSON.parse(
        localStorage.getItem("muleCurrentUser")
    );
} catch (error) {
    return null;
}

}

/* ===== PROTECT LEARNER PAGES ===== */

function protectLearnerPage() {

const user = getLearner();

if (!user) {
    window.location.href = "../login.html";
    return false;
}

if (user.role !== "learner") {
    alert("This page is for learners only.");
    window.location.href = "../login.html";
    return false;
}

return true;

}

/* ===== DISPLAY LEARNER NAME ===== */

function displayLearnerName() {

const user = getLearner();

if (!user) {
    return;
}

document.querySelectorAll(
    "[data-learner-name]"
).forEach(function(element) {

    element.textContent = user.name || "Learner";

});

}

/* ===== LEARNER DATA ===== */

function getLearnerData() {

const user = getLearner();

if (!user) {
    return null;
}

const key = "muleLearner_" + user.id;

try {

    return JSON.parse(
        localStorage.getItem(key)
    ) || {
        subjects:[],
        classes:[],
        materials:[],
        payments:[],
        notifications:[]
    };

} catch (error) {

    return {
        subjects:[],
        classes:[],
        materials:[],
        payments:[],
        notifications:[]
    };

}

}

/* ===== SAVE LEARNER DATA ===== */

function saveLearnerData(data) {

const user = getLearner();

if (!user) {
    return false;
}

const key = "muleLearner_" + user.id;

localStorage.setItem(
    key,
    JSON.stringify(data)
);

return true;

}

/* ===== ENROL SUBJECT ===== */

function enrolSubject(subject) {

const data = getLearnerData();

if (!data) {
    return;
}

const exists = data.subjects.some(function(item) {
    return item.name === subject.name;
});

if (exists) {

    if (typeof showMessage === "function") {
        showMessage(
            "You are already enrolled in this subject.",
            "warning"
        );
    }

    return;
}

data.subjects.push({
    id:subject.id || generateLearnerId(),
    name:subject.name,
    teacher:subject.teacher || "To be assigned",
    enrolledAt:new Date().toISOString()
});

saveLearnerData(data);

if (typeof showMessage === "function") {
    showMessage(
        "Subject added successfully.",
        "success"
    );
}

}

/* ===== LEARNER ID ===== */

function generateLearnerId() {

return "LRN-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random()
        .toString(36)
        .substring(2,6)
        .toUpperCase();

}

/* ===== COUNT LEARNER DATA ===== */

function updateLearnerCounts() {

const data = getLearnerData();

if (!data) {
    return;
}

const counts = {

    subjects:
        data.subjects
        ? data.subjects.length
        : 0,

    classes:
        data.classes
        ? data.classes.length
        : 0,

    materials:
        data.materials
        ? data.materials.length
        : 0,

    payments:
        data.payments
        ? data.payments.length
        : 0

};

const subjectCount =
    document.querySelector("[data-subject-count]");

const classCount =
    document.querySelector("[data-class-count]");

const materialCount =
    document.querySelector("[data-material-count]");

const paymentCount =
    document.querySelector("[data-payment-count]");

if (subjectCount) {
    subjectCount.textContent = counts.subjects;
}

if (classCount) {
    classCount.textContent = counts.classes;
}

if (materialCount) {
    materialCount.textContent = counts.materials;
}

if (paymentCount) {
    paymentCount.textContent = counts.payments;
}

}

/* ===== FIND LIVE CLASS ===== */

function getLiveClasses() {

try {

    return JSON.parse(
        localStorage.getItem("muleLiveClasses")
    ) || [];

} catch (error) {

    return [];

}

}

/* ===== CHECK LIVE CLASSES ===== */

function showLiveClassStatus() {

const liveClasses = getLiveClasses();

const liveNow =
    liveClasses.filter(function(item) {
        return item.status === "live";
    });

document.querySelectorAll(
    "[data-live-count]"
).forEach(function(element) {

    element.textContent = liveNow.length;

});

}

/* ===== LOGOUT ===== */

function learnerLogout() {

const confirmed =
    confirm("Are you sure you want to logout?");

if (!confirmed) {
    return;
}

localStorage.removeItem(
    "muleCurrentUser"
);

window.location.href =
    "../login.html";

}

/* ===== PAGE START ===== */

document.addEventListener(
"DOMContentLoaded",
function() {

    displayLearnerName();

    updateLearnerCounts();

    showLiveClassStatus();

}

);