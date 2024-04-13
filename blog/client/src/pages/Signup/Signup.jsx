import React, { useEffect, useState } from 'react'
import './Signup.css';
import { gql, useMutation } from '@apollo/client';

const SIGNUP = gql`
    mutation Reg($name: String!, $email: String!, $password: String!, $bio: String){
        signup(name: $name, email: $email, password: $password, bio: $bio){
            useError
            token
        }
    }
`

const Signup = () => {
    const [signup, { data, loading, error }] = useMutation(SIGNUP);
    const [isError, setIsError] = useState(null);

    const handOnSubmit = (e) => {
        e.preventDefault();

        const data = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value,
            bio: e.target.bio.value
        }
        signup({
            variables: data
        })
        
    }
    console.log(data)
    // useEffect(() => {
    //     if()
    // }, [])
    return (
        <div className="form">
            <form onSubmit={handOnSubmit}>
                <label htmlFor="">Full Name</label>
                <input type="text" name='name' />

                <label htmlFor="">Email</label>
                <input type="email" name='email' />

                <label htmlFor="">Password</label>
                <input type="password" name='password' />

                <label htmlFor="">Bio</label>
                <input type="text" name='bio' />

                <button type='submit' className='rounded-full p-2 bg-white text-black'>Register</button>

            </form>
        </div>
    )
}

export default Signup;