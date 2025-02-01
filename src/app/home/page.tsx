// pages/index.js
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import VideoUpload from '@/app/components/VideoUpload';
import Header from '@/app/components/Header';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser({
        userId: decoded.userId,
        email: decoded.email,
        displayName: decoded.name || 'Usuário',
        image: decoded.picture || 'https://via.placeholder.com/150',
      });
    } catch (error) {
      console.error('Token inválido:', error);
      router.push('/login');
    }
  }, [router]);

  if (!user) return null; // Evita renderizar enquanto verifica o token

  return (
    <div>
      <Header user={user} />
      <div style={{ padding: '24px' }}>
        <VideoUpload user={user}/>
      </div>
    </div>
  );
}
