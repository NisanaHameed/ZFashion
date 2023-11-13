function validateForm() {

    let Password = document.getElementById('password').value;
    let mobile = document.getElementById('mobile').value;
    let err = document.getElementById('Error');

    let em = emailCheck();
    if (em == false) {
      returnToPreviousPage;
      return false;
    }
    if(mobile.length!=10){
      err.innerText = "Invalid mobile number";
      returnToPreviousPage;
      return false;
    }
    if (Password.length < 5) {
      err.innerText = "Password must contain atleast 5 characters";
      returnToPreviousPage;
      return false;
    }
    return true;
  }

  function returnToPreviousPage() {
    window.history.back();
  }

  function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
  }

  function containNumbers(str) {
    const numbers = /[1234567890]/;
    return numbers.test(str);
  }

  function ValidateEmail(email) {
    const characters = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (characters.test(email)) {
      return true;
    } else {
      return false;
    }
  }

  function ValidateEmailSignature(email) {
    const characters = /@/;
    if (characters.test(email)) {
      return true;
    } else {
    }
  }

  function emailCheck() {
    var email = document.getElementById("email").value;

    if (email == "" || email == null) {
      document.getElementById("Error").innerHTML = "This area should not be blank";
      return false;
    } else {
      if (ValidateEmail(email)) {
        document.getElementById("Error").innerHTML = "";
        return true;
      } else {
        if (ValidateEmailSignature(email)) {
          document.getElementById("Error").innerHTML = "Invalid email";
          return false;
        } else {
          document.getElementById("Error").innerHTML = "Email should contain '@'";
          return false;
        }
      }
    }
  }
