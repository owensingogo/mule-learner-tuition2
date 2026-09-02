/* =========================================
MULE LEARNER TUITION
Teacher JavaScript
========================================= */

"use strict";

/* ===== TEACHER SESSION ===== */

function getTeacher() {

try {
    return JSON.parse(
        localStorage.getItem("muleCurrentUser")
    );
} catch (error) {
    return null;
}

}

/* ===== PROTECT TEACHER PAGES ===== */

function protectTeacherPage() {

const user = getTeacher();

if (!user) {
    window.location.href = "../login.html";
    return false;
}

if (user.role !== "teacher") {
    alert("This page is for teachers only.");
    window.location.href = "../login.html";
    return false;
}

if (user.status === "pending") {
    alert("Your teacher account is awaiting CEO approval.");
    window.location.href = "../login.html";
    return false;
}

if (user.status === "suspended") {
    alert("Your teacher account has been suspended.");
    window.location.href = "../login.html";
    return false;
}

return true;

}

/* ===== DISPLAY TEACHER NAME ===== */

function displayTeacherName() {

const teacher = getTeacher();

if (!teacher) {
    return;
}

document.querySelectorAll(
    "[data-teacher-name]"
).forEach(function(element) {

    element.textContent =
        teacher.name || "Teacher";

});

}

/* ===== TEACHER DATA ===== */

function getTeacherData() {

const teacher = getTeacher();

if (!teacher) {
    return null;
}

const key =
    "muleTeacher_" + teacher.id;

try {

    return JSON.parse(
        localStorage.getItem(key)
    ) || {
        subjects:[],
        classes:[],
        learners:[],
        materials:[],
        liveClasses:[]
    };

} catch (error) {

    return {
        subjects:[],
        classes:[],
        learners:[],
        materials:[],
        liveClasses:[]
    };

}

}

/* ===== SAVE TEACHER DATA ===== */

function saveTeacherData(data) {

const teacher = getTeacher();

if (!teacher) {
    return false;
}

const key =
    "muleTeacher_" + teacher.id;

localStorage.setItem(
    key,
    JSON.stringify(data)
);

return true;

}

/* ===== ADD SUBJECT ===== */

function addTeacherSubject(subject) {

const data = getTeacherData();

if (!data || !subject) {
    return;
}

if (!subject.name) {
    return;
}

const exists =
    data.subjects.some(function(item) {

        return item.name.toLowerCase() ===
               subject.name.toLowerCase();

    });

if (exists) {

    if (typeof showMessage === "function") {
        showMessage(
            "This subject has already been added.",
            "warning"
        );
    }

    return;
}

data.subjects.push({

    id:
        typeof generateId === "function"
        ? generateId("SUB")
        : "SUB-" + Date.now(),

    name:subject.name,

    description:
        subject.description || "",

    createdAt:
        new Date().toISOString()

});

saveTeacherData(data);

if (typeof showMessage === "function") {

    showMessage(
        "Subject added successfully.",
        "success"
    );

}

}

/* ===== CREATE CLASS ===== */

function createTeacherClass(classData) {

const data = getTeacherData();

if (!data || !classData) {
    return;
}

if (!classData.name) {
    if (typeof showMessage === "function") {
        showMessage(
            "Please enter a class name.",
            "error"
        );
    }
    return;
}

const newClass = {

    id:
        typeof generateId === "function"
        ? generateId("CLS")
        : "CLS-" + Date.now(),

    name:classData.name,

    subject:
        classData.subject || "General",

    date:
        classData.date || "",

    time:
        classData.time || "",

    status:"scheduled",

    createdAt:
        new Date().toISOString()

};

data.classes.push(newClass);

saveTeacherData(data);

if (typeof showMessage === "function") {

    showMessage(
        "Class scheduled successfully.",
        "success"
    );

}

}

/* ===== GET TEACHER CLASSES ===== */

function getTeacherClasses() {

const data = getTeacherData();

if (!data) {
    return [];
}

return data.classes || [];

}

/* ===== ADD LEARNER ===== */

function addLearnerToTeacher(learner) {

const data = getTeacherData();

if (!data || !learner) {
    return;
}

const exists =
    data.learners.some(function(item) {

        return item.id === learner.id;

    });

if (exists) {
    return;
}

data.learners.push({

    id:learner.id,

    name:
        learner.name || "Learner",

    email:
        learner.email || "",

    addedAt:
        new Date().toISOString()

});

saveTeacherData(data);

}

/* ===== ADD MATERIAL ===== */

function addTeacherMaterial(material) {

const data = getTeacherData();

if (!data || !material) {
    return;
}

if (!material.title) {
    if (typeof showMessage === "function") {
        showMessage(
            "Please enter a material title.",
            "error"
        );
    }
    return;
}

data.materials.push({

    id:
        typeof generateId === "function"
        ? generateId("MAT")
        : "MAT-" + Date.now(),

    title:material.title,

    subject:
        material.subject || "",

    description:
        material.description || "",

    file:
        material.file || "",

    createdAt:
        new Date().toISOString()

});

saveTeacherData(data);

if (typeof showMessage === "function") {

    showMessage(
        "Learning material added.",
        "success"
    );

}

}

/* ===== START LIVE CLASS ===== */

function startTeacherLiveClass(classData) {

if (!classData) {
    return;
}

const teacher =
    getTeacher();

if (!teacher) {
    return;
}

let liveClasses = [];

try {

    liveClasses =
        JSON.parse(
            localStorage.getItem(
                "muleLiveClasses"
            )
        ) || [];

} catch (error) {

    liveClasses = [];

}

const liveClass = {

    id:
        classData.id ||
        (
            typeof generateId === "function"
            ? generateId("LIVE")
            : "LIVE-" + Date.now()
        ),

    teacherId:
        teacher.id,

    teacherName:
        teacher.name,

    title:
        classData.title ||
        classData.name ||
        "Live Class",

    subject:
        classData.subject || "",

    status:"live",

    startedAt:
        new Date().toISOString()

};

liveClasses.push(liveClass);

localStorage.setItem(
    "muleLiveClasses",
    JSON.stringify(liveClasses)
);

if (typeof showMessage === "function") {

    showMessage(
        "Live class started.",
        "success"
    );

}

return liveClass;

}

/* ===== END LIVE CLASS ===== */

function endTeacherLiveClass(liveClassId) {

let liveClasses = [];

try {

    liveClasses =
        JSON.parse(
            localStorage.getItem(
                "muleLiveClasses"
            )
        ) || [];

} catch (error) {

    liveClasses = [];

}

liveClasses =
    liveClasses.map(function(item) {

        if (item.id === liveClassId) {

            item.status = "ended";

            item.endedAt =
                new Date().toISOString();

        }

        return item;

    });

localStorage.setItem(
    "muleLiveClasses",
    JSON.stringify(liveClasses)
);

if (typeof showMessage === "function") {

    showMessage(
        "Live class ended.",
        "success"
    );

}

}

/* ===== TEACHER COUNTS ===== */

function updateTeacherCounts() {

const data = getTeacherData();

if (!data) {
    return;
}

const subjects =
    document.querySelector(
        "[data-teacher-subject-count]"
    );

const classes =
    document.querySelector(
        "[data-teacher-class-count]"
    );

const learners =
    document.querySelector(
        "[data-teacher-learner-count]"
    );

const materials =
    document.querySelector(
        "[data-teacher-material-count]"
    );

if (subjects) {
    subjects.textContent =
        (data.subjects || []).length;
}

if (classes) {
    classes.textContent =
        (data.classes || []).length;
}

if (learners) {
    learners.textContent =
        (data.learners || []).length;
}

if (materials) {
    materials.textContent =
        (data.materials || []).length;
}

}

/* ===== TEACHER LOGOUT ===== */

function teacherLogout() {

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

    displayTeacherName();

    updateTeacherCounts();

}

);