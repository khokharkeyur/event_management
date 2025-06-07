'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';

const ADD_EVENT = gql`
  mutation AddEvent($input: EventInput!) {
    addEvent(input: $input) {
      id
      title
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      location
      isRecurring
      recurrenceRule
      startTime
      endTime
    }
  }
`;

const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      title
      description
      location
      isRecurring
      recurrenceRule
      startTime
      endTime
    }
  }
`;

export default function AddOrEditEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const isEdit = !!eventId;

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));

  const { data: eventData, loading: eventLoading, error: eventError } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    skip: !isEdit,
    fetchPolicy: 'network-only',
  });

  const [addEvent] = useMutation(ADD_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);

  const parseDate = (val: any): Date => {
    if (!val) {
      console.warn('No date value provided. Falling back to current date.');
      return new Date();
    }
    const date = new Date(typeof val === 'string' || typeof val === 'number' ? Number(val) : '');
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${val}. Falling back to current date.`);
      return new Date();
    }
    return date;
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      location: '',
      isRecurring: false,
      recurrenceRule: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      location: Yup.string().required('Location is required'),
      isRecurring: Yup.boolean(),
      recurrenceRule: Yup.string().when('isRecurring', (isRecurring, schema) => {
        return isRecurring
          ? schema.required('Recurrence rule is required for recurring events')
          : schema;
      }),
    }).test(
      'end-after-start',
      'End time must be after start time',
      function () {
        if (!(startTime instanceof Date) || !(endTime instanceof Date) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          return false;
        }
        return endTime > startTime;
      }
    ),
    onSubmit: async (values, { resetForm }) => {
      if (!(startTime instanceof Date) || !(endTime instanceof Date) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        toast.error('Invalid date values provided.', {
          className: 'bg-red-500 text-white rounded-lg',
        });
        return;
      }

      if (endTime <= startTime) {
        toast.error('End time must be after start time.', {
          className: 'bg-red-500 text-white rounded-lg',
        });
        return;
      }

      const variables = {
        input: {
          ...values,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      };

      try {
        if (isEdit) {
          await updateEvent({ variables: { id: eventId, ...variables } });
          toast.success('Event updated!', {
            className: 'bg-green-500 text-white rounded-lg',
          });
        } else {
          await addEvent({ variables });
          toast.success('Event created!', {
            className: 'bg-green-500 text-white rounded-lg',
          });
        }
        resetForm();
        setStartTime(new Date());
        setEndTime(new Date(Date.now() + 60 * 60 * 1000));
        router.push('/')
      } catch (error: any) {
        toast.error(error.message || 'Something went wrong!', {
          className: 'bg-red-500 text-white rounded-lg',
        });
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (eventData?.event) {
      const ev = eventData.event;
      formik.setValues({
        title: ev.title || '',
        description: ev.description || '',
        location: ev.location || '',
        isRecurring: ev.isRecurring || false,
        recurrenceRule: ev.recurrenceRule || '',
      });

      const parsedStartTime = parseDate(ev.startTime);
      const parsedEndTime = parseDate(ev.endTime);
      setStartTime(parsedStartTime);
      setEndTime(parsedEndTime);
    }
  }, [eventData]);

  if (isEdit && eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-xl font-semibold">
        Loading event details...
      </div>
    );
  }

  if (isEdit && eventError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-semibold">
        Error loading event data: {eventError.message}
      </div>
    );
  }

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
      <div className="max-w-xl mx-auto bg-white bg-opacity-90 backdrop-blur-lg shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
          {isEdit ? 'Edit Event' : "Create Event"}
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="block mb-1 font-medium text-gray-800">Title</label>
            <input
              placeholder="Event Title"
              className="w-full p-3 bg-white bg-opacity-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-400"
              {...formik.getFieldProps('title')}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.title}</div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800">Description</label>
            <textarea
              placeholder="Event Description"
              className="w-full p-3 bg-white bg-opacity-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-400 min-h-[100px]"
              {...formik.getFieldProps('description')}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800">Location</label>
            <input
              placeholder="Event Location"
              className="w-full p-3 bg-white bg-opacity-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-400"
              {...formik.getFieldProps('location')}
            />
            {formik.touched.location && formik.errors.location && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.location}</div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800">Start Time</label>
            <div className="relative">
              <DatePicker
                selected={startTime instanceof Date && !isNaN(startTime.getTime()) ? startTime : new Date()}
                onChange={(date) => date && setStartTime(date)}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full"
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

          <div>
            <label className="block mb-1 font-medium text-gray-800">End Time</label>
            <div className="relative">
              <DatePicker
                selected={endTime instanceof Date && !isNaN(endTime.getTime()) ? endTime : new Date()}
                onChange={(date) => date && setEndTime(date)}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full"
                minDate={startTime instanceof Date && !isNaN(startTime.getTime()) ? startTime : new Date()}
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isRecurring"
                onChange={formik.handleChange}
                checked={formik.values.isRecurring}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="font-medium text-gray-800">Recurring Event?</label>
            </div>
            {formik.values.isRecurring && (
              <input
                placeholder="e.g., weekly"
                className="w-full p-3 bg-white bg-opacity-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-400"
                {...formik.getFieldProps('recurrenceRule')}
              />
            )}
            {formik.touched.recurrenceRule && formik.errors.recurrenceRule && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.recurrenceRule}</div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 transform hover:scale-105 cursor-pointer"
          >
            {isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>
    </main>
  );
}