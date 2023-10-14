import React from 'react';

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
<div className='flex justify-center text-cat-main'>
  <div className=''>
    <h1 className='mainHl mb-3'>Account Creation:</h1>
    <form className='' 
      onSubmit={(event) => {submitCreation(event)}}>
      <div className='justify-between flex flex-row my-1'>
        <label htmlFor='invitationCode' className='mr-1 my-auto'>Invitation Credentials:</label>
        <input id="invitationCode" type='text' className='inputElement'></input>
      </div>
      <div className='justify-between flex flex-row my-1'>
        <label htmlFor='username' className='mr-1 my-auto'>Choose a Username:</label>
        <input id="username" type='text' className='inputElement'></input>
      </div>
      <div className='justify-between flex flex-row my-1'>
        <label htmlFor='passwd' className='mr-1 my-auto'>Set a Password:</label>
        <input id="passwd" type='password' className='inputElement'></input>
      </div>
      <div className='justify-between flex flex-row my-1'>
        <label htmlFor='passwdCheck' className='mr-1 my-auto'>Confirm Password:</label>
        <input id="passwdCheck" type='password' className='inputElement'></input>
      </div>
      <div className='justify-between flex flex-row my-1'>
        <a href='/login' className='link my-auto'>Already have an Account?</a>
        <input className='inputElement cursor-pointer ml-auto' type='submit' value='Create Account' />
      </div>
    </form>
    <p id='creationMsg'></p>
  </div>
</div>

  );
}

export default CreateAccount;
