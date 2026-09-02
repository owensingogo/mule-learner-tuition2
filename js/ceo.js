/* =========================================
MULE LEARNER TUITION
CEO Control Centre JavaScript
========================================= */

"use strict";

/* ===== CEO SESSION ===== */

function getCEO() {

try {
    return JSON.parse(
        localStorage.getItem("muleCurrentUser")
    );
} catch (error) {
    return null;
}

}

/* ===== PROTECT CEO PAGES ===== */

function protectCEOPage() {

const user = getCEO();

if (!user) {
    window.location.href = "../login.html";
    return false;
}

if (user.role !== "ceo") {
    alert("CEO access only.");
    window.location.href = "../login.html";
    return false;
}

return true;

}

/* ===== GET ALL USERS ===== */

function getAllUsers() {

try {

    return JSON.parse(
        localStorage.getItem("muleUsers")
    ) || [];

} catch (error) {

    return [];

}

}

/* ===== SAVE ALL USERS ===== */

function saveAllUsers(users) {

localStorage.setItem(
    "muleUsers",
    JSON.stringify(users)
);

}

/* ===== LEARNERS ===== */

function getAllLearners() {

return getAllUsers().filter(function(user) {
    return user.role === "learner";
});

}

/* ===== TEACHERS ===== */

function getAllTeachers() {

return getAllUsers().filter(function(user) {
    return user.role === "teacher";
});

}

/* ===== TEACHER APPLICATIONS ===== */

function getTeacherApplications() {

return getAllTeachers().filter(function(user) {
    return user.status === "pending";
});

}

/* ===== APPROVE TEACHER ===== */

function approveTeacher(teacherId) {

const users = getAllUsers();

const teacher =
    users.find(function(user) {
        return user.id === teacherId &&
               user.role === "teacher";
    });

if (!teacher) {

    if (typeof showMessage === "function") {
        showMessage(
            "Teacher account not found.",
            "error"
        );
    }

    return false;
}

teacher.status = "active";

teacher.approvedAt =
    new Date().toISOString();

saveAllUsers(users);

if (typeof showMessage === "function") {
    showMessage(
        "Teacher approved successfully.",
        "success"
    );
}

return true;

}

/* ===== REJECT TEACHER ===== */

function rejectTeacher(teacherId) {

const users = getAllUsers();

const teacher =
    users.find(function(user) {
        return user.id === teacherId &&
               user.role === "teacher";
    });

if (!teacher) {
    return false;
}

teacher.status = "rejected";

teacher.rejectedAt =
    new Date().toISOString();

saveAllUsers(users);

if (typeof showMessage === "function") {
    showMessage(
        "Teacher application rejected.",
        "warning"
    );
}

return true;

}

/* ===== SUSPEND USER ===== */

function suspendUser(userId) {

const users = getAllUsers();

const user =
    users.find(function(account) {
        return account.id === userId;
    });

if (!user) {
    return false;
}

if (user.role === "ceo") {
    alert("The CEO account cannot be suspended here.");
    return false;
}

user.status = "suspended";

saveAllUsers(users);

if (typeof showMessage === "function") {
    showMessage(
        "Account suspended.",
        "success"
    );
}

return true;

}

/* ===== ACTIVATE USER ===== */

function activateUser(userId) {

const users = getAllUsers();

const user =
    users.find(function(account) {
        return account.id === userId;
    });

if (!user) {
    return false;
}

user.status = "active";

saveAllUsers(users);

if (typeof showMessage === "function") {
    showMessage(
        "Account activated.",
        "success"
    );
}

return true;

}

/* ===== DELETE USER ===== */

function deleteUser(userId) {

const users = getAllUsers();

const user =
    users.find(function(account) {
        return account.id === userId;
    });

if (!user) {
    return false;
}

if (user.role === "ceo") {
    alert("The CEO account cannot be deleted here.");
    return false;
}

const confirmed =
    confirm(
        "Are you sure you want to delete this account?"
    );

if (!confirmed) {
    return false;
}

const updatedUsers =
    users.filter(function(account) {
        return account.id !== userId;
    });

saveAllUsers(updatedUsers);

if (typeof showMessage === "function") {
    showMessage(
        "Account deleted.",
        "success"
    );
}

return true;

}

/* ===== PLATFORM STATISTICS ===== */

function getCEOStatistics() {

const users = getAllUsers();

const learners =
    users.filter(function(user) {
        return user.role === "learner";
    });

const teachers =
    users.filter(function(user) {
        return user.role === "teacher";
    });

const pendingTeachers =
    teachers.filter(function(user) {
        return user.status === "pending";
    });

let payments = [];

try {

    payments =
        JSON.parse(
            localStorage.getItem(
                "mulePayments"
            )
        ) || [];

} catch (error) {

    payments = [];

}

const pendingPayments =
    payments.filter(function(payment) {
        return payment.status === "pending";
    });

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

const activeLiveClasses =
    liveClasses.filter(function(item) {
        return item.status === "live";
    });

return {

    learners:learners.length,

    teachers:teachers.length,

    pendingTeachers:
        pendingTeachers.length,

    pendingPayments:
        pendingPayments.length,

    liveClasses:
        activeLiveClasses.length

};

}

/* ===== UPDATE DASHBOARD NUMBERS ===== */

function updateCEOStatistics() {

const stats =
    getCEOStatistics();

const learnerCount =
    document.querySelector(
        "[data-ceo-learners]"
    );

const teacherCount =
    document.querySelector(
        "[data-ceo-teachers]"
    );

const paymentCount =
    document.querySelector(
        "[data-ceo-payments]"
    );

const liveCount =
    document.querySelector(
        "[data-ceo-live]"
    );

if (learnerCount) {
    learnerCount.textContent =
        stats.learners;
}

if (teacherCount) {
    teacherCount.textContent =
        stats.teachers;
}

if (paymentCount) {
    paymentCount.textContent =
        stats.pendingPayments;
}

if (liveCount) {
    liveCount.textContent =
        stats.liveClasses;
}

}

/* ===== CEO LOGOUT ===== */

function ceoLogout() {

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

    updateCEOStatistics();

}

);