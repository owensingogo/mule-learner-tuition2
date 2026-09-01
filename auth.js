/* =========================================
MULE LEARNER TUITION
Authentication JavaScript
========================================= */

"use strict";

/* ===== STORAGE KEYS ===== */

const USERS_KEY = "muleUsers";
const CURRENT_USER_KEY = "muleCurrentUser";

/* ===== GET USERS ===== */

function getUsers() {
try {
return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
} catch (error) {
return [];
}
}

/* ===== SAVE USERS ===== */

function saveUsers(users) {
localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ===== GENERATE USER ID ===== */

function createUserId(role) {

const prefix =
    role === "teacher" ? "TCH" :
    role === "ceo" ? "CEO" :
    "LRN";

return prefix + "-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 6).toUpperCase();

}

/* ===== REGISTER USER ===== */

function registerUser(userData) {

const users = getUsers();

const email = String(userData.email || "")
    .trim()
    .toLowerCase();

const phone = String(userData.phone || "")
    .trim();

if (!userData.name || !email || !phone || !userData.password) {
    return {
        success:false,
        message:"Please complete all required fields."
    };
}

const existingEmail = users.find(function(user) {
    return user.email === email;
});

if (existingEmail) {
    return {
        success:false,
        message:"An account with this email already exists."
    };
}

const existingPhone = users.find(function(user) {
    return user.phone === phone;
});

if (existingPhone) {
    return {
        success:false,
        message:"An account with this phone number already exists."
    };
}

const role = userData.role || "learner";

const newUser = {
    id:createUserId(role),
    name:String(userData.name).trim(),
    email:email,
    phone:phone,
    password:userData.password,
    role:role,
    status:role === "teacher" ? "pending" : "active",
    createdAt:new Date().toISOString()
};

users.push(newUser);

saveUsers(users);

return {
    success:true,
    message:
        role === "teacher"
        ? "Teacher application submitted successfully."
        : "Account created successfully.",
    user:newUser
};

}

/* ===== LOGIN ===== */

function loginUser(email, password) {

const users = getUsers();

const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();

const user = users.find(function(account) {
    return account.email === cleanEmail &&
           account.password === password;
});

if (!user) {
    return {
        success:false,
        message:"Incorrect email or password."
    };
}

if (user.status === "suspended") {
    return {
        success:false,
        message:"Your account has been suspended. Please contact support."
    };
}

if (user.status === "pending") {
    return {
        success:false,
        message:"Your account is awaiting CEO approval."
    };
}

localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
);

return {
    success:true,
    user:user
};

}

/* ===== LOGOUT ===== */

function logoutUser() {

localStorage.removeItem(CURRENT_USER_KEY);

window.location.href = "login.html";

}

/* ===== CURRENT USER ===== */

function getLoggedInUser() {

try {

    return JSON.parse(
        localStorage.getItem(CURRENT_USER_KEY)
    );

} catch (error) {

    return null;

}

}

/* ===== DASHBOARD REDIRECT ===== */

function redirectByRole(user) {

if (!user) {
    window.location.href = "login.html";
    return;
}

if (user.role === "ceo") {
    window.location.href = "ceo/dashboard.html";
    return;
}

if (user.role === "teacher") {
    window.location.href = "teacher/dashboard.html";
    return;
}

window.location.href = "learner/dashboard.html";

}

/* ===== LOGIN FORM ===== */

document.addEventListener("DOMContentLoaded", function() {

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email =
            document.getElementById("email")?.value;

        const password =
            document.getElementById("password")?.value;

        const result =
            loginUser(email, password);

        if (!result.success) {

            if (typeof showMessage === "function") {
                showMessage(result.message, "error");
            } else {
                alert(result.message);
            }

            return;
        }

        if (typeof showMessage === "function") {
            showMessage("Login successful.", "success");
        }

        setTimeout(function() {
            redirectByRole(result.user);
        }, 500);

    });

}

/* ===== LOGOUT BUTTONS ===== */

document.querySelectorAll("[data-logout]").forEach(function(button) {

    button.addEventListener("click", function() {
        logoutUser();
    });

});

});