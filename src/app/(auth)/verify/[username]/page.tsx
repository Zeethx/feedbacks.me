"use client"
import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifySchema } from '@/schemas/verifySchema';
import axios, {AxiosError} from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function verifyAccount() {
    const router = useRouter();
    const params = useParams<{ username: string }>();
    const {toast} = useToast();

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),

    }); 

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post <ApiResponse>('/api/verify-code', {
                username: params.username,
                verificationCode: data.verificationCode
            });

            toast({
                title: "Success",
                description: response.data.message,
            });

            router.replace('/sign-in');
            
        } catch (error) {
            console.error("User verification error", error);
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message || "Error verifying user";
            toast({
                title: "Signup Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-xl p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className='text-center'>
                <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-4'>Verify Your Account</h1>
                <p className='text-sm text-gray-700'>Enter the verification code sent to your email</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                    control={form.control}
                    name="verificationCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className='flex justify-center'>
                    <Button type="submit" className='px-8'>Verify</Button>
                    </div>
                </form>
            </Form>
            </div>
        </div>
  )
}

export default verifyAccount