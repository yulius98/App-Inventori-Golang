import React, { useState } from 'react'
import Api from '../service/Api'
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    const [, setError] = useState('')
    const [, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await Api.post(
                'login',
                {
                email,
                password,
                },
            )

            // Ambil token dari response
            const token = typeof response.data === 'string' ? response.data : (response.data.token || response.data.access_token)
            if (!token) {
                setError('Token tidak ditemukan pada respons server');
                setLoading(false)
                return
            }

            // Simpan token ke localStorage
            localStorage.setItem('token', token)

            // Jika ada data role/user_id pada respons, simpan juga (opsional)
            // Coba decode JWT untuk ambil role dan user_id jika ada
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.role) {
                    localStorage.setItem('role', payload.role);
                    localStorage.setItem('email', payload.email)
                    localStorage.setItem('user_name', payload.user_name)
                }
            } catch {
                // Tidak apa-apa jika gagal decode
            }
                       
            if (localStorage.getItem('role') === 'admin') {
                navigate('/dashboard')
            } else {
                navigate('/kasir')
            }
            // Jika ingin handle role lain, tambahkan else if di sini
        } catch (err) {
            console.error('Login error:', err.response ? err.response.data : err.message);
            setError('Login gagal, periksa email dan password');
        } finally {
        setLoading(false);
        }
    };

    
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
            {/* Left Section */}
            <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div>
                <h2 style={{ textAlign: "center", fontSize: 40, fontWeight: "bold", color: "blue" }}>INVENTORI</h2>
            </div>

            <div className="mt-12 flex flex-col items-center">
                <h1 className="text-2xl xl:text-3xl font-extrabold">
                    Sign up
                </h1>

                <div className="w-full flex-1 mt-8">
                    {/* Form */}
                    <div className="mx-auto max-w-xs">
                        <form onSubmit={handleSubmit}>
                            <input
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            />

                            <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                            />

                            <button className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                            <svg
                                className="w-6 h-6 -ml-2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <path d="M20 8v6M23 11h-6" />
                            </svg>
                            <span className="ml-3">Sign Up</span>
                            </button>
                        </form>
                        

                        <p className="mt-6 text-xs text-gray-600 text-center">
                        I agree to abide by templatana&apos;s{" "}
                        <a href="#" className="border-b border-gray-500 border-dotted">
                            Terms of Service
                        </a>{" "}
                        and its{" "}
                        <a href="#" className="border-b border-gray-500 border-dotted">
                            Privacy Policy
                        </a>
                        </p>
                    </div>
                </div>
            </div>
            </div>

            {/* Right Section */}
            <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
            <div
                className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
                style={{
                backgroundImage:
                    "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
                }}
            />
            </div>
        </div>
        </div>
    );
    


}

export default LoginPage
