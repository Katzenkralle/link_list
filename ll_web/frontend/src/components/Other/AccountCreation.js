import React from 'react';
import '../../../static/LinkList/AccountCreation.css'

function CreateAccount() {

    const setCreationMsgInnerHTML = (msg) => {document.getElementById('creationMsg').innerHTML = msg}
    const submitCreation = (event) => {
      //Submit the form data to the api, creating a new account
      //Prevent the default action of the form, if successful, redirect to login, else show an error message for short time  
        
      event.preventDefault();
        
        var passwd = document.getElementById('passwd').value
        var passwdCheck = document.getElementById('passwdCheck').value


        if (passwd != passwdCheck){
            setCreationMsgInnerHTML('Password and Password Confirmation ar not the same');
            setTimeout(() => {setCreationMsgInnerHTML('');}, 5000);
            return
        }

        const formData = new FormData(event.target);
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
        formData.append("invatation_code", document.getElementById('invitationCode').value)
        formData.append("user", document.getElementById('username').value)
        formData.append("passwd", document.getElementById('passwd').value)
        formData.append("action", 'account_creation')

      fetch("otherApi/accountCreation/", {
        method: 'POST',
        body: formData,
      })
        .then((response) => {
          switch (response.status){
            case 204: setCreationMsgInnerHTML("This should never happen"); break;
            case 226: setCreationMsgInnerHTML("The user already exists"); break;
            case 423: setCreationMsgInnerHTML("Please input a valid Invatation Code"); break;
            case 406: setCreationMsgInnerHTML("The Username or Password is invalid"); break;
            case 201: window.location.href = '/login'; break;
          }
        })
        .catch((error) => {
          setCreationMsgInnerHTML("This should never happen:" + error);
        });
        setTimeout(() => {setCreationMsgInnerHTML('');}, 5000);
    }

  return (
<div className='main_frame_login'>
  <div>
    <h3>Account Creation:</h3>
    <form onSubmit={(event) => {submitCreation(event)}}>
      <div className='form-row'>
        <label htmlFor='invitationCode'>Invitation Credentials:</label>
        <input id="invitationCode" type='text'></input>
      </div>
      <div className='form-row'>
        <label htmlFor='username'>Choose a Username:</label>
        <input id="username" type='text'></input>
      </div>
      <div className='form-row'>
        <label htmlFor='passwd'>Set a Password:</label>
        <input id="passwd" type='password'></input>
      </div>
      <div className='form-row'>
        <label htmlFor='passwdCheck'>Confirm Password:</label>
        <input id="passwdCheck" type='password'></input>
      </div>
      <div className='form-submit'>
        <input type='submit' value='Create Account' />
        <a href='/login'>Already have an Account?</a>
      </div>
    </form>
    <p id='creationMsg'></p>
  </div>
</div>

  );
}

export default CreateAccount;
