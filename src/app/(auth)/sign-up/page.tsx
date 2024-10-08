"use client";

import { useForm } from "react-hook-form";
import { Merienda } from 'next/font/google';
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormLabel, FormMessage, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const merienda = Merienda({ subsets: ['latin'] });

function SignUp() {
    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const debounced = useDebounceCallback(setUsername, 300);

    const { toast } = useToast();
    const router = useRouter();

    // zod schema
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const checkUniqueUsername = async () => {
            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage("");
                try {
                    const response = await axios.get(
                        `/api/check-unique-username?username=${username}`
                    );
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ||
                            "Error checking username"
                    );
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        };
        checkUniqueUsername();
    }, [username]);

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>('/api/signup', data);
            toast({
                title: response.data ? 'Success' : 'Error',
                description: response.data.message,
            });
            router.replace(`/verify/${username}`);
            setIsSubmitting(false);
        } catch (error) {
            console.error("User sign up error", error);
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message || "Error signing up";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <Navbar />
        <div className="flex justify-center items-center pt-4 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg shadow-xl border border-gray-700">
                <div className="text-center">
                    <h1 className={`text-5xl font-bold text-white ${merienda.className}`}>SecretNotes</h1>
                    <p className="text-gray-300 mt-2">Sign up to get started</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="bg-gray-800 text-white border-gray-600"
                                            placeholder="SillyTuscan28" 
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debounced(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    {isCheckingUsername && <Loader2 className="animate-spin text-white" />}
                                    <p className={`text-sm ${usernameMessage === "Username is available" ? 'text-green-500' : 'text-red-500'}`}>
                                        {' '}{usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="bg-gray-800 text-white border-gray-600"
                                            placeholder="sillybilly@zoo.com" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="bg-gray-800 text-white border-gray-600"
                                            type="password" 
                                            placeholder="********" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center items-center">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> 
                                        Please wait...
                                    </>
                                ) : ('Sign Up')}
                            </Button>
                        </div>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p className="text-gray-400">
                        Already a user?{" "}
                        <Link href="/sign-in" className="text-blue-400 hover:text-blue-600 transition duration-200">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </div>
    );
}

export default SignUp;
