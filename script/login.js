async function validateInput(user, pass){
    let userInfo;
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
    let username = document.getElementById("usernameField").value;
    let password = document.getElementById("passwordField").value;
    let retypePassword = document.getElementById("retypePasswordField").value;
    let firstName = document.getElementById("firstNameField").value;
    let lastName = document.getElementById("lastNameField").value;
    let email = document.getElementById("emailField").value;
    let optionalPhone = document.getElementById("optionalPhoneField").value;
    let birthday = document.getElementById("birthdayField").value;
    
    // Username Validation
    if(username.length < 8){
        document.getElementById("usernameErrorContainer").textContent = "Username needs to be at least 8 characters long.";
        return;
    }else {
        let doesUserExist = await checkIfUsernameExists(username).then((response) => response.json()).then((data) => {return data});
        document.getElementById("usernameErrorContainer").textContent = "";
        if(Object.keys(doesUserExist).length === 2){
            document.getElementById("usernameErrorContainer").textContent = "Username is already taken. Please choose another";
            return;
        }
        else{
            document.getElementById("usernameErrorContainer").textContent = "";
        }
    }
    
    console.log();
    //Password Validation - Validate password matches the retyped password
    if(password != retypePassword){
        document.getElementById("retypePasswordErrorContainer").textContent = "Passwords need to match.";
        return;
    }else {
        document.getElementById("retypePasswordErrorContainer").textContent = "";
    }
    //Password Validation - Validate password is of required length
    if(password.length < 8){
        document.getElementById("passwordErrorContainer").textContent = "Password needs to be at least 8 characters long.";
        return;
    }else {
        document.getElementById("passwordErrorContainer").textContent = "";
    }
    //First Name Validation - Validate First Name is at least 1 character
    if(firstName.length < 1){
        document.getElementById("firstNameErrorContainer").textContent = "First name is required.";
        return;
    }else {
        document.getElementById("firstNameErrorContainer").textContent = "";
    }
    //Last Name validation - Validate that Last Name is at least 1 character
    if(lastName.length < 1){
        document.getElementById("lastNameErrorContainer").textContent = "Last name/initial required.";
        return;
    }else {
        document.getElementById("lastNameErrorContainer").textContent = "";
    }
    //Email Validation - Validate (using regex) that a valid email is there 
    var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; 
    if(!email.match(emailRegex)){
        document.getElementById("emailErrorContainer").textContent = "Please enter a valid email.";
        return;
    }else {
        document.getElementById("emailErrorContainer").textContent = "";
    }
    //Phone Validaiton - Validate that no more than 14 characters are present
    //                  and are in the form 1-401-218-7528
    if(optionalPhone.length > 14){
        document.getElementById("optionalPhoneErrorContainer").textContent = "No more than 14 characters allowed for phone number";
        return;
    }else {
        document.getElementById("optionalPhoneErrorContainer").textContent = "";
    }
    //Birthday Validation - Validate that a proper date has been entered in the form of: 
    //                  MM-DD-YYYY
    var birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/
    if(!birthday.match(birthdayRegex)){
        document.getElementById("birthdayErrorContainer").textContent = "Please enter a valid birthday."; 
    }else {
        document.getElementById("birthdayErrorContainer").textContent = "";
    }
    var createAccountResponse = await createAccount(); 
    if(createAccountResponse.statusCode = "200"){
        window.location.href="signupSuccess.html";
        return;
    }else{      //Account Creation - Error Handling 
        if(createAccountResponse.statusCode = "403"){
            document.getElementById("usernameErrorContainer").textContent = "Username already taken. Please choose another"; 
        }
    }
    
}
function createAccount(){
    const input = {
        "userName": document.getElementById("usernameField").value,
        "password" : document.getElementById("passwordField").value,
        "firstName" : document.getElementById("firstNameField").value,
        "lastName" : document.getElementById("lastNameField").value,
        "email" : document.getElementById("emailField").value,
        "optionalPhone" : document.getElementById("optionalPhoneField").value,
        "birthday": document.getElementById("birthdayField").value,
        "creationDate": null
    }
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
    const data = {'userName': username,
                  'password': 'NO'};
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