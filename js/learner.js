"use strict";

/* =========================================================
   MULE LEARNER TUITION - LEARNER SYSTEM
   Supports BOTH old "payments" and new "mulePayments"
========================================================= */

const LEARNER_USERS_KEY = "muleUsers";
const LEARNER_CURRENT_USER_KEY = "muleCurrentUser";

/* =========================================================
   PHONE NORMALIZATION
========================================================= */

function normalizeLearnerPhone(phone) {

    phone = String(phone || "").trim();
    phone = phone.replace(/\s+/g, "");

    if (phone.startsWith("+260")) {
        phone = "0" + phone.substring(4);
    }

    if (phone.startsWith("260")) {
        phone = "0" + phone.substring(3);
    }

    return phone;
}

/* =========================================================
   GET CURRENT LEARNER
========================================================= */

function getLearnerUser() {

    try {

        const data =
            localStorage.getItem(LEARNER_CURRENT_USER_KEY);

        if (!data) return null;

        return JSON.parse(data);

    } catch (error) {

        console.error("Could not read learner session:", error);

        return null;
    }
}

/* =========================================================
   PROTECT LEARNER PAGE
========================================================= */

function protectLearnerPage() {

    const user = getLearnerUser();

    if (!user) {

        alert("Please login first.");

        window.location.href = "../login.html";

        return false;
    }

    if (
        String(user.role || "").toLowerCase() !== "learner"
    ) {

        alert("This page is for learners only.");

        window.location.href = "../login.html";

        return false;
    }

    if (
        String(user.status || "").toLowerCase() === "suspended"
    ) {

        alert(
            "Your learner account has been suspended. Please contact support."
        );

        window.location.href = "../login.html";

        return false;
    }

    return true;
}

/* =========================================================
   GET ALL USERS
========================================================= */

function getLearnerUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(LEARNER_USERS_KEY)
        ) || [];

    } catch (error) {

        return [];
    }
}

/* =========================================================
   FIND LEARNER
========================================================= */

function findLearnerAccount() {

    const currentUser = getLearnerUser();

    if (!currentUser) return null;

    const users = getLearnerUsers();

    const currentId =
        String(currentUser.id || "");

    const currentPhone =
        normalizeLearnerPhone(currentUser.phone || "");

    const found = users.find(function(user) {

        const userId =
            String(user.id || "");

        const userPhone =
            normalizeLearnerPhone(user.phone || "");

        return (
            (currentId && userId === currentId) ||
            (currentPhone && userPhone === currentPhone)
        );

    });

    return found || currentUser;
}

/* =========================================================
   FIREBASE REST DATABASE
========================================================= */

const LEARNER_DATABASE_URL =
    "https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com";

/* =========================================================
   READ FIREBASE PATH
========================================================= */

async function readFirebasePath(path) {

    try {

        const response =
            await fetch(
                LEARNER_DATABASE_URL +
                "/" +
                path +
                ".json"
            );

        if (!response.ok) {

            console.error(
                "Firebase request failed:",
                response.status
            );

            return null;
        }

        return await response.json();

    } catch (error) {

        console.error(
            "Firebase connection error:",
            error
        );

        return null;
    }
}

/* =========================================================
   CHECK ONE PAYMENT RECORD
========================================================= */

function paymentBelongsToLearner(payment, learner) {

    if (!payment || !learner) return false;

    const learnerId =
        String(learner.id || "");

    const learnerPhone =
        normalizeLearnerPhone(
            learner.phone || ""
        );

    const paymentLearnerId =
        String(payment.learnerId || "");

    const paymentPhone =
        normalizeLearnerPhone(
            payment.learnerPhone || ""
        );

    const sameId =
        learnerId &&
        paymentLearnerId &&
        learnerId === paymentLearnerId;

    const samePhone =
        learnerPhone &&
        paymentPhone &&
        learnerPhone === paymentPhone;

    return sameId || samePhone;
}

/* =========================================================
   CHECK PAYMENT STATUS
========================================================= */

function isActiveApprovedPayment(payment) {

    if (!payment) return false;

    const status =
        String(payment.status || "")
        .trim()
        .toLowerCase();

    if (status !== "approved") {
        return false;
    }

    const expiresAt =
        Number(payment.expiresAt || 0);

    if (!expiresAt) {
        return false;
    }

    return expiresAt > Date.now();
}

/* =========================================================
   CHECK LEARNING ACCESS
   Checks BOTH:
   1. payments
   2. mulePayments
========================================================= */

async function checkLearningAccess() {

    const learner = findLearnerAccount();

    if (!learner) {

        return {
            success: false,
            active: false,
            message: "Please login first."
        };
    }

    try {

        /*
         IMPORTANT:
         Check the OLD payment path first.
         This keeps existing learners working.
        */

        const oldPayments =
            await readFirebasePath("payments");

        /*
         Also check the NEW payment path.
        */

        const newPayments =
            await readFirebasePath("mulePayments");

        const allPayments = [];

        /* OLD PAYMENTS */

        if (oldPayments) {

            if (Array.isArray(oldPayments)) {

                oldPayments.forEach(function(payment) {

                    if (payment) {
                        allPayments.push(payment);
                    }

                });

            } else {

                Object.keys(oldPayments).forEach(function(key) {

                    const payment =
                        oldPayments[key];

                    if (payment) {

                        allPayments.push(payment);

                    }

                });

            }

        }

        /* NEW PAYMENTS */

        if (newPayments) {

            if (Array.isArray(newPayments)) {

                newPayments.forEach(function(payment) {

                    if (payment) {
                        allPayments.push(payment);
                    }

                });

            } else {

                Object.keys(newPayments).forEach(function(key) {

                    const payment =
                        newPayments[key];

                    if (payment) {

                        allPayments.push(payment);

                    }

                });

            }

        }

        /*
         Find every active approved payment
         belonging to this learner.
        */

        const activePayments =
            allPayments.filter(function(payment) {

                return (
                    paymentBelongsToLearner(
                        payment,
                        learner
                    ) &&
                    isActiveApprovedPayment(payment)
                );

            });

        /*
         If at least one active payment exists,
         access is granted.
        */

        if (activePayments.length > 0) {

            /*
             Use the payment with the latest expiry.
            */

            activePayments.sort(function(a, b) {

                return (
                    Number(b.expiresAt || 0) -
                    Number(a.expiresAt || 0)
                );

            });

            const activePayment =
                activePayments[0];

            return {

                success: true,
                active: true,
                payment: activePayment,

                expiresAt:
                    Number(
                        activePayment.expiresAt
                    ),

                plan:
                    activePayment.plan ||
                    "Active Learning Plan"

            };

        }

        return {

            success: true,
            active: false,
            payment: null,
            message:
                "No active approved learning plan was found for this account."

        };

    } catch (error) {

        console.error(
            "Learning access check failed:",
            error
        );

        return {

            success: false,
            active: false,
            message:
                "Unable to check learning access. Please try again."

        };

    }

}

/* =========================================================
   REQUIRE LEARNING ACCESS
========================================================= */

async function requireLearningAccess(
    redirectPage = "payments.html"
) {

    const user = findLearnerAccount();

    if (!user) {

        alert("Please login first.");

        window.location.href = "../login.html";

        return false;
    }

    const result =
        await checkLearningAccess();

    if (result.active) {

        /*
         Access approved.
         Do NOT redirect.
        */

        console.log(
            "Mule Learner Tuition access approved:",
            result.plan
        );

        return true;
    }

    /*
     No active approved plan.
    */

    alert(
        "🔒 Learning access is locked.\n\n" +
        "No active approved learning plan was found for this account.\n\n" +
        "If you have already paid, please make sure the CEO has approved the payment."
    );

    window.location.href = redirectPage;

    return false;
}

/* =========================================================
   GET ACCESS DETAILS
========================================================= */

async function getLearningAccessDetails() {

    const result =
        await checkLearningAccess();

    return result;
}

/* =========================================================
   CHECK WHETHER ACCESS IS ACTIVE
========================================================= */

async function hasActiveLearningAccess() {

    const result =
        await checkLearningAccess();

    return result.active === true;
}

/* =========================================================
   CURRENT USER HELPERS
========================================================= */

function getCurrentLearner() {

    return getLearnerUser();
}

function getLoggedInLearner() {

    return getLearnerUser();
}

/* =========================================================
   LEARNER LOGOUT
========================================================= */

function learnerLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) return;

    localStorage.removeItem(
        LEARNER_CURRENT_USER_KEY
    );

    window.location.href =
        "../login.html";
}

/* =========================================================
   FORMAT REMAINING TIME
========================================================= */

function formatRemainingAccess(expiresAt) {

    const expiry =
        Number(expiresAt || 0);

    const remaining =
        expiry - Date.now();

    if (remaining <= 0) {
        return "Expired";
    }

    const totalMinutes =
        Math.floor(
            remaining / 60000
        );

    const days =
        Math.floor(
            totalMinutes / 1440
        );

    const hours =
        Math.floor(
            (totalMinutes % 1440) / 60
        );

    const minutes =
        totalMinutes % 60;

    if (days > 0) {

        return (
            days +
            " day" +
            (days === 1 ? "" : "s") +
            " " +
            hours +
            " hour" +
            (hours === 1 ? "" : "s")
        );

    }

    if (hours > 0) {

        return (
            hours +
            " hour" +
            (hours === 1 ? "" : "s") +
            " " +
            minutes +
            " min"
        );

    }

    return minutes + " min";
}