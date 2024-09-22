"use client";
import React from 'react';
import Calendar from '@/components/Calendar';

export default function DashboardPage({ params }) {
  const { userId } = params;
  return (
    <div>
      <Calendar userId={userId} />
    </div>
  );
}
