/* =========================================
   MULE LEARNER TUITION
   Authentication
   Phone + Password + Role
========================================= */

"use strict";

const USERS_KEY = "muleUsers";
const CURRENT_USER_KEY = "muleCurrentUser";

/* ===== NORMALIZE PHONE ===== */

function normalizePhone(phone) {
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

/* ===== GET USERS ===== */

function getUsers() {
    try {
        return JSON.parse(
            localStorage.getItem(USERS_KEY)
        ) || [];
    } catch (error) {
        return [];
    }
}

/* ===== SAVE USERS ===== */

function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

/* ===== CREATE USER ID ===== */

function createUserId(role) {

    const prefix =
        role === "teacher" ? "TCH" :
        role === "ceo" ? "CEO" :
        "LRN";

    return prefix + "-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
}

/* ===== REGISTER USER ===== */

function registerUser(userData) {

    const users = getUsers();

    const name =
        String(userData.name || "").trim();

    const phone =
        normalizePhone(userData.phone);

    const password =
        String(userData.password || "");

    const role =
        userData.role || "learner";

    if (!name || !phone || !password) {
        return {
            success: false,
            message:
                "Please complete all required fields."
        };
    }

    const existingPhone =
        users.find(function(user) {
            return normalizePhone(user.phone) === phone;
        });

    if (existingPhone) {
        return {
            success: false,
            message:
                "An account with this phone number already exists."
        };
    }

    const newUser = {

        id: createUserId(role),

        name: name,

        phone: phone,

        password: password,

        role: role,

        status:
            role === "teacher"
            ? "pending"
            : "active",

        createdAt:
            new Date().toISOString()
    };

    users.push(newUser);

    saveUsers(users);

    return {
        success: true,

        message:
            role === "teacher"
            ? "Teacher application submitted successfully."
            : "Account created successfully.",

        user: newUser
    };
}

/* ===== LOGIN USER ===== */

function loginUser(phone, password, selectedRole) {

    const users = getUsers();

    const cleanPhone =
        normalizePhone(phone);

    const cleanPassword =
        String(password || "");

    const cleanRole =
        String(selectedRole || "")
        .trim()
        .toLowerCase();

    const user =
        users.find(function(account) {

            return (
                normalizePhone(account.phone) === cleanPhone &&
                String(account.password) === cleanPassword &&
                String(account.role).toLowerCase() === cleanRole
            );

        });

    if (!user) {

        return {
            success: false,
            message:
                "Incorrect phone number, password or account type."
        };

    }

    if (user.status === "suspended") {

        return {
            success: false,
            message:
                "Your account has been suspended. Please contact support."
        };

    }

    if (user.status === "pending") {

        return {
            success: false,
            message:
                "Your teacher account is awaiting CEO approval."
        };

    }

    /* SAVE LOGIN SESSION */

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );

    return {
        success: true,
        message: "Login successful.",
        user: user
    };
}

/* ===== LOGIN PAGE ===== */

function login(event, selectedRole) {

    if (event) {
        event.preventDefault();
    }

    const phone =
        document.getElementById("phone")?.value.trim();

    const password =
        document.getElementById("password")?.value;

    const error =
        document.getElementById("error");

    if (!phone || !password) {

        if (error) {
            error.textContent =
                "Please enter your phone number and password.";

            error.style.display = "block";
        }

        return false;
    }

    const result =
        loginUser(
            phone,
            password,
            selectedRole
        );

    if (!result.success) {

        if (error) {

            error.textContent =
                result.message;

            error.style.display =
                "block";

        } else {

            alert(result.message);

        }

        return false;
    }

    if (error) {
        error.style.display = "none";
    }

    redirectByRole(result.user);

    return true;
}

/* ===== REDIRECT BY ROLE ===== */

function redirectByRole(user) {

    if (!user) {
        window.location.href =
            "login.html";
        return;
    }

    if (user.role === "ceo") {

        window.location.href =
            "ceo/dashboard.html";

        return;
    }

    if (user.role === "teacher") {

        window.location.href =
            "teacher/dashboard.html";

        return;
    }

    window.location.href =
        "learner/dashboard.html";
}

/* ===== GET CURRENT USER ===== */

function getLoggedInUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                CURRENT_USER_KEY
            )
        );

    } catch (error) {

        return null;
    }
}

/* ===== LOGOUT ===== */

function logoutUser() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    window.location.href =
        "login.html";
}