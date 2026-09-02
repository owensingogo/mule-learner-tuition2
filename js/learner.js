/* =========================================
MULE LEARNER TUITION
Learner JavaScript
========================================= */

"use strict";

/* ===== FIREBASE ===== */

const learnerFirebaseConfig = {
    apiKey: "AIzaSyCRW0JTsN5kQ5De-MgoN8Bd6u2t2VvmLF7M",
    authDomain: "mule-learner-tuition-264fe.firebaseapp.com",
    databaseURL: "https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com",
    projectId: "mule-learner-tuition-264fe",
    storageBucket: "mule-learner-tuition-264fe.firebasestorage.app",
    messagingSenderId: "656883565460",
    appId: "1:656883565460:web:3aaa6a5b638a34a6d28581"
};

if (!firebase.apps.length) {
    firebase.initializeApp(learnerFirebaseConfig);
}

const learnerDB = firebase.database();


/* ===== NORMALIZE PHONE ===== */

function normalizeLearnerPhone(phone) {

    phone = String(phone || "")
        .trim()
        .replace(/\s+/g, "");

    if (phone.startsWith("+260")) {
        phone = "0" + phone.substring(4);
    }

    if (phone.startsWith("260")) {
        phone = "0" + phone.substring(3);
    }

    return phone;
}


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

    if (String(user.role).toLowerCase() !== "learner") {

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

        element.textContent =
            user.name || "Learner";

    });

}


/* =========================================
CHECK ACTIVE APPROVED LEARNING ACCESS
========================================= */

async function checkLearningAccess() {

    const user = getLearner();

    if (!user) {

        return {
            active: false,
            reason: "not_logged_in"
        };

    }

    const learnerId =
        String(user.id || "").trim();

    const learnerPhone =
        normalizeLearnerPhone(user.phone);

    if (!learnerId && !learnerPhone) {

        return {
            active: false,
            reason: "invalid_account"
        };

    }

    try {

        const snapshot =
            await learnerDB.ref("mulePayments").once("value");

        const payments =
            snapshot.val() || {};

        let activePayment = null;

        Object.keys(payments).forEach(function(key) {

            const payment = payments[key];

            if (!payment) {
                return;
            }

            const paymentLearnerId =
                String(
                    payment.learnerId ||
                    payment.userId ||
                    ""
                ).trim();

            const paymentPhone =
                normalizeLearnerPhone(
                    payment.learnerPhone ||
                    payment.phone ||
                    payment.phoneNumber ||
                    ""
                );

            const status =
                String(
                    payment.status || ""
                ).toLowerCase()
                .trim();

            const expiresAt =
                Number(
                    payment.expiresAt || 0
                );

            const matchesAccount =
                (
                    learnerId &&
                    paymentLearnerId === learnerId
                ) ||
                (
                    learnerPhone &&
                    paymentPhone === learnerPhone
                );

            const isApproved =
                status === "approved";

            const isActive =
                expiresAt > Date.now();

            if (
                matchesAccount &&
                isApproved &&
                isActive
            ) {

                if (
                    !activePayment ||
                    expiresAt >
                    Number(activePayment.expiresAt || 0)
                ) {

                    activePayment = payment;

                }

            }

        });


        /* ===== ACTIVE PAYMENT FOUND ===== */

        if (activePayment) {

            return {

                active: true,

                payment: activePayment,

                plan:
                    activePayment.plan || "",

                expiresAt:
                    Number(activePayment.expiresAt),

                learnerId:
                    learnerId,

                learnerPhone:
                    learnerPhone

            };

        }


        /* =========================================
        CHECK FREE TRIAL
        ========================================= */

        let freeTrial = null;

        Object.keys(payments).forEach(function(key) {

            const payment = payments[key];

            if (!payment) {
                return;
            }

            const paymentLearnerId =
                String(
                    payment.learnerId ||
                    payment.userId ||
                    ""
                ).trim();

            const paymentPhone =
                normalizeLearnerPhone(
                    payment.learnerPhone ||
                    payment.phone ||
                    payment.phoneNumber ||
                    ""
                );

            const matchesAccount =
                (
                    learnerId &&
                    paymentLearnerId === learnerId
                ) ||
                (
                    learnerPhone &&
                    paymentPhone === learnerPhone
                );

            const isFreeTrial =
                payment.isFreeTrial === true ||
                String(payment.plan || "")
                    .toLowerCase()
                    .includes("free trial");

            const status =
                String(
                    payment.status || ""
                ).toLowerCase();

            const expiresAt =
                Number(payment.expiresAt || 0);

            if (
                matchesAccount &&
                isFreeTrial &&
                status === "approved" &&
                expiresAt > Date.now()
            ) {

                freeTrial = payment;

            }

        });


        if (freeTrial) {

            return {

                active: true,

                payment: freeTrial,

                plan:
                    freeTrial.plan ||
                    "Free Trial - 6 Hours",

                expiresAt:
                    Number(freeTrial.expiresAt),

                learnerId:
                    learnerId,

                learnerPhone:
                    learnerPhone

            };

        }


        return {

            active: false,

            reason: "no_active_plan"

        };

    } catch (error) {

        console.error(
            "Learning access check failed:",
            error
        );

        return {

            active: false,

            reason: "firebase_error",

            error: error

        };

    }

}


/* =========================================
PROTECT PAGE USING PAYMENT ACCESS
========================================= */

async function requireLearningAccess(
    redirectPage = "payments.html"
) {

    const user = getLearner();

    if (!user) {

        window.location.href = "../login.html";

        return false;

    }

    const result =
        await checkLearningAccess();

    if (result.active) {

        return true;

    }

    alert(
        "Learning access is locked. No active approved learning plan was found for this account. If you have already paid, please make sure the CEO has approved the payment."
    );

    window.location.href =
        redirectPage;

    return false;

}


/* ===== LEARNER DATA ===== */

function getLearnerData() {

    const user = getLearner();

    if (!user) {
        return null;
    }

    const key =
        "muleLearner_" + user.id;

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || {

            subjects: [],
            classes: [],
            materials: [],
            payments: [],
            notifications: []

        };

    } catch (error) {

        return {

            subjects: [],
            classes: [],
            materials: [],
            payments: [],
            notifications: []

        };

    }

}


/* ===== SAVE LEARNER DATA ===== */

function saveLearnerData(data) {

    const user = getLearner();

    if (!user) {
        return false;
    }

    const key =
        "muleLearner_" + user.id;

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

    return true;

}


/* ===== ENROL SUBJECT ===== */

function enrolSubject(subject) {

    const data =
        getLearnerData();

    if (!data) {
        return;
    }

    const exists =
        data.subjects.some(function(item) {

            return item.name === subject.name;

        });

    if (exists) {

        if (
            typeof showMessage === "function"
        ) {

            showMessage(
                "You are already enrolled in this subject.",
                "warning"
            );

        }

        return;

    }

    data.subjects.push({

        id:
            subject.id ||
            generateLearnerId(),

        name:
            subject.name,

        teacher:
            subject.teacher ||
            "To be assigned",

        enrolledAt:
            new Date().toISOString()

    });

    saveLearnerData(data);

    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Subject added successfully.",
            "success"
        );

    }

}


/* ===== LEARNER ID ===== */

function generateLearnerId() {

    return "LRN-" +

        Date.now()
            .toString(36)
            .toUpperCase() +

        "-" +

        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();

}


/* ===== COUNT LEARNER DATA ===== */

function updateLearnerCounts() {

    const data =
        getLearnerData();

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
        document.querySelector(
            "[data-subject-count]"
        );

    const classCount =
        document.querySelector(
            "[data-class-count]"
        );

    const materialCount =
        document.querySelector(
            "[data-material-count]"
        );

    const paymentCount =
        document.querySelector(
            "[data-payment-count]"
        );


    if (subjectCount) {

        subjectCount.textContent =
            counts.subjects;

    }

    if (classCount) {

        classCount.textContent =
            counts.classes;

    }

    if (materialCount) {

        materialCount.textContent =
            counts.materials;

    }

    if (paymentCount) {

        paymentCount.textContent =
            counts.payments;

    }

}


/* ===== FIND LIVE CLASS ===== */

function getLiveClasses() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "muleLiveClasses"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


/* ===== CHECK LIVE CLASSES ===== */

function showLiveClassStatus() {

    const liveClasses =
        getLiveClasses();

    const liveNow =
        liveClasses.filter(
            function(item) {

                return item.status === "live";

            }
        );

    document.querySelectorAll(
        "[data-live-count]"
    ).forEach(function(element) {

        element.textContent =
            liveNow.length;

    });

}


/* ===== LOGOUT ===== */

function learnerLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

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