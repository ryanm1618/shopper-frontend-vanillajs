async function validateLoginInput(user, pass){
    let userInfo;
    if(user.length < 8){
        document.getElementById("usernameErrorContainer").textContent = "Invalid username";
        return;
    }else{
        document.getElementById("usernameErrorContainer").textContent = "";
    }
    if(pass.length < 8){
        document.getElementById("passwordErrorContainer").textContent = "Invalid password";
        return;
    }else{
        document.getElementById("passwordErrorContainer").textContent = "";
    }
    if(user != null && pass != null){
       userInfo = await login(user, pass).then(result => result.json()).then(data => {return data});
       console.log("Here goes nothing...")
       console.log(userInfo);
       //userInfo object should have 5+ fields; error object will have 2. 
       if(Object.keys(userInfo).length === 2){   //If an error is returned
         let errorResponse = JSON.parse(JSON.stringify(userInfo));
         if(errorResponse.statusCode === 401){   //401 - Bad Login Info
            document.getElementById("loginErrorContainer").textContent = "Username or password was incorrect. Try again.";
            return;
         }
       }
       localStorage.setItem("userInfo", JSON.stringify(userInfo));
       window.location.replace("./home.html");

    }
}
function login(user, pass) {
    const input = {
        'userId': 0,
        'userName': user,
        'password': pass
    };
    return fetch("http://localhost:8080/users/api/login", {  
        method: "POST",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(input),
    })
}
function navigateToAccountCreation(){
    window.location.href="signup.html";
}
async function validateNewAccountInfo(){
    const fromForm = {
        userName : document.getElementById("usernameField").value,
        password : document.getElementById("passwordField").value,
        retypePassword : document.getElementById("retypePasswordField").value,
        firstName : document.getElementById("firstNameField").value,
        lastName : document.getElementById("lastNameField").value,
        email : document.getElementById("emailField").value,
        optionalPhone : document.getElementById("optionalPhoneField").value,
        birthday : document.getElementById("birthdayField").value
    }
    // Username Validation
    if(fromForm.userName.length < 8){
        document.getElementById("usernameErrorContainer").textContent = "Username needs to be at least 8 characters long.";
        return;
    }else {
        let doesUserExist = await checkIfUsernameExists(fromForm.userName).then((response) => response.json()).then((data) => {return data});
        document.getElementById("usernameErrorContainer").textContent = "";
        if(Object.keys(doesUserExist).length === 2){
            document.getElementById("usernameErrorContainer").textContent = "Username is already taken. Please choose another";
            return;
        }
        else{
            document.getElementById("usernameErrorContainer").textContent = "";
        }
    }
    //Password Validation - Validate password matches the retyped password
    if(fromForm.password != fromForm.retypePassword){
        document.getElementById("retypePasswordErrorContainer").textContent = "Passwords need to match.";
        return;
    }else {
        document.getElementById("retypePasswordErrorContainer").textContent = "";
    }
    //Password Validation - Validate password is of required length
    if(fromForm.password.length < 8){
        document.getElementById("passwordErrorContainer").textContent = "Password needs to be at least 8 characters long.";
        return;
    }else {
        document.getElementById("passwordErrorContainer").textContent = "";
    }
    //First Name Validation - Validate First Name is at least 1 character
    /*if(fromForm.firstName.length < 1){
        document.getElementById("firstNameErrorContainer").textContent = "First name is required.";
        return;
    }else {
        document.getElementById("firstNameErrorContainer").textContent = "";
    }*/
    //Last Name validation - Validate that Last Name is at least 1 character
    if(fromForm.lastName.length < 1){
        document.getElementById("lastNameErrorContainer").textContent = "Last name/initial required.";
        return;
    }else {
        document.getElementById("lastNameErrorContainer").textContent = "";
    }
    //Email Validation - Validate (using regex) that a valid email is there 
    var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; 
    if(!fromForm.email.match(emailRegex)){
        document.getElementById("emailErrorContainer").textContent = "Please enter a valid email.";
        return;
    }else {
        document.getElementById("emailErrorContainer").textContent = "";
    }
    //Phone Validaiton - Validate that no more than 14 characters are present
    //                  and are in the form 1-401-218-7528
    if(fromForm.optionalPhone.length > 14){
        document.getElementById("optionalPhoneErrorContainer").textContent = "No more than 14 characters allowed for phone number";
        return;
    }else {
        document.getElementById("optionalPhoneErrorContainer").textContent = "";
    }
    //Birthday Validation - Validate that a proper date has been entered in the form of: 
    //                  MM-DD-YYYY
    var birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/
    if(!fromForm.birthday.match(birthdayRegex)){
        document.getElementById("birthdayErrorContainer").textContent = "Please enter a valid birthday."; 
        return;
    }else {
        document.getElementById("birthdayErrorContainer").textContent = "";
        fromForm.birthday = convertBirthdayToSQLDate(fromForm.birthday);
    }

    delete fromForm.retypePassword; //Need our object to match the DTO it'll be mapped to on the server
    var createAccountResponse = await createAccount(fromForm).then((response) => response.json()).then((data) => {return data}); 
    if(createAccountResponse.statusCode = "200"){
        window.location.href="signupSuccess.html";
        return;
    }else{      //Account Creation - Error Handling 
        if(createAccountResponse.statusCode = "403"){
            document.getElementById("usernameErrorContainer").textContent = "Username already taken. Please choose another"; 
        }
        if(createAccountResponse.statusCode = "400"){
            document.getElementById("usernameErrorContainer").textContent = "SOME ERROR OCCURRED";
        }
    }
    
}
function convertBirthdayToSQLDate(birthday){ 
    var bday = '';
    bday += birthday.substring(6) + '-';      //YYYY-
    bday += birthday.substring(0, 2) + '-';   //YYYY-MM-
    bday += birthday.substring(3, 5);         //YYYY-MM-DD

    return bday;
}
function getCurrentDateTime(){
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}
function createAccount(input){
    return fetch("http://localhost:8080/users/api/create-account", {  
        method: "POST",
        mode: "cors",
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:8080",
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(input),
    })
}
function checkIfUsernameExists(username){
    const data = {'userId': 0,
                  'userName': username,
                  'password': '00000000'};
    const url = 'http://localhost:8080/users/api/check-username'
    return fetch(url, {
       method: "POST",
       mode: "cors",
       headers: {
        "Access-Control-Allow-Origin": "http://localhost:5500",
        "Content-type": "application/json; charset=UTF-8"
       },
       body: JSON.stringify(data),
    })
}
function navigateToLogin(){
    window.location.href = "index.html";
}