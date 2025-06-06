'use client';

import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import React from 'react';

const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
    }
  }
`;

type EventType = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  isRecurring: boolean;
  recurrenceRule?: string;
};

type EventData = {
  event: EventType;
};

type EventVars = {
  id: string;
};

export default function EventDetail() {
  const params = useParams();
  const id = params?.id as string;

  const { loading, error, data } = useQuery<EventData, EventVars>(GET_EVENT, {
    variables: { id },
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="bg-white bg-opacity-80 backdrop-blur-md p-6 rounded-lg shadow-lg">
          <p className="text-red-500 text-lg font-medium">Error: {error.message}</p>
        </div>
      </div>
    );

  const event = data?.event;

  if (!event) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
          {event.title}
        </h1>
        <div className="space-y-4 text-gray-800">
          <InfoItem iconPath="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" label="Description" value={event.description} />

          <InfoItem
            iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            label="Start Time"
            value={
              event.startTime && !isNaN(Number(event.startTime))
                ? new Date(Number(event.startTime)).toLocaleString()
                : 'Invalid start time'
            }
          />

          <InfoItem
            iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            label="End Time"
            value={
              event.endTime && !isNaN(Number(event.endTime))
                ? new Date(Number(event.endTime)).toLocaleString()
                : 'Invalid end time'
            }
          />

          <InfoItem
            iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            label="Location"
            value={event.location}
          />

          <InfoItem
            iconPath="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            label="Recurring"
            value={event.isRecurring ? `Yes (${event.recurrenceRule || 'N/A'})` : 'No'}
          />
        </div>
      </div>
    </main>
  );
}

function InfoItem({ iconPath, label, value }: { iconPath: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <svg className="w-5 h-5 text-indigo-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
      </svg>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}
