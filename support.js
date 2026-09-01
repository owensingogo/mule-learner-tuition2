/* =========================================
MULE LEARNER TUITION
Customer Support JavaScript
========================================= */

"use strict";

const SUPPORT_KEY = "muleSupportRequests";

/* ===== GET SUPPORT REQUESTS ===== */

function getSupportRequests() {

try {

    return JSON.parse(
        localStorage.getItem(SUPPORT_KEY)
    ) || [];

} catch (error) {

    return [];

}

}

/* ===== SAVE SUPPORT REQUESTS ===== */

function saveSupportRequests(requests) {

localStorage.setItem(
    SUPPORT_KEY,
    JSON.stringify(requests)
);

}

/* ===== CREATE SUPPORT REQUEST ===== */

function createSupportRequest(data) {

if (!data) {
    return false;
}

const learner =
    typeof getLearner === "function"
    ? getLearner()
    : null;

const name =
    data.name ||
    (learner ? learner.name : "Learner");

const email =
    data.email ||
    (learner ? learner.email : "");

const subject =
    String(data.subject || "").trim();

const message =
    String(data.message || "").trim();

if (!subject || !message) {

    if (typeof showMessage === "function") {

        showMessage(
            "Please enter a subject and message.",
            "error"
        );

    } else {

        alert(
            "Please enter a subject and message."
        );

    }

    return false;
}

const requests =
    getSupportRequests();

const request = {

    id:
        typeof generateId === "function"
        ? generateId("SUP")
        : "SUP-" + Date.now(),

    name:name,

    email:email,

    subject:subject,

    message:message,

    status:"open",

    reply:"",

    createdAt:
        new Date().toISOString()

};

requests.push(request);

saveSupportRequests(requests);

if (typeof showMessage === "function") {

    showMessage(
        "Your support request has been sent.",
        "success"
    );

} else {

    alert(
        "Your support request has been sent."
    );

}

return request;

}

/* ===== FIND REQUEST ===== */

function getSupportRequestById(id) {

return getSupportRequests().find(
    function(request) {

        return request.id === id;

    }
);

}

/* ===== GET OPEN REQUESTS ===== */

function getOpenSupportRequests() {

return getSupportRequests().filter(
    function(request) {

        return request.status === "open";

    }
);

}

/* ===== REPLY TO REQUEST ===== */

function replyToSupportRequest(
requestId,
reply
) {

const requests =
    getSupportRequests();

const request =
    requests.find(function(item) {

        return item.id === requestId;

    });

if (!request) {
    return false;
}

const cleanReply =
    String(reply || "").trim();

if (!cleanReply) {

    if (typeof showMessage === "function") {

        showMessage(
            "Please enter a reply.",
            "error"
        );

    }

    return false;
}

request.reply =
    cleanReply;

request.status =
    "answered";

request.repliedAt =
    new Date().toISOString();

saveSupportRequests(requests);

if (typeof showMessage === "function") {

    showMessage(
        "Reply sent successfully.",
        "success"
    );

}

return true;

}

/* ===== CLOSE REQUEST ===== */

function closeSupportRequest(requestId) {

const requests =
    getSupportRequests();

const request =
    requests.find(function(item) {

        return item.id === requestId;

    });

if (!request) {
    return false;
}

request.status =
    "closed";

request.closedAt =
    new Date().toISOString();

saveSupportRequests(requests);

if (typeof showMessage === "function") {

    showMessage(
        "Support request closed.",
        "success"
    );

}

return true;

}

/* ===== DELETE REQUEST ===== */

function deleteSupportRequest(requestId) {

const requests =
    getSupportRequests();

const confirmed =
    confirm(
        "Delete this support request?"
    );

if (!confirmed) {
    return false;
}

const updated =
    requests.filter(function(request) {

        return request.id !== requestId;

    });

saveSupportRequests(updated);

return true;

}

/* ===== RENDER SUPPORT REQUESTS ===== */

function renderSupportRequests(containerId) {

const container =
    document.getElementById(
        containerId
    );

if (!container) {
    return;
}

const requests =
    getSupportRequests();

container.innerHTML = "";

if (requests.length === 0) {

    container.innerHTML =
        "<p>No support requests yet.</p>";

    return;
}

requests.forEach(function(request) {

    const card =
        document.createElement("div");

    card.className =
        "support-request";

    card.innerHTML =

        "<h3>" +
        escapeHTML(request.subject) +
        "</h3>" +

        "<p><strong>From:</strong> " +
        escapeHTML(request.name) +
        "</p>" +

        "<p>" +
        escapeHTML(request.message) +
        "</p>" +

        "<p><strong>Status:</strong> " +
        escapeHTML(request.status) +
        "</p>";

    if (request.reply) {

        const reply =
            document.createElement("p");

        reply.innerHTML =
            "<strong>CEO Reply:</strong> " +
            escapeHTML(request.reply);

        card.appendChild(reply);

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
            "[data-support-requests]"
        );

    if (container) {

        renderSupportRequests(
            container.id
        );

    }

}

);