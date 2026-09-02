"use strict";

/* =========================================================
   MULE LEARNER TUITION - LEARNER SYSTEM
   Firebase learning access
========================================================= */

const LEARNER_USERS_KEY = "muleUsers";
const LEARNER_CURRENT_USER_KEY = "muleCurrentUser";

const LEARNER_DATABASE_URL =
    "https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com";


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
            localStorage.getItem(
                LEARNER_CURRENT_USER_KEY
            );

        if (!data) return null;

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Could not read learner session:",
            error
        );

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

        window.location.href =
            "../login.html";

        return false;
    }

    if (
        String(user.role || "").toLowerCase() !==
        "learner"
    ) {

        alert(
            "This page is for learners only."
        );

        window.location.href =
            "../login.html";

        return false;
    }

    if (
        String(user.status || "").toLowerCase() ===
        "suspended"
    ) {

        alert(
            "Your learner account has been suspended. Please contact support."
        );

        window.location.href =
            "../login.html";

        return false;
    }

    return true;
}


/* =========================================================
   GET USERS
========================================================= */

function getLearnerUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LEARNER_USERS_KEY
            )
        ) || [];

    } catch (error) {

        return [];
    }
}


/* =========================================================
   FIND LEARNER
========================================================= */

function findLearnerAccount() {

    const currentUser =
        getLearnerUser();

    if (!currentUser) return null;

    const users =
        getLearnerUsers();

    const currentId =
        String(currentUser.id || "");

    const currentPhone =
        normalizeLearnerPhone(
            currentUser.phone || ""
        );

    const found =
        users.find(function(user) {

            const userId =
                String(user.id || "");

            const userPhone =
                normalizeLearnerPhone(
                    user.phone || ""
                );

            return (
                (
                    currentId &&
                    userId === currentId
                ) ||
                (
                    currentPhone &&
                    userPhone === currentPhone
                )
            );

        });

    return found || currentUser;
}


/* =========================================================
   FIREBASE REST
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
   CONVERT FIREBASE DATA TO ARRAY
========================================================= */

function firebaseDataToArray(data) {

    const result = [];

    if (!data) {
        return result;
    }

    if (Array.isArray(data)) {

        data.forEach(function(item) {

            if (item) {
                result.push(item);
            }

        });

        return result;
    }

    Object.keys(data).forEach(function(key) {

        if (data[key]) {

            result.push({
                firebaseKey: key,
                ...data[key]
            });

        }

    });

    return result;
}


/* =========================================================
   PAYMENT BELONGS TO LEARNER
========================================================= */

function paymentBelongsToLearner(
    payment,
    learner
) {

    if (!payment || !learner) {
        return false;
    }

    const learnerId =
        String(learner.id || "");

    const learnerPhone =
        normalizeLearnerPhone(
            learner.phone || ""
        );

    const paymentLearnerId =
        String(
            payment.learnerId || ""
        );

    const paymentPhone =
        normalizeLearnerPhone(
            payment.learnerPhone ||
            payment["payment Number"] ||
            ""
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
   CONVERT DATE TO MILLISECONDS
   FIXED:
   Supports BOTH ISO dates and timestamps
========================================================= */

function getExpiryMilliseconds(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;
    }

    /* Firebase timestamp */

    if (
        typeof value === "number"
    ) {

        return value;
    }

    /* Numeric string */

    if (
        !isNaN(Number(value)) &&
        String(value).trim() !== ""
    ) {

        return Number(value);
    }

    /* ISO date string */

    const date =
        new Date(value);

    if (
        isNaN(date.getTime())
    ) {

        return 0;
    }

    return date.getTime();
}


/* =========================================================
   CHECK ACTIVE APPROVED PAYMENT
========================================================= */

function isActiveApprovedPayment(
    payment
) {

    if (!payment) {
        return false;
    }

    const status =
        String(
            payment.status || ""
        )
        .trim()
        .toLowerCase();

    if (status !== "approved") {
        return false;
    }

    const expiresAt =
        getExpiryMilliseconds(
            payment.expiresAt
        );

    if (!expiresAt) {
        return false;
    }

    return (
        expiresAt > Date.now()
    );
}


/* =========================================================
   CHECK LEARNING ACCESS
========================================================= */

async function checkLearningAccess() {

    const learner =
        findLearnerAccount();

    if (!learner) {

        return {

            success: false,

            active: false,

            message:
                "Please login first."

        };
    }


    try {

        /*
         Main payment database.
        */

        const paymentsData =
            await readFirebasePath(
                "payments"
            );


        /*
         Also check mulePayments
         for compatibility.
        */

        const mulePaymentsData =
            await readFirebasePath(
                "mulePayments"
            );


        const payments =
            firebaseDataToArray(
                paymentsData
            );

        const mulePayments =
            firebaseDataToArray(
                mulePaymentsData
            );


        const allPayments =
            payments.concat(
                mulePayments
            );


        /*
         Find active approved
         payments belonging
         to this learner.
        */

        const activePayments =
            allPayments.filter(
                function(payment) {

                    return (
                        paymentBelongsToLearner(
                            payment,
                            learner
                        ) &&
                        isActiveApprovedPayment(
                            payment
                        )
                    );

                }
            );


        if (
            activePayments.length > 0
        ) {

            /*
             Use the payment
             with the latest expiry.
            */

            activePayments.sort(
                function(a, b) {

                    return (
                        getExpiryMilliseconds(
                            b.expiresAt
                        ) -
                        getExpiryMilliseconds(
                            a.expiresAt
                        )
                    );

                }
            );


            const activePayment =
                activePayments[0];


            const expiry =
                getExpiryMilliseconds(
                    activePayment.expiresAt
                );


            return {

                success: true,

                active: true,

                payment:
                    activePayment,

                expiresAt:
                    expiry,

                plan:
                    activePayment.plan ||
                    "Active Learning Plan",

                remaining:
                    expiry -
                    Date.now()

            };

        }


        return {

            success: true,

            active: false,

            payment: null,

            expiresAt: 0,

            plan: "",

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

    const user =
        findLearnerAccount();


    if (!user) {

        alert(
            "Please login first."
        );

        window.location.href =
            "../login.html";

        return false;
    }


    const result =
        await checkLearningAccess();


    if (result.active) {

        console.log(
            "Learning access approved:",
            result.plan
        );

        return true;
    }


    alert(
        "🔒 Learning access is locked.\n\n" +
        "No active approved learning plan was found for this account.\n\n" +
        "If you have already paid, please make sure the CEO has approved the payment."
    );


    window.location.href =
        redirectPage;

    return false;
}


/* =========================================================
   ACCESS DETAILS
========================================================= */

async function getLearningAccessDetails() {

    return await checkLearningAccess();

}


/* =========================================================
   ACTIVE ACCESS
========================================================= */

async function hasActiveLearningAccess() {

    const result =
        await checkLearningAccess();

    return result.active === true;

}


/* =========================================================
   CURRENT LEARNER HELPERS
========================================================= */

function getCurrentLearner() {

    return getLearnerUser();

}


function getLoggedInLearner() {

    return getLearnerUser();

}


/* =========================================================
   LOGOUT
========================================================= */

function learnerLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        LEARNER_CURRENT_USER_KEY
    );

    window.location.href =
        "../login.html";

}


/* =========================================================
   FORMAT REMAINING ACCESS
========================================================= */

function formatRemainingAccess(
    expiresAt
) {

    const expiry =
        getExpiryMilliseconds(
            expiresAt
        );

    const remaining =
        expiry -
        Date.now();


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


    return (
        minutes +
        " min"
    );

}