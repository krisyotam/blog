'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProfileImage() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={isHovered ? "/images/krisyotam-colored.jpg" : "/images/krisyotam.jpg"}
        alt="Kris Yotam"
        className="rounded-full bg-gray-100 block mt-2 mb-5 mx-auto sm:float-right sm:ml-5 sm:mb-5"
        unoptimized
        width={160}
        height={160}
        priority
      />
    </div>
  );
}