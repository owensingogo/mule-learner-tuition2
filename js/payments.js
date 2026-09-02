/* =========================================
   MULE LEARNER TUITION
   PAYMENTS SYSTEM
   Firebase + Local Backup
========================================= */

"use strict";

const PAYMENTS_KEY = "mulePayments";
const PAYMENT_ACCOUNTS_KEY = "mulePaymentAccounts";

const PAYMENT_DATABASE_URL =
"https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com";


/* =========================================
   FIREBASE REST HELPER
========================================= */

async function paymentFirebaseRequest(
    path,
    method = "GET",
    data = null
) {

    try {

        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (data !== null) {

            options.body =
                JSON.stringify(data);

        }

        const response =
            await fetch(
                PAYMENT_DATABASE_URL +
                "/" +
                path +
                ".json",
                options
            );

        if (!response.ok) {

            console.error(
                "Firebase payment error:",
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


/* =========================================
   NORMALIZE PHONE
========================================= */

function normalizePaymentPhone(phone) {

    phone = String(phone || "").trim();

    phone = phone.replace(/\s+/g, "");

    if (phone.startsWith("+260")) {

        phone =
            "0" +
            phone.substring(4);

    }

    if (phone.startsWith("260")) {

        phone =
            "0" +
            phone.substring(3);

    }

    return phone;
}


/* =========================================
   GET LOCAL PAYMENTS
========================================= */

function getPayments() {

    try {

        return JSON.parse(
            localStorage.getItem(PAYMENTS_KEY)
        ) || [];

    } catch (error) {

        return [];
    }
}


/* =========================================
   SAVE LOCAL PAYMENTS
========================================= */

function savePayments(payments) {

    localStorage.setItem(
        PAYMENTS_KEY,
        JSON.stringify(payments)
    );

}


/* =========================================
   GET FIREBASE PAYMENTS
========================================= */

async function getFirebasePayments() {

    const data =
        await paymentFirebaseRequest(
            "mulePayments"
        );

    if (!data) {

        return [];
    }

    const payments = [];

    if (Array.isArray(data)) {

        data.forEach(function(payment) {

            if (payment) {

                payments.push(payment);

            }

        });

    } else {

        Object.keys(data).forEach(function(key) {

            const payment =
                data[key];

            if (payment) {

                payments.push(payment);

            }

        });

    }

    return payments;
}


/* =========================================
   SYNC FIREBASE PAYMENTS TO LOCAL
========================================= */

async function syncPaymentsFromFirebase() {

    const firebasePayments =
        await getFirebasePayments();

    if (!firebasePayments.length) {

        return getPayments();
    }

    savePayments(firebasePayments);

    return firebasePayments;
}


/* =========================================
   GET PAYMENT ACCOUNTS
========================================= */

function getPaymentAccounts() {

    try {

        return JSON.parse(
            localStorage.getItem(
                PAYMENT_ACCOUNTS_KEY
            )
        ) || [];

    } catch (error) {

        return [];
    }
}


/* =========================================
   SAVE PAYMENT ACCOUNTS
========================================= */

function savePaymentAccounts(accounts) {

    localStorage.setItem(
        PAYMENT_ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );

}


/* =========================================
   SUBMIT PAYMENT
========================================= */

function submitPayment(paymentData) {

    if (!paymentData) {

        return false;
    }

    const learner =
        typeof getLearner === "function"
        ? getLearner()
        : (
            typeof getCurrentLearner === "function"
            ? getCurrentLearner()
            : null
        );


    const payment = {

        id:
            paymentData.id ||
            (
                typeof generateId === "function"
                ? generateId("PAY")
                : "PAY-" + Date.now()
            ),

        learnerId:
            paymentData.learnerId ||
            (learner ? learner.id : ""),

        learnerName:
            paymentData.learnerName ||
            (learner ? learner.name : "Learner"),

        learnerPhone:
            paymentData.learnerPhone ||
            (learner ? learner.phone : ""),

        plan:
            paymentData.plan || "",

        amount:
            paymentData.amount || "",

        method:
            paymentData.method || "",

        reference:
            paymentData.reference || "",

        status:
            "pending",

        submittedAt:
            new Date().toISOString(),

        approvedAt:
            null,

        approvedBy:
            null,

        rejectedAt:
            null,

        rejectionReason:
            "",

        startAt:
            null,

        expiresAt:
            null,

        isFreeTrial:
            false
    };


    /* =====================================
       VALIDATION
    ===================================== */

    if (
        !payment.plan ||
        !payment.amount ||
        !payment.method ||
        !payment.reference
    ) {

        if (
            typeof showMessage === "function"
        ) {

            showMessage(
                "Please complete all payment details.",
                "error"
            );

        } else {

            alert(
                "Please complete all payment details."
            );

        }

        return false;
    }


    /* =====================================
       SAVE LOCAL
    ===================================== */

    const payments =
        getPayments();

    payments.push(payment);

    savePayments(payments);


    /* =====================================
       SAVE TO FIREBASE
       IMPORTANT FOR DIFFERENT PHONES
    ===================================== */

    paymentFirebaseRequest(
        "mulePayments/" +
        encodeURIComponent(payment.id),
        "PUT",
        payment
    )
    .then(function(result) {

        if (result) {

            console.log(
                "Payment saved to Firebase:",
                payment.id
            );

        } else {

            console.error(
                "Payment could not be saved to Firebase."
            );

        }

    });


    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Payment submitted for review.",
            "success"
        );

    }

    return payment;
}


/* =========================================
   GET LEARNER PAYMENTS
========================================= */

function getLearnerPayments(learnerId) {

    const cleanId =
        String(learnerId || "");

    return getPayments().filter(
        function(payment) {

            return (
                String(
                    payment.learnerId || ""
                ) === cleanId
            );

        }
    );
}


/* =========================================
   GET PENDING PAYMENTS
========================================= */

function getPendingPayments() {

    return getPayments().filter(
        function(payment) {

            return (
                String(
                    payment.status || ""
                ).toLowerCase() === "pending"
            );

        }
    );
}


/* =========================================
   PLAN DURATION
========================================= */

function getPlanDurationMilliseconds(plan) {

    const cleanPlan =
        String(plan || "")
        .toLowerCase();

    if (
        cleanPlan.includes("6 hours")
    ) {

        return 6 * 60 * 60 * 1000;
    }

    if (
        cleanPlan.includes("daily") ||
        cleanPlan.includes("1 day")
    ) {

        return 24 * 60 * 60 * 1000;
    }

    if (
        cleanPlan.includes("weekly") ||
        cleanPlan.includes("7 days")
    ) {

        return 7 * 24 * 60 * 60 * 1000;
    }

    if (
        cleanPlan.includes("monthly") ||
        cleanPlan.includes("30 days")
    ) {

        return 30 * 24 * 60 * 60 * 1000;
    }

    return 0;
}


/* =========================================
   APPROVE PAYMENT
========================================= */

function approvePayment(paymentId) {

    const payments =
        getPayments();

    const payment =
        payments.find(
            function(item) {

                return (
                    item.id === paymentId
                );

            }
        );

    if (!payment) {

        return false;
    }


    const now =
        Date.now();

    const duration =
        getPlanDurationMilliseconds(
            payment.plan
        );

    if (!duration) {

        if (
            typeof showMessage === "function"
        ) {

            showMessage(
                "Unable to determine the learning plan duration.",
                "error"
            );

        } else {

            alert(
                "Unable to determine the learning plan duration."
            );

        }

        return false;
    }


    const startAt =
        new Date(now).toISOString();

    const expiresAt =
        new Date(
            now + duration
        ).toISOString();


    /* =====================================
       UPDATE PAYMENT
    ===================================== */

    payment.status =
        "approved";

    payment.approvedAt =
        startAt;

    payment.approvedBy =
        "CEO";

    payment.rejectedAt =
        null;

    payment.rejectionReason =
        "";

    payment.startAt =
        startAt;

    payment.expiresAt =
        expiresAt;

    payment.isFreeTrial =
        false;


    /* =====================================
       SAVE LOCAL
    ===================================== */

    savePayments(payments);


    /* =====================================
       SAVE APPROVAL TO FIREBASE
    ===================================== */

    paymentFirebaseRequest(
        "mulePayments/" +
        encodeURIComponent(payment.id),
        "PUT",
        payment
    )
    .then(function(result) {

        if (result) {

            console.log(
                "Payment approval saved to Firebase:",
                payment.id
            );

        } else {

            console.error(
                "Payment approval failed to sync to Firebase."
            );

        }

    });


    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Payment approved successfully. Learning access is now active.",
            "success"
        );

    }

    return true;
}


/* =========================================
   REJECT PAYMENT
========================================= */

function rejectPayment(
    paymentId,
    rejectionReason = ""
) {

    const payments =
        getPayments();

    const payment =
        payments.find(
            function(item) {

                return (
                    item.id === paymentId
                );

            }
        );

    if (!payment) {

        return false;
    }


    payment.status =
        "rejected";

    payment.rejectedAt =
        new Date().toISOString();

    payment.approvedAt =
        null;

    payment.approvedBy =
        null;

    payment.startAt =
        null;

    payment.expiresAt =
        null;

    payment.rejectionReason =
        String(
            rejectionReason || ""
        ).trim();

    payment.rejectedBy =
        "CEO";


    savePayments(payments);


    /* =====================================
       SAVE REJECTION TO FIREBASE
    ===================================== */

    paymentFirebaseRequest(
        "mulePayments/" +
        encodeURIComponent(payment.id),
        "PUT",
        payment
    )
    .then(function(result) {

        if (result) {

            console.log(
                "Payment rejection saved to Firebase:",
                payment.id
            );

        }

    });


    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Payment rejected.",
            "warning"
        );

    }

    return true;
}


/* =========================================
   ADD PAYMENT ACCOUNT
========================================= */

function addPaymentAccount(accountData) {

    if (!accountData) {

        return false;
    }

    const provider =
        String(
            accountData.provider || ""
        ).trim();

    const number =
        String(
            accountData.number || ""
        ).trim();

    const name =
        String(
            accountData.name || ""
        ).trim();


    if (
        !provider ||
        !number ||
        !name
    ) {

        if (
            typeof showMessage === "function"
        ) {

            showMessage(
                "Please complete the payment account details.",
                "error"
            );

        } else {

            alert(
                "Please complete the payment account details."
            );

        }

        return false;
    }


    const accounts =
        getPaymentAccounts();

    const account = {

        id:
            typeof generateId === "function"
            ? generateId("ACC")
            : "ACC-" + Date.now(),

        provider:
            provider,

        number:
            number,

        name:
            name,

        status:
            "active",

        createdAt:
            new Date().toISOString()

    };


    accounts.push(account);

    savePaymentAccounts(accounts);


    /* Save account to Firebase too */

    paymentFirebaseRequest(
        "mulePaymentAccounts/" +
        encodeURIComponent(account.id),
        "PUT",
        account
    );


    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Payment account added.",
            "success"
        );

    }

    return account;
}


/* =========================================
   DELETE PAYMENT ACCOUNT
========================================= */

function deletePaymentAccount(accountId) {

    const accounts =
        getPaymentAccounts();

    const account =
        accounts.find(
            function(item) {

                return (
                    item.id === accountId
                );

            }
        );

    if (!account) {

        return false;
    }


    const confirmed =
        confirm(
            "Delete this payment account?"
        );

    if (!confirmed) {

        return false;
    }


    const updated =
        accounts.filter(
            function(item) {

                return (
                    item.id !== accountId
                );

            }
        );


    savePaymentAccounts(updated);


    paymentFirebaseRequest(
        "mulePaymentAccounts/" +
        encodeURIComponent(accountId),
        "DELETE"
    );


    if (
        typeof showMessage === "function"
    ) {

        showMessage(
            "Payment account deleted.",
            "success"
        );

    }

    return true;
}


/* =========================================
   PAYMENT SUMMARY
========================================= */

function getPaymentSummary() {

    const payments =
        getPayments();

    let approved = 0;
    let pending = 0;
    let rejected = 0;


    payments.forEach(
        function(payment) {

            const status =
                String(
                    payment.status || ""
                ).toLowerCase();

            if (status === "approved") {
                approved++;
            }

            if (status === "pending") {
                pending++;
            }

            if (status === "rejected") {
                rejected++;
            }

        }
    );


    return {

        total:
            payments.length,

        approved:
            approved,

        pending:
            pending,

        rejected:
            rejected

    };
}


/* =========================================
   AUTOMATIC FIREBASE SYNC
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        syncPaymentsFromFirebase()
            .then(function() {

                console.log(
                    "Mule payment records synchronized."
                );

            })
            .catch(function(error) {

                console.error(
                    "Payment synchronization failed:",
                    error
                );

            });

    }
);