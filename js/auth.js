"use strict";

/* MULE LEARNER TUITION - FIREBASE AUTH */

const CURRENT_USER_KEY = "muleCurrentUser";
const DB = "https://mule-learner-tuition-264fe-default-rtdb.firebaseio.com";

const CEO = {
  id:"CEO-MULE-001",
  name:"Owen Singogo",
  phone:"0978362800",
  password:"Muleya22",
  role:"ceo",
  status:"active",
  createdAt:"2026-09-02T00:00:00.000Z"
};


/* ---------- PHONE ---------- */

function normalizePhone(phone){
  let p=String(phone||"").replace(/\s+/g,"").trim();
  if(p.startsWith("+260")) p="0"+p.substring(4);
  if(p.startsWith("260")) p="0"+p.substring(3);
  return p;
}


/* ---------- FIREBASE ---------- */

async function firebaseGet(path){
  const r=await fetch(DB+"/"+path+".json",{cache:"no-store"});
  if(!r.ok) throw new Error("Firebase connection failed.");
  return await r.json();
}

async function firebaseSet(path,data){
  const r=await fetch(DB+"/"+path+".json",{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  if(!r.ok) throw new Error("Firebase save failed.");
  return await r.json();
}

async function firebasePatch(path,data){
  const r=await fetch(DB+"/"+path+".json",{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  });
  if(!r.ok) throw new Error("Firebase update failed.");
  return await r.json();
}


/* ---------- USERS ---------- */

function usersArray(data){
  if(!data) return [];
  if(Array.isArray(data)) return data.filter(Boolean);

  return Object.keys(data).map(k=>{
    if(data[k] && !data[k].id) data[k].id=k;
    return data[k];
  }).filter(Boolean);
}

async function getUsersFirebase(){
  return usersArray(await firebaseGet("users"));
}


/* ---------- CEO ---------- */

async function ensureCEO(){

  let users=await getUsersFirebase();

  let ceo=users.find(u=>
    String(u.role||"").toLowerCase()==="ceo" ||
    normalizePhone(u.phone)===CEO.phone
  );

  if(!ceo){
    await firebaseSet("users/"+CEO.id,CEO);
    return CEO;
  }

  if(
    ceo.status!=="active" ||
    !ceo.password ||
    !ceo.role
  ){
    await firebasePatch("users/"+ceo.id,{
      name:CEO.name,
      phone:CEO.phone,
      password:CEO.password,
      role:"ceo",
      status:"active"
    });
  }

  return ceo;
}


/* ---------- CREATE ID ---------- */

function createUserId(role){
  const p=role==="teacher"?"TCH":role==="ceo"?"CEO":"LRN";
  return p+"-"+Date.now().toString(36).toUpperCase()+"-"+
    Math.random().toString(36).substring(2,7).toUpperCase();
}


/* ---------- REGISTER ---------- */

async function registerUser(data){

  try{

    const users=await getUsersFirebase();

    const name=String(data.name||"").trim();
    const phone=normalizePhone(data.phone);
    const password=String(data.password||"");
    const role=String(data.role||"learner").toLowerCase();

    if(!name||!phone||!password){
      return {success:false,message:"Please complete all required fields."};
    }

    if(users.some(u=>normalizePhone(u.phone)===phone)){
      return {success:false,message:"An account with this phone number already exists."};
    }

    const user={
      id:createUserId(role),
      name:name,
      phone:phone,
      password:password,
      role:role,
      status:role==="teacher"?"pending":"active",
      createdAt:new Date().toISOString()
    };

    /* Keep extra teacher information */
    ["email","subject","qualification","experience","applicationId"]
    .forEach(k=>{
      if(data[k]!==undefined) user[k]=data[k];
    });

    await firebaseSet("users/"+user.id,user);

    return {
      success:true,
      message:role==="teacher"
        ?"Teacher application submitted successfully. Please wait for CEO approval."
        :"Account created successfully.",
      user:user
    };

  }catch(e){

    console.error(e);

    return {
      success:false,
      message:"Unable to connect to the platform database. Please check your internet connection and try again."
    };
  }
}


/* ---------- LOGIN ---------- */

async function loginUser(phone,password,selectedRole){

  try{

    await ensureCEO();

    const users=await getUsersFirebase();

    const p=normalizePhone(phone);
    const pass=String(password||"");
    const role=String(selectedRole||"").toLowerCase();

    const user=users.find(u=>
      normalizePhone(u.phone)===p &&
      String(u.password||"")===pass &&
      String(u.role||"").toLowerCase()===role
    );

    if(!user){
      return {
        success:false,
        message:"Incorrect phone number, password or account type."
      };
    }

    const status=String(user.status||"active").toLowerCase();

    if(status==="suspended"){
      return {
        success:false,
        message:"Your account has been suspended. Please contact support."
      };
    }

    if(role==="teacher" && status==="pending"){
      return {
        success:false,
        message:"Your teacher account is awaiting CEO approval."
      };
    }

    if(role==="teacher" && status==="rejected"){
      return {
        success:false,
        message:"Your teacher application was rejected. Please contact support."
      };
    }

    /* Session only */
    localStorage.setItem(CURRENT_USER_KEY,JSON.stringify({
      id:user.id,
      name:user.name,
      phone:user.phone,
      role:user.role,
      status:user.status,
      email:user.email||"",
      subject:user.subject||"",
      applicationId:user.applicationId||""
    }));

    return {
      success:true,
      message:"Login successful.",
      user:user
    };

  }catch(e){

    console.error(e);

    return {
      success:false,
      message:"Unable to connect to the platform database. Please check your internet connection and try again."
    };
  }
}


/* ---------- LOGIN PAGE ---------- */

async function login(event,selectedRole){

  if(event) event.preventDefault();

  const phone=document.getElementById("phone")?.value.trim();
  const password=document.getElementById("password")?.value;
  const error=document.getElementById("error");
  const button=document.querySelector("button.login");

  if(!phone||!password){
    if(error){
      error.textContent="Please enter your phone number and password.";
      error.style.display="block";
    }
    return false;
  }

  if(button){
    button.disabled=true;
    button.textContent="Logging in...";
  }

  const result=await loginUser(phone,password,selectedRole);

  if(!result.success){

    if(error){
      error.textContent=result.message;
      error.style.display="block";
    }else{
      alert(result.message);
    }

    if(button){
      button.disabled=false;
      button.textContent="Login";
    }

    return false;
  }

  redirectByRole(result.user);
  return true;
}


/* ---------- REDIRECT ---------- */

function redirectByRole(user){

  if(!user){
    location.href="login.html";
    return;
  }

  const role=String(user.role||"").toLowerCase();

  if(role==="ceo"){
    location.href="ceo/dashboard.html";
  }else if(role==="teacher"){
    location.href="teacher/dashboard.html";
  }else if(role==="learner"){
    location.href="learner/dashboard.html";
  }else{
    location.href="login.html";
  }
}


/* ---------- SESSION ---------- */

function getLoggedInUser(){

  try{
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  }catch(e){
    return null;
  }
}

function isLoggedIn(){
  return !!getLoggedInUser();
}

function hasRole(role){

  const user=getLoggedInUser();

  return !!user &&
    String(user.role||"").toLowerCase()===
    String(role||"").toLowerCase();
}


/* ---------- LOGOUT ---------- */

function logoutUser(){

  localStorage.removeItem(CURRENT_USER_KEY);
  location.href="../login.html";
}


/* ---------- PAGE PROTECTION ---------- */

function protectPage(role){

  const user=getLoggedInUser();

  if(!user){
    location.href="../login.html";
    return false;
  }

  if(
    role &&
    String(user.role||"").toLowerCase()!==
    String(role).toLowerCase()
  ){
    location.href="../login.html";
    return false;
  }

  return true;
}

function protectLearnerPage(){
  return protectPage("learner");
}

function protectTeacherPage(){
  return protectPage("teacher");
}

function protectCEOPage(){
  return protectPage("ceo");
}


/* ---------- REFRESH SESSION ---------- */

async function refreshLoggedInUser(){

  const session=getLoggedInUser();

  if(!session) return null;

  try{

    const users=await getUsersFirebase();

    const user=users.find(u=>u.id===session.id);

    if(!user){
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }

    const status=String(user.status||"active").toLowerCase();

    if(status==="suspended"||status==="rejected"){
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify({
        id:user.id,
        name:user.name,
        phone:user.phone,
        role:user.role,
        status:user.status,
        email:user.email||"",
        subject:user.subject||"",
        applicationId:user.applicationId||""
      })
    );

    return user;

  }catch(e){
    return session;
  }
}


/* ---------- START ---------- */

ensureCEO().catch(e=>{
  console.warn("Firebase initialization:",e.message);
});