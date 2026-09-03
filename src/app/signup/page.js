"use client"
import React, { useState } from "react"
import toast from "react-hot-toast"


export default function Signup()

{
    const [name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const[loading,setLoading]=useState(false);
    const handleSignup = async (e)=>
    
    {
        e.preventDefault();
        setLoading(true);
        try{
            const response =await fetch ( `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
                {
                    method:"POST",
                    headers:
                    {
                        "Content-Type": "application/json",
                    
                    },
                    body:JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );
            const data = await response.json();
            if(!response.ok)
            {
                toast.error(data.message || "Signup failed");
                return;

               
            }
            toast.success(data.message||"Account Created successfully");

            setName("");
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
                    Create Account
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Start storing your files securely
                </p>
            </div>
            <form onSubmit = {handleSignup} className ="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Name

                    </label>
                    <input value ={name} onChange ={(e)=>setName(e.target.value)} type="text" placeholder="Enter Your Name" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"/>
                    
                </div>
               
            
             <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email

                    </label>
                    <input value ={email} onChange ={(e)=>setEmail(e.target.value)} type="email" placeholder="Enter Your Email" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"/>
                    
                </div>
             <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Password

                    </label>
                    <input value ={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Create a password" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"/>
                    
                </div>
                <button type="submit" disabled = {loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">{loading ? "Create Account....":"Create Account"}</button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">Already have an account?{" " } <a href ="/login" className="font-semibold text-blue-600 hover:underline">Login</a></p>

        </div>
       </main>
    )
}