/* =========================================
MULE LEARNER TUITION
Payments JavaScript
========================================= */

"use strict";

const PAYMENTS_KEY = "mulePayments";
const PAYMENT_ACCOUNTS_KEY = "mulePaymentAccounts";

/* ===== GET PAYMENTS ===== */

function getPayments() {

try {

    return JSON.parse(
        localStorage.getItem(PAYMENTS_KEY)
    ) || [];

} catch (error) {

    return [];

}

}

/* ===== SAVE PAYMENTS ===== */

function savePayments(payments) {

localStorage.setItem(
    PAYMENTS_KEY,
    JSON.stringify(payments)
);

}

/* ===== GET PAYMENT ACCOUNTS ===== */

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

/* ===== SAVE PAYMENT ACCOUNTS ===== */

function savePaymentAccounts(accounts) {

localStorage.setItem(
    PAYMENT_ACCOUNTS_KEY,
    JSON.stringify(accounts)
);

}

/* ===== SUBMIT PAYMENT ===== */

function submitPayment(paymentData) {

if (!paymentData) {
    return false;
}

const learner =
    typeof getLearner === "function"
    ? getLearner()
    : null;

const payment = {

    id:
        typeof generateId === "function"
        ? generateId("PAY")
        : "PAY-" + Date.now(),

    learnerId:
        paymentData.learnerId ||
        (learner ? learner.id : ""),

    learnerName:
        paymentData.learnerName ||
        (learner ? learner.name : "Learner"),

    plan:
        paymentData.plan || "",

    amount:
        paymentData.amount || "",

    method:
        paymentData.method || "",

    reference:
        paymentData.reference || "",

    status:"pending",

    submittedAt:
        new Date().toISOString()

};

if (
    !payment.plan ||
    !payment.amount ||
    !payment.method ||
    !payment.reference
) {

    if (typeof showMessage === "function") {

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

const payments = getPayments();

payments.push(payment);

savePayments(payments);

if (typeof showMessage === "function") {

    showMessage(
        "Payment submitted for review.",
        "success"
    );

}

return payment;

}

/* ===== GET LEARNER PAYMENTS ===== */

function getLearnerPayments(learnerId) {

return getPayments().filter(function(payment) {

    return payment.learnerId === learnerId;

});

}

/* ===== GET PENDING PAYMENTS ===== */

function getPendingPayments() {

return getPayments().filter(function(payment) {

    return payment.status === "pending";

});

}

/* ===== APPROVE PAYMENT ===== */

function approvePayment(paymentId) {

const payments = getPayments();

const payment =
    payments.find(function(item) {

        return item.id === paymentId;

    });

if (!payment) {
    return false;
}

payment.status = "approved";

payment.approvedAt =
    new Date().toISOString();

savePayments(payments);

if (typeof showMessage === "function") {

    showMessage(
        "Payment approved successfully.",
        "success"
    );

}

return true;

}

/* ===== REJECT PAYMENT ===== */

function rejectPayment(paymentId) {

const payments = getPayments();

const payment =
    payments.find(function(item) {

        return item.id === paymentId;

    });

if (!payment) {
    return false;
}

payment.status = "rejected";

payment.rejectedAt =
    new Date().toISOString();

savePayments(payments);

if (typeof showMessage === "function") {

    showMessage(
        "Payment rejected.",
        "warning"
    );

}

return true;

}

/* ===== ADD PAYMENT ACCOUNT ===== */

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

if (!provider || !number || !name) {

    if (typeof showMessage === "function") {

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

    provider:provider,

    number:number,

    name:name,

    status:"active",

    createdAt:
        new Date().toISOString()

};

accounts.push(account);

savePaymentAccounts(accounts);

if (typeof showMessage === "function") {

    showMessage(
        "Payment account added.",
        "success"
    );

}

return account;

}

/* ===== DELETE PAYMENT ACCOUNT ===== */

function deletePaymentAccount(accountId) {

const accounts =
    getPaymentAccounts();

const account =
    accounts.find(function(item) {

        return item.id === accountId;

    });

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
    accounts.filter(function(item) {

        return item.id !== accountId;

    });

savePaymentAccounts(updated);

if (typeof showMessage === "function") {

    showMessage(
        "Payment account deleted.",
        "success"
    );

}

return true;

}

/* ===== PAYMENT SUMMARY ===== */

function getPaymentSummary() {

const payments =
    getPayments();

let approved = 0;
let pending = 0;
let rejected = 0;

payments.forEach(function(payment) {

    if (payment.status === "approved") {
        approved++;
    }

    if (payment.status === "pending") {
        pending++;
    }

    if (payment.status === "rejected") {
        rejected++;
    }

});

return {

    total:payments.length,

    approved:approved,

    pending:pending,

    rejected:rejected

};

}