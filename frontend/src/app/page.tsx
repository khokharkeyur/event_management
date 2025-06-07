'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Event = {
  id: string;
  title: string;
  startTime: string;
  location: string;
};

type GetEventsData = {
  filterEventsByDate: Event[];
};

type GetEventsVars = {
  startDate: string | null;
  endDate: string | null;
};

type DeleteEventVars = {
  id: string;
};

const GET_EVENTS = gql`
  query GetEvents($startDate: String, $endDate: String) {
    filterEventsByDate(startDate: $startDate, endDate: $endDate) {
      id
      title
      startTime
      location
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export default function Home() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [startDate, endDate] = dateRange;

  const { loading, error, data, refetch } = useQuery<GetEventsData, GetEventsVars>(GET_EVENTS, {
    variables: {
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    },
    fetchPolicy: 'network-only',
  });

  const [deleteEvent] = useMutation<boolean, DeleteEventVars>(DELETE_EVENT);

  useEffect(() => {
    refetch({
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    });
  }, [startDate, endDate, refetch]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', Boolean(confirmDeleteId));
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [confirmDeleteId]);

  const handleDelete = (id: string) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      await deleteEvent({ variables: { id: confirmDeleteId } });
      toast.success('Event deleted', { className: 'bg-green-500 text-white rounded-lg' });
      await refetch();
    } catch {
      toast.error('Failed to delete event', { className: 'bg-red-500 text-white rounded-lg' });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const events = data?.filterEventsByDate ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1f2937;
          outline: none;
          transition: all 0.3s ease;
        }
        .react-datepicker__input-container input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
        }
        .react-datepicker {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .react-datepicker__header {
          background: linear-gradient(to right, #6366f1, #a855f7);
          color: white;
          border-bottom: none;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range {
          background: #8b5cf6;
          color: white;
        }
        .react-datepicker__day:hover {
          background: #e5e7eb;
          color: #1f2937;
        }
        .react-datepicker__close-icon::after {
          background: #ef4444;
          color: white;
        }
        @media (max-width: 640px) {
          .react-datepicker {
            transform: scale(0.9);
            margin: 0 auto;
          }
        }
      `}</style>
      <div className="max-w-5xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Upcoming Events
          </h1>
          <Link
            href="/form"
            className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transition duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </Link>
        </div>

        <div className="mb-8">
          <label className="block mb-2 font-medium text-gray-800">Filter by Date Range</label>
          <div className="relative">
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                const [newStart, newEnd] = update;
                setDateRange([newStart, newEnd]);
              }}
              isClearable
              placeholderText="Select start and end date"
              className="w-full"
              dateFormat="MMM d, yyyy"
              minDate={new Date()}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-4">Error: {error.message}</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No events found for the selected date range.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = new Date(Number(event.startTime));
              return (
                <div
                  key={event.id}
                  className="bg-white bg-opacity-30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white border-opacity-20 hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                >
                  <Link
                    href={`/event/${event.id}`}
                    className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition duration-200"
                  >
                    {event.title}
                  </Link>
                  <p className="text-sm text-gray-700 mt-2">
                    {event.startTime && !isNaN(eventDate.getTime()) ? eventDate.toLocaleString() : 'Invalid date'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/form?id=${event.id}`}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition duration-200 transform hover:scale-105"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition duration-200 transform hover:scale-105 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg mx-4 text-center animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
