import { useState } from 'react';
import './App.css'
import axios from 'axios';

function SignUpCard(){
 
  const signUp = (userName: string,email: string,pass: string) =>{

    let data = JSON.stringify({
      "username": userName,
      "password": pass,
      "email":email
    });

    let config = {
      headers: { 
        'Content-Type': 'application/json', 
      },
    };

    axios.post('https://menrracs-uggbwe54wq-uc.a.run.app/api/v1/auth/register',data, config).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    });
  };

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault(); // Prevents default form submission behavior

    signUp(userName,email,pass);

    // Call any necessary submission methods here
    // ...

  }
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [pass, setPass] = useState('');

/* const handleSubmit = (e: { preventDefault: () => void; }) =>{
e.preventDefault();

}
 */    

  return(
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company">
        </img> */}
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign Up</h2>
      </div>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="flex text-sm font-medium leading-6 text-gray-900 items-start">User name</label>
          <div className="mt-2">
          {/* type="email" autoComplete="email" required */}
            <input value={email} onChange={(e)=> setEmail(e.target.value)} name="email"  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></input>
          </div>
        </div>
       <div>
          <label htmlFor="email" className="flex text-sm font-medium leading-6 text-gray-900 items-start">Email</label>
          <div className="mt-2">
          {/* type="email" autoComplete="email" required */}
            <input value={userName} onChange={(e)=> setUserName(e.target.value)} name="email"  className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></input>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
           <div></div>
            
          </div>
          <div className="mt-2">
            <input value={pass} onChange={(e)=> setPass(e.target.value)} name="password" type="password" autoComplete="current-password" required className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </input>
          </div>
        </div>

        <div>
          <button type='submit' className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Create an account</button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?
        <a href="/" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Log in</a>
      </p>
    </div>
  </div>
  );
}

export default SignUpCard