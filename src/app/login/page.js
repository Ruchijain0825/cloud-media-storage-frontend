"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"



export default function Login()
{
    
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[loading,setLoading]=useState(false);
    const handleLogin = async (e)=>
    
    {
        e.preventDefault();
        setLoading(true);
        try{
            const response =await fetch ("http://localhost:8080/api/auth/login",
                {
                    method:"POST",
                    headers:
                    {
                        "Content-Type": "application/json",
                    
                    },
                    body:JSON.stringify({
                     
                        email,
                        password
                    })
                }
            );
            const data = await response.json();
            if(!response.ok)
            {
                toast.error(data.message || "Login failed");
                return;

               
            }
            toast.success(data.message||"Loggedin successfully");

            
            setEmail("");
            setPassword("")
        }catch(error)
        {
            toast.error("Something went wrong. Please try again")
        }
        finally{
            setLoading(false)
        }
    }
    return(
       <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Cloud Media Storage
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Sign in to your account
                </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input value={email} onChange={(e)=>setEmail(e.target.value)} type = "email" placeholder = "Enter your email" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"/>


                </div>
                <div>
                    <label className="mb-2 black text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input value ={password} onChange={(e)=>setPassword(e.target.value)} type = "password" placeholder = "Enter your email" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"/>


                </div>
              
                 <button type ="submit" className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                    Login
                 </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "} <a href ="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</a>
            </p>
        </div>
       </main>
    )
}