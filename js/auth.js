/* =========================================
   MULE LEARNER TUITION
   FIREBASE AUTHENTICATION
   Phone + Password + Role
========================================= */

"use strict";

const USERS_KEY = "muleUsers";
const CURRENT_USER_KEY = "muleCurrentUser";

const FIREBASE_DATABASE_URL =
"https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com";


/* =========================================
   NORMALIZE PHONE
========================================= */

function normalizePhone(phone){

    phone = String(phone || "").trim();

    phone = phone.replace(/\s+/g,"");

    if(phone.startsWith("+260")){
        phone = "0" + phone.substring(4);
    }

    if(phone.startsWith("260")){
        phone = "0" + phone.substring(3);
    }

    return phone;
}


/* =========================================
   FIREBASE GET
========================================= */

async function firebaseGet(path){

    const response = await fetch(
        FIREBASE_DATABASE_URL +
        "/" +
        path +
        ".json"
    );

    if(!response.ok){

        throw new Error(
            "Firebase connection failed."
        );

    }

    return await response.json();
}


/* =========================================
   FIREBASE SET
========================================= */

async function firebaseSet(path,data){

    const response = await fetch(
        FIREBASE_DATABASE_URL +
        "/" +
        path +
        ".json",
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify(data)
        }
    );

    if(!response.ok){

        throw new Error(
            "Could not save data to Firebase."
        );

    }

    return await response.json();
}


/* =========================================
   CONVERT FIREBASE USERS TO ARRAY
========================================= */

function firebaseUsersToArray(data){

    if(!data){
        return [];
    }

    if(Array.isArray(data)){
        return data.filter(Boolean);
    }

    return Object.keys(data)
        .map(function(key){
            return data[key];
        })
        .filter(Boolean);
}


/* =========================================
   GET USERS
   Firebase is now the main database.
========================================= */

async function getUsersFirebase(){

    const data =
        await firebaseGet("users");

    return firebaseUsersToArray(data);
}


/* =========================================
   LOCAL GET USERS
   Kept for compatibility with old pages.
========================================= */

function getUsers(){

    try{

        return JSON.parse(
            localStorage.getItem(
                USERS_KEY
            )
        ) || [];

    }catch(error){

        return [];
    }
}


/* =========================================
   SAVE LOCAL USERS
========================================= */

function saveUsers(users){

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* =========================================
   CREATE USER ID
========================================= */

function createUserId(role){

    const prefix =
        role === "teacher"
        ? "TCH"
        :
        role === "ceo"
        ? "CEO"
        :
        "LRN";

    return prefix +
        "-" +
        Date.now()
        .toString(36)
        .toUpperCase() +
        "-" +
        Math.random()
        .toString(36)
        .substring(2,6)
        .toUpperCase();
}


/* =========================================
   REGISTER USER
========================================= */

async function registerUser(userData){

    try{

        const users =
            await getUsersFirebase();

        const name =
            String(
                userData.name || ""
            ).trim();

        const phone =
            normalizePhone(
                userData.phone
            );

        const password =
            String(
                userData.password || ""
            );

        const role =
            String(
                userData.role || "learner"
            )
            .trim()
            .toLowerCase();


        if(!name || !phone || !password){

            return {

                success:false,

                message:
                "Please complete all required fields."

            };

        }


        const existingPhone =
            users.find(function(user){

                return (
                    normalizePhone(
                        user.phone
                    ) === phone
                );

            });


        if(existingPhone){

            return {

                success:false,

                message:
                "An account with this phone number already exists."

            };

        }


        const newUser = {

            id:createUserId(role),

            name:name,

            phone:phone,

            password:password,

            role:role,

            status:
                role === "teacher"
                ? "pending"
                : "active",

            createdAt:
                new Date().toISOString()

        };


        /*
           SAVE TO FIREBASE
        */

        await firebaseSet(
            "users/" + newUser.id,
            newUser
        );


        /*
           SAVE LOCAL COPY
           For compatibility with old pages.
        */

        const localUsers =
            getUsers();

        localUsers.push(newUser);

        saveUsers(localUsers);


        return {

            success:true,

            message:
                role === "teacher"
                ?
                "Teacher application submitted successfully."
                :
                "Account created successfully.",

            user:newUser

        };

    }catch(error){

        console.error(
            "Registration error:",
            error
        );

        return {

            success:false,

            message:
            "Unable to connect to the platform database. Please check your internet connection and try again."

        };

    }

}


/* =========================================
   LOGIN USER
   Firebase version
========================================= */

async function loginUser(
    phone,
    password,
    selectedRole
){

    try{

        const users =
            await getUsersFirebase();

        const cleanPhone =
            normalizePhone(phone);

        const cleanPassword =
            String(password || "");

        const cleanRole =
            String(
                selectedRole || ""
            )
            .trim()
            .toLowerCase();


        const user =
            users.find(function(account){

                return (

                    normalizePhone(
                        account.phone
                    ) === cleanPhone

                    &&

                    String(
                        account.password
                    ) === cleanPassword

                    &&

                    String(
                        account.role
                    )
                    .toLowerCase()
                    === cleanRole

                );

            });


        if(!user){

            return {

                success:false,

                message:
                "Incorrect phone number, password or account type."

            };

        }


        /*
           CHECK ACCOUNT STATUS
        */

        const status =
            String(
                user.status || "active"
            )
            .toLowerCase();


        if(status === "suspended"){

            return {

                success:false,

                message:
                "Your account has been suspended. Please contact support."

            };

        }


        /*
           TEACHER MUST BE APPROVED
        */

        if(
            user.role === "teacher" &&
            (
                status === "pending" ||
                status === "rejected"
            )
        ){

            if(status === "rejected"){

                return {

                    success:false,

                    message:
                    "Your teacher application was rejected. Please contact support."

                };

            }

            return {

                success:false,

                message:
                "Your teacher account is awaiting CEO approval."

            };

        }


        /*
           SAVE SESSION
        */

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(user)
        );


        /*
           ALSO KEEP A LOCAL USERS COPY
        */

        saveUsers(users);


        return {

            success:true,

            message:
            "Login successful.",

            user:user

        };

    }catch(error){

        console.error(
            "Login error:",
            error
        );

        return {

            success:false,

            message:
            "Unable to connect to the platform database. Please check your internet connection and try again."

        };

    }

}


/* =========================================
   LOGIN PAGE
========================================= */

async function login(
    event,
    selectedRole
){

    if(event){

        event.preventDefault();

    }


    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();


    const password =
        document.getElementById(
            "password"
        )?.value;


    const error =
        document.getElementById(
            "error"
        );


    if(!phone || !password){

        if(error){

            error.textContent =
                "Please enter your phone number and password.";

            error.style.display =
                "block";

        }

        return false;

    }


    /*
       Show loading
    */

    const loginButton =
        document.querySelector(
            "button.login"
        );


    if(loginButton){

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";

    }


    const result =
        await loginUser(

            phone,

            password,

            selectedRole

        );


    if(!result.success){

        if(error){

            error.textContent =
                result.message;

            error.style.display =
                "block";

        }else{

            alert(
                result.message
            );

        }


        if(loginButton){

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";

        }

        return false;

    }


    if(error){

        error.style.display =
            "none";

    }


    redirectByRole(
        result.user
    );

    return true;

}


/* =========================================
   REDIRECT BY ROLE
========================================= */

function redirectByRole(user){

    if(!user){

        window.location.href =
            "login.html";

        return;

    }


    const role =
        String(
            user.role || ""
        ).toLowerCase();


    if(role === "ceo"){

        window.location.href =
            "ceo/dashboard.html";

        return;

    }


    if(role === "teacher"){

        window.location.href =
            "teacher/dashboard.html";

        return;

    }


    window.location.href =
        "learner/dashboard.html";

}


/* =========================================
   GET CURRENT USER
========================================= */

function getLoggedInUser(){

    try{

        return JSON.parse(

            localStorage.getItem(
                CURRENT_USER_KEY
            )

        );

    }catch(error){

        return null;

    }

}


/* =========================================
   LOGOUT
========================================= */

function logoutUser(){

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    window.location.href =
        "login.html";

}


/* =========================================
   CHECK LOGIN
========================================= */

function isLoggedIn(){

    return !!getLoggedInUser();

}


/* =========================================
   CHECK ROLE
========================================= */

function hasRole(role){

    const user =
        getLoggedInUser();

    if(!user){

        return false;

    }

    return (
        String(user.role || "")
        .toLowerCase()
        ===
        String(role || "")
        .toLowerCase()
    );

}