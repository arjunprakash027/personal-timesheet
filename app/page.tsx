'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { ITimesheetEntry } from '@/models/TimesheetEntry';

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const initialFormData: Partial<ITimesheetEntry> = {
  date: new Date().toISOString().split('T')[0],
  taskActivity: '',
  categoryProject: '',
  focus: undefined,
  energy: undefined,
  outcomeResult: '',
  learningsReflections: '',
  productivity: undefined,
  enjoyment: undefined,
  challenge: undefined,
  comments: '',
};

export default function HomePage() {
  const [entries, setEntries] = useState<ITimesheetEntry[]>([]);
  const [formData, setFormData] = useState<Partial<ITimesheetEntry>>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  });

  // Fetch entries...
  const fetchEntries = async (month: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/timesheet?month=${month}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const formattedEntries = data.data.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }));
        setEntries(formattedEntries);
      } else {
        throw new Error(data.error || 'Failed to fetch entries');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(selectedMonth);
  }, [selectedMonth]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleMonthChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!formData.date || !formData.taskActivity) {
      setFormError('Date and Task/Activity are required.');
      setIsSubmitting(false);
      return;
    }

    const submissionData = {
      ...formData,
      date: formData.date ? new Date(formData.date).toISOString() : undefined,
    };

    try {
      const response = await fetch('/api/timesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }
      setFormData(initialFormData);
      fetchEntries(selectedMonth);
    } catch (err: any) {
      setFormError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:py-10">
      <h1 className="neon-heading text-center mb-8">Personal Timesheet</h1>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 p-4 text-center rounded shadow">
          {error}
        </div>
      )}

      {/* Month Selector */}
      <div className="mb-6 synth-card flex flex-col sm:flex-row items-center justify-between">
        <label htmlFor="month-select" className="text-sm font-medium text-gray-200 mb-2 sm:mb-0">
          Select Month:
        </label>
        <input
          type="month"
          id="month-select"
          name="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="input-synth w-full sm:w-auto"
        />
      </div>

      {/* Add New Entry Form */}
      <div className="mb-8 synth-card">
        <h2 className="mb-4 text-xl font-semibold text-[#ff77e9]">Add New Entry</h2>
        {formError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 p-3 text-sm rounded shadow">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-200">
                Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={
                  formData.date instanceof Date
                    ? formData.date.toISOString().split('T')[0]
                    : formData.date || ''
                }
                onChange={handleInputChange}
                required
                className="input-synth"
              />
            </div>

            {/* Task/Activity */}
            <div className="md:col-span-2">
              <label htmlFor="taskActivity" className="block text-sm font-medium text-gray-200">
                Task/Activity*
              </label>
              <input
                type="text"
                id="taskActivity"
                name="taskActivity"
                value={formData.taskActivity || ''}
                onChange={handleInputChange}
                required
                className="input-synth"
              />
            </div>

            {/* Category/Project */}
            <div>
              <label htmlFor="categoryProject" className="block text-sm font-medium text-gray-200">
                Category/Project
              </label>
              <input
                type="text"
                id="categoryProject"
                name="categoryProject"
                value={formData.categoryProject || ''}
                onChange={handleInputChange}
                className="input-synth"
              />
            </div>

            {/* Focus */}
            <div>
              <label htmlFor="focus" className="block text-sm font-medium text-gray-200">
                Focus (1-5)
              </label>
              <input
                type="number"
                id="focus"
                name="focus"
                value={formData.focus ?? ''}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
                className="input-synth"
              />
            </div>

            {/* Energy */}
            <div>
              <label htmlFor="energy" className="block text-sm font-medium text-gray-200">
                Energy (1-5)
              </label>
              <input
                type="number"
                id="energy"
                name="energy"
                value={formData.energy ?? ''}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
                className="input-synth"
              />
            </div>

            {/* Productivity */}
            <div>
              <label htmlFor="productivity" className="block text-sm font-medium text-gray-200">
                Productivity (1-5)
              </label>
              <input
                type="number"
                id="productivity"
                name="productivity"
                value={formData.productivity ?? ''}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
                className="input-synth"
              />
            </div>

            {/* Enjoyment */}
            <div>
              <label htmlFor="enjoyment" className="block text-sm font-medium text-gray-200">
                Enjoyment (1-5)
              </label>
              <input
                type="number"
                id="enjoyment"
                name="enjoyment"
                value={formData.enjoyment ?? ''}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
                className="input-synth"
              />
            </div>

            {/* Challenge */}
            <div>
              <label htmlFor="challenge" className="block text-sm font-medium text-gray-200">
                Challenge (1-5)
              </label>
              <input
                type="number"
                id="challenge"
                name="challenge"
                value={formData.challenge ?? ''}
                onChange={handleInputChange}
                min="1"
                max="5"
                step="1"
                className="input-synth"
              />
            </div>

            {/* Outcome/Result */}
            <div>
              <label htmlFor="outcomeResult" className="block text-sm font-medium text-gray-200">
                Outcome/Result
              </label>
              <textarea
                id="outcomeResult"
                name="outcomeResult"
                rows={2}
                value={formData.outcomeResult || ''}
                onChange={handleInputChange}
                className="input-synth"
              />
            </div>

            {/* Learnings/Reflections */}
            <div>
              <label htmlFor="learningsReflections" className="block text-sm font-medium text-gray-200">
                Learnings/Reflections
              </label>
              <textarea
                id="learningsReflections"
                name="learningsReflections"
                rows={2}
                value={formData.learningsReflections || ''}
                onChange={handleInputChange}
                className="input-synth"
              />
            </div>

            {/* Comments */}
            <div className="md:col-span-2 lg:col-span-1">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-200">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                rows={2}
                value={formData.comments || ''}
                onChange={handleInputChange}
                className="input-synth"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-neon"
            >
              {isSubmitting ? 'Saving...' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Timesheet Entries Table */}
      <div className="overflow-x-auto synth-card">
        <h2 className="border-b border-[#ff77e9] pb-2 mb-2 text-xl font-semibold text-[#ff77e9]">
          Entries for {selectedMonth}
        </h2>
        {isLoading ? (
          <p className="p-4 text-center text-gray-300">Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="p-4 text-center text-gray-300">No entries found for this month.</p>
        ) : (
          <table className="table-synth min-w-full">
            <thead>
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Task/Activity</th>
                <th className="px-3 py-3">Category/Project</th>
                <th className="px-1 py-3" title="Focus">
                  Foc
                </th>
                <th className="px-1 py-3" title="Energy">
                  Enr
                </th>
                <th className="px-1 py-3" title="Productivity">
                  Prod
                </th>
                <th className="px-1 py-3" title="Enjoyment">
                  Enj
                </th>
                <th className="px-1 py-3" title="Challenge">
                  Chal
                </th>
                <th className="px-3 py-3">Outcome/Result</th>
                <th className="px-3 py-3">Learnings/Reflections</th>
                <th className="px-3 py-3">Comments</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id?.toString()}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2 text-sm">{entry.taskActivity}</td>
                  <td className="px-3 py-2 text-sm">
                    {entry.categoryProject || '-'}
                  </td>
                  <td className="px-1 py-2 text-center text-sm">{entry.focus ?? '-'}</td>
                  <td className="px-1 py-2 text-center text-sm">{entry.energy ?? '-'}</td>
                  <td className="px-1 py-2 text-center text-sm">{entry.productivity ?? '-'}</td>
                  <td className="px-1 py-2 text-center text-sm">{entry.enjoyment ?? '-'}</td>
                  <td className="px-1 py-2 text-center text-sm">{entry.challenge ?? '-'}</td>
                  <td className="px-3 py-2 text-sm max-w-xs truncate" title={entry.outcomeResult}>
                    {entry.outcomeResult || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-sm max-w-xs truncate"
                    title={entry.learningsReflections}
                  >
                    {entry.learningsReflections || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm max-w-xs truncate" title={entry.comments}>
                    {entry.comments || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
