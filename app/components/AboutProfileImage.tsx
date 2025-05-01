'use client';
import dynamic from 'next/dynamic';

const ProfileImage = dynamic(() => import('./ProfileImage'), { ssr: false });

export default function AboutProfileImage() {
  return <ProfileImage />;
} 