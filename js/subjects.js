/* =========================================
MULE LEARNER TUITION
Subjects JavaScript
========================================= */

"use strict";

const SUBJECTS_KEY = "muleSubjects";

/* ===== DEFAULT SUBJECTS ===== */

const DEFAULT_SUBJECTS = [
{
id:"SUB-MATH",
name:"Mathematics",
description:"Numbers, calculations, problem solving and mathematical reasoning."
},
{
id:"SUB-ENG",
name:"English",
description:"Reading, writing, grammar, spelling and communication."
},
{
id:"SUB-ICT",
name:"ICT",
description:"Computer studies, digital skills and information technology."
},
{
id:"SUB-SCI",
name:"Science",
description:"Scientific knowledge, experiments and understanding the world."
}
];

/* ===== GET SUBJECTS ===== */

function getSubjects() {

try {

    const saved =
        JSON.parse(
            localStorage.getItem(SUBJECTS_KEY)
        );

    if (Array.isArray(saved)) {
        return saved;
    }

    localStorage.setItem(
        SUBJECTS_KEY,
        JSON.stringify(DEFAULT_SUBJECTS)
    );

    return DEFAULT_SUBJECTS;

} catch (error) {

    return DEFAULT_SUBJECTS;

}

}

/* ===== SAVE SUBJECTS ===== */

function saveSubjects(subjects) {

localStorage.setItem(
    SUBJECTS_KEY,
    JSON.stringify(subjects)
);

}

/* ===== ADD SUBJECT ===== */

function addSubject(name, description = "") {

const cleanName =
    String(name || "").trim();

if (!cleanName) {

    if (typeof showMessage === "function") {
        showMessage(
            "Please enter a subject name.",
            "error"
        );
    }

    return false;
}

const subjects = getSubjects();

const exists =
    subjects.some(function(subject) {

        return subject.name.toLowerCase() ===
               cleanName.toLowerCase();

    });

if (exists) {

    if (typeof showMessage === "function") {
        showMessage(
            "This subject already exists.",
            "warning"
        );
    }

    return false;
}

const subject = {

    id:
        typeof generateId === "function"
        ? generateId("SUB")
        : "SUB-" + Date.now(),

    name:cleanName,

    description:
        String(description || "").trim(),

    createdAt:
        new Date().toISOString()

};

subjects.push(subject);

saveSubjects(subjects);

if (typeof showMessage === "function") {
    showMessage(
        "Subject added successfully.",
        "success"
    );
}

return subject;

}

/* ===== FIND SUBJECT ===== */

function getSubjectById(id) {

return getSubjects().find(function(subject) {

    return subject.id === id;

});

}

/* ===== DELETE SUBJECT ===== */

function deleteSubject(id) {

const subjects = getSubjects();

const subject =
    subjects.find(function(item) {
        return item.id === id;
    });

if (!subject) {
    return false;
}

const confirmed =
    confirm(
        "Delete " + subject.name + "?"
    );

if (!confirmed) {
    return false;
}

const updated =
    subjects.filter(function(item) {
        return item.id !== id;
    });

saveSubjects(updated);

if (typeof showMessage === "function") {
    showMessage(
        "Subject deleted.",
        "success"
    );
}

return true;

}

/* ===== DISPLAY SUBJECTS ===== */

function renderSubjects(containerId) {

const container =
    document.getElementById(containerId);

if (!container) {
    return;
}

const subjects = getSubjects();

container.innerHTML = "";

if (subjects.length === 0) {

    container.innerHTML =
        "<p>No subjects available.</p>";

    return;
}

subjects.forEach(function(subject) {

    const card =
        document.createElement("div");

    card.className =
        "teacher-subject";

    card.innerHTML =

        '<div class="teacher-subject-icon">📚</div>' +

        '<h3>' +
        escapeHTML(subject.name) +
        '</h3>' +

        '<p>' +
        escapeHTML(
            subject.description ||
            "Learning subject"
        ) +
        '</p>';

    container.appendChild(card);

});

}

/* ===== SUBJECT SELECT ===== */

function populateSubjectSelect(selectId) {

const select =
    document.getElementById(selectId);

if (!select) {
    return;
}

const subjects = getSubjects();

select.innerHTML =
    '<option value="">Select subject</option>';

subjects.forEach(function(subject) {

    const option =
        document.createElement("option");

    option.value =
        subject.id;

    option.textContent =
        subject.name;

    select.appendChild(option);

});

}

/* ===== PAGE START ===== */

document.addEventListener(
"DOMContentLoaded",
function() {

    const subjectContainer =
        document.querySelector(
            "[data-subjects]"
        );

    if (subjectContainer) {

        renderSubjects(
            subjectContainer.id
        );

    }

}

);