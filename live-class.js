/* =========================================
MULE LEARNER TUITION
Live Class JavaScript
========================================= */

"use strict";

const LIVE_CLASSES_KEY = "muleLiveClasses";

/* ===== GET LIVE CLASSES ===== */

function getLiveClasses() {

try {

    return JSON.parse(
        localStorage.getItem(
            LIVE_CLASSES_KEY
        )
    ) || [];

} catch (error) {

    return [];

}

}

/* ===== SAVE LIVE CLASSES ===== */

function saveLiveClasses(classes) {

localStorage.setItem(
    LIVE_CLASSES_KEY,
    JSON.stringify(classes)
);

}

/* ===== CREATE LIVE CLASS ===== */

function createLiveClass(data) {

if (!data) {
    return false;
}

const teacher =
    typeof getTeacher === "function"
    ? getTeacher()
    : null;

const liveClass = {

    id:
        typeof generateId === "function"
        ? generateId("LIVE")
        : "LIVE-" + Date.now(),

    title:
        data.title ||
        "Live Learning Class",

    subject:
        data.subject || "",

    teacherId:
        data.teacherId ||
        (teacher ? teacher.id : ""),

    teacherName:
        data.teacherName ||
        (teacher ? teacher.name : "Teacher"),

    date:
        data.date || "",

    time:
        data.time || "",

    meetingLink:
        data.meetingLink || "",

    status:"scheduled",

    createdAt:
        new Date().toISOString()

};

if (
    !liveClass.title ||
    !liveClass.subject
) {

    if (typeof showMessage === "function") {

        showMessage(
            "Please enter the class title and subject.",
            "error"
        );

    } else {

        alert(
            "Please enter the class title and subject."
        );

    }

    return false;
}

const classes =
    getLiveClasses();

classes.push(liveClass);

saveLiveClasses(classes);

if (typeof showMessage === "function") {

    showMessage(
        "Live class scheduled.",
        "success"
    );

}

return liveClass;

}

/* ===== START LIVE CLASS ===== */

function startLiveClass(classId) {

const classes =
    getLiveClasses();

const liveClass =
    classes.find(function(item) {

        return item.id === classId;

    });

if (!liveClass) {

    alert("Live class not found.");

    return false;
}

liveClass.status = "live";

liveClass.startedAt =
    new Date().toISOString();

saveLiveClasses(classes);

if (typeof showMessage === "function") {

    showMessage(
        "Live class started.",
        "success"
    );

}

return true;

}

/* ===== END LIVE CLASS ===== */

function endLiveClass(classId) {

const classes =
    getLiveClasses();

const liveClass =
    classes.find(function(item) {

        return item.id === classId;

    });

if (!liveClass) {
    return false;
}

liveClass.status = "ended";

liveClass.endedAt =
    new Date().toISOString();

saveLiveClasses(classes);

if (typeof showMessage === "function") {

    showMessage(
        "Live class ended.",
        "success"
    );

}

return true;

}

/* ===== GET ACTIVE CLASSES ===== */

function getActiveLiveClasses() {

return getLiveClasses().filter(
    function(item) {

        return item.status === "live";

    }
);

}

/* ===== GET UPCOMING LIVE CLASSES ===== */

function getUpcomingLiveClasses() {

return getLiveClasses().filter(
    function(item) {

        return item.status === "scheduled";

    }
);

}

/* ===== FIND LIVE CLASS ===== */

function getLiveClassById(id) {

return getLiveClasses().find(
    function(item) {

        return item.id === id;

    }
);

}

/* ===== JOIN LIVE CLASS ===== */

function joinLiveClass(classId) {

const liveClass =
    getLiveClassById(classId);

if (!liveClass) {

    alert("Live class not found.");

    return false;
}

if (liveClass.status !== "live") {

    alert(
        "This class is not live yet."
    );

    return false;
}

/*
   A real video room will use the
   meetingLink when a live-learning
   service is connected.
*/

if (liveClass.meetingLink) {

    window.open(
        liveClass.meetingLink,
        "_blank"
    );

    return true;
}

/*
   Temporary teaching-room message.
   This prevents the system from
   pretending that a real video service
   is already connected.
*/

alert(
    "The teaching room will open when the live-learning service is connected to Mule Learner Tuition."
);

return false;

}

/* ===== DELETE LIVE CLASS ===== */

function deleteLiveClass(classId) {

const classes =
    getLiveClasses();

const liveClass =
    classes.find(function(item) {

        return item.id === classId;

    });

if (!liveClass) {
    return false;
}

const confirmed =
    confirm(
        "Delete this live class?"
    );

if (!confirmed) {
    return false;
}

const updated =
    classes.filter(function(item) {

        return item.id !== classId;

    });

saveLiveClasses(updated);

if (typeof showMessage === "function") {

    showMessage(
        "Live class deleted.",
        "success"
    );

}

return true;

}

/* ===== RENDER LIVE CLASSES ===== */

function renderLiveClasses(containerId) {

const container =
    document.getElementById(
        containerId
    );

if (!container) {
    return;
}

const classes =
    getLiveClasses();

container.innerHTML = "";

if (classes.length === 0) {

    container.innerHTML =
        "<p>No live classes available.</p>";

    return;
}

classes.forEach(function(item) {

    const card =
        document.createElement("div");

    card.className =
        "live-class-card";

    const status =
        item.status === "live"
        ? "🔴 LIVE"
        : item.status === "ended"
        ? "⚫ ENDED"
        : "🟡 SCHEDULED";

    card.innerHTML =

        "<h3>" +
        escapeHTML(item.title) +
        "</h3>" +

        "<p>" +
        escapeHTML(item.subject) +
        "</p>" +

        "<p>" +
        escapeHTML(item.teacherName) +
        "</p>" +

        "<p>" +
        status +
        "</p>";

    if (item.status === "live") {

        const button =
            document.createElement("button");

        button.textContent =
            "Join Live Class";

        button.type = "button";

        button.onclick =
            function() {

                joinLiveClass(item.id);

            };

        card.appendChild(button);

    }

    container.appendChild(card);

});

}

/* ===== PAGE START ===== */

document.addEventListener(
"DOMContentLoaded",
function() {

    const container =
        document.querySelector(
            "[data-live-classes]"
        );

    if (container) {

        renderLiveClasses(
            container.id
        );

    }

}

);