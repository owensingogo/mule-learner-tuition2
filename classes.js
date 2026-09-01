/* =========================================
MULE LEARNER TUITION
Classes JavaScript
========================================= */

"use strict";

const CLASSES_KEY = "muleClasses";

/* ===== GET CLASSES ===== */

function getClasses() {

try {
    return JSON.parse(
        localStorage.getItem(CLASSES_KEY)
    ) || [];
} catch (error) {
    return [];
}

}

/* ===== SAVE CLASSES ===== */

function saveClasses(classes) {

localStorage.setItem(
    CLASSES_KEY,
    JSON.stringify(classes)
);

}

/* ===== CREATE CLASS ===== */

function createClass(classData) {

if (!classData) {
    return false;
}

const name =
    String(classData.name || "").trim();

const subject =
    String(classData.subject || "").trim();

const date =
    String(classData.date || "").trim();

const time =
    String(classData.time || "").trim();

if (!name || !subject || !date || !time) {

    if (typeof showMessage === "function") {
        showMessage(
            "Please complete all class details.",
            "error"
        );
    } else {
        alert("Please complete all class details.");
    }

    return false;
}

const classes = getClasses();

const newClass = {

    id:
        typeof generateId === "function"
        ? generateId("CLS")
        : "CLS-" + Date.now(),

    name:name,

    subject:subject,

    teacherId:
        classData.teacherId || "",

    teacherName:
        classData.teacherName || "To be assigned",

    date:date,

    time:time,

    duration:
        classData.duration || "1 hour",

    status:"scheduled",

    createdAt:
        new Date().toISOString()

};

classes.push(newClass);

saveClasses(classes);

if (typeof showMessage === "function") {
    showMessage(
        "Class created successfully.",
        "success"
    );
}

return newClass;

}

/* ===== FIND CLASS ===== */

function getClassById(id) {

return getClasses().find(function(item) {

    return item.id === id;

});

}

/* ===== UPDATE CLASS ===== */

function updateClass(id, changes) {

const classes = getClasses();

const classItem =
    classes.find(function(item) {
        return item.id === id;
    });

if (!classItem) {
    return false;
}

Object.keys(changes || {}).forEach(function(key) {

    if (key !== "id") {
        classItem[key] = changes[key];
    }

});

classItem.updatedAt =
    new Date().toISOString();

saveClasses(classes);

if (typeof showMessage === "function") {
    showMessage(
        "Class updated successfully.",
        "success"
    );
}

return true;

}

/* ===== DELETE CLASS ===== */

function deleteClass(id) {

const classes = getClasses();

const classItem =
    classes.find(function(item) {
        return item.id === id;
    });

if (!classItem) {
    return false;
}

const confirmed =
    confirm(
        "Delete this class?"
    );

if (!confirmed) {
    return false;
}

const updated =
    classes.filter(function(item) {
        return item.id !== id;
    });

saveClasses(updated);

if (typeof showMessage === "function") {
    showMessage(
        "Class deleted.",
        "success"
    );
}

return true;

}

/* ===== ASSIGN TEACHER ===== */

function assignTeacher(
classId,
teacherId,
teacherName
) {

return updateClass(
    classId,
    {
        teacherId:teacherId,
        teacherName:
            teacherName || "Teacher"
    }
);

}

/* ===== GET TEACHER CLASSES ===== */

function getClassesForTeacher(teacherId) {

return getClasses().filter(function(item) {

    return item.teacherId === teacherId;

});

}

/* ===== GET UPCOMING CLASSES ===== */

function getUpcomingClasses() {

const now = new Date();

return getClasses()
    .filter(function(item) {

        if (item.status === "ended") {
            return false;
        }

        const classDate =
            new Date(
                item.date + "T" + item.time
            );

        return classDate >= now;

    })
    .sort(function(a,b) {

        const dateA =
            new Date(
                a.date + "T" + a.time
            );

        const dateB =
            new Date(
                b.date + "T" + b.time
            );

        return dateA - dateB;

    });

}

/* ===== START CLASS ===== */

function startClass(id) {

const classes = getClasses();

const classItem =
    classes.find(function(item) {
        return item.id === id;
    });

if (!classItem) {
    return false;
}

classItem.status = "live";

classItem.startedAt =
    new Date().toISOString();

saveClasses(classes);

if (typeof showMessage === "function") {
    showMessage(
        "Class is now live.",
        "success"
    );
}

return true;

}

/* ===== END CLASS ===== */

function endClass(id) {

const classes = getClasses();

const classItem =
    classes.find(function(item) {
        return item.id === id;
    });

if (!classItem) {
    return false;
}

classItem.status = "ended";

classItem.endedAt =
    new Date().toISOString();

saveClasses(classes);

if (typeof showMessage === "function") {
    showMessage(
        "Class has ended.",
        "success"
    );
}

return true;

}

/* ===== RENDER CLASSES ===== */

function renderClasses(containerId) {

const container =
    document.getElementById(containerId);

if (!container) {
    return;
}

const classes =
    getUpcomingClasses();

container.innerHTML = "";

if (classes.length === 0) {

    container.innerHTML =
        '<div class="teacher-content-card">' +
        '<p>No upcoming classes.</p>' +
        '</div>';

    return;
}

classes.forEach(function(item) {

    const card =
        document.createElement("div");

    card.className =
        "teacher-class";

    card.innerHTML =

        "<h3>" +
        escapeHTML(item.name) +
        "</h3>" +

        "<p>" +
        escapeHTML(item.subject) +
        "</p>" +

        '<div class="class-meta">' +

        "<span>📅 " +
        escapeHTML(item.date) +
        "</span>" +

        "<span>🕐 " +
        escapeHTML(item.time) +
        "</span>" +

        "<span>👨‍🏫 " +
        escapeHTML(item.teacherName) +
        "</span>" +

        "</div>";

    container.appendChild(card);

});

}

/* ===== PAGE START ===== */

document.addEventListener(
"DOMContentLoaded",
function() {

    const container =
        document.querySelector(
            "[data-classes]"
        );

    if (container) {

        renderClasses(
            container.id
        );

    }

}

);