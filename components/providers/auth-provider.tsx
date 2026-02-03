"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type User = {
    id: string;
    display_name: string;
    avatar_url?: string;
    role: string;
}

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (id: string, password?: string) => Promise<{ error: string | null }>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load session from localStorage on mount
    useEffect(() => {
        const loadSession = () => {
            const storedUser = localStorage.getItem('lucid_user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user session", e);
                    localStorage.removeItem('lucid_user');
                }
            }
            setIsLoading(false);
        };

        loadSession();
    }, []);

    const login = async (id: string, password?: string) => {
        try {
            // 1. Check if user exists in our custom 'professors' table
            const { data, error } = await supabase
                .from('professors')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return { error: 'Invalid ID. Please check your credentials.' };
            }

            // 2. Validate password (if provided/required) - Simple check for this demo
            if (password && data.password !== password) {
                return { error: 'Invalid password.' };
            }

            // 3. Set Session
            const userData: User = {
                id: data.id,
                display_name: data.display_name,
                role: data.id === 'tanguy' || data.id === 'LUCID_PROF_ADMIN' ? 'admin' : 'professor'
            };

            setUser(userData);
            localStorage.setItem('lucid_user', JSON.stringify(userData));
            return { error: null };

        } catch (err) {
            console.error("Login error:", err);
            return { error: 'An unexpected error occurred.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lucid_user');
        router.push('/login');
    };

    const updateUser = (data: Partial<User>) => {
        setUser(prev => {
            if (!prev) return null
            const updated = { ...prev, ...data }
            localStorage.setItem('lucid_user', JSON.stringify(updated))
            return updated
        })
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
