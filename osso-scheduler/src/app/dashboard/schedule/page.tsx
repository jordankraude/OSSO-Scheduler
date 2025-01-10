'use client';
import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { startOfWeek, addWeeks, addDays, format } from 'date-fns';

interface Volunteer {
  id: string;
  name: string;
}

interface Shift {
  date: Date; // Use Date object instead of string ID
  city: string;
  orphanage: string;
  times: string[];
  day: string; // Still keep the day for convenience, but it's derived from the date.
  volunteers: string[]; // Add volunteers assigned to this shift
}

const volunteers: Volunteer[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Sam Wilson' },
];

const currentWeekStart = startOfWeek(new Date()); // Adjust for the desired week start
const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

export default function Scheduler() {
  const [shiftsData, setShiftsData] = useState<Shift[]>([]); // State for fetched shifts
  const [selectedCity, setSelectedCity] = useState<string>('Cuenca');
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [weekOffset, setWeekOffset] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/schedule');
        const data = await response.json();
        console.log(data[1].shifts[0]);
  
        console.log('Raw Data:', data);
  
        // No normalization for the week times in the database
        const normalizedData = data.map((week: any) => ({
          ...week,
          // Add 7 hours to the startDate and endDate to adjust for time zone
          startDate: new Date(new Date(week.startDate).getTime() + 7 * 60 * 60 * 1000), // Add 7 hours
          endDate: new Date(new Date(week.endDate).getTime() + 7 * 60 * 60 * 1000),     // Add 7 hours
          shifts: week.shifts.map((shift: any) => ({
            ...shift,
            date: new Date(new Date(shift.date).getTime() + 7 * 60 * 60 * 1000), // Add 7 hours to shift date
            volunteers: shift.volunteers.map((v: any) => ({
              id: v.volunteer.id,
              name: `${v.volunteer.firstname} ${v.volunteer.lastname}`,
            })),
          })),
        }));
        console.log('Volunteers Data:', data[1].shifts[0].volunteers);
        console.log('Normalized Data:', normalizedData);
        console.log('Normalized Data:', normalizedData[1].shifts);
  
        // Find the current week using the weekOffset
        const currentWeekStart = addWeeks(startOfWeek(new Date()), weekOffset);
  
        // Adjust the current week's startDate to midnight UTC and add 7 hours to it
        const currentWeekStartUTC = new Date(
          Date.UTC(
            currentWeekStart.getUTCFullYear(),
            currentWeekStart.getUTCMonth(),
            currentWeekStart.getUTCDate(),
            0, 0, 0, 0
          )
        );
        
        // Add 7 hours to currentWeekStartUTC to account for the time zone shift
        const currentWeekStartAdjusted = new Date(currentWeekStartUTC.getTime() + 7 * 60 * 60 * 1000);
  
        console.log('Adjusted Current Week Start (UTC + 7 hours):', currentWeekStartAdjusted);
  
        // Find the current week's data from the normalized data
        const currentWeekData = normalizedData.find((week: any) => {
          console.log('Database Week Start Date (Adjusted):', week.startDate);
          return week.startDate.getTime() === currentWeekStartAdjusted.getTime();
        });
  
        // If no data exists for the current week, set shiftsData to an empty array
        if (!currentWeekData || currentWeekData.shifts.length === 0) {
          console.warn('No shifts found for the current week.');
          setShiftsData([]);
        } else {
          setShiftsData(currentWeekData.shifts);
        }
      } catch (error) {
        console.error('Error fetching shifts data:', error);
      }
    };
  
    fetchData();
  }, [weekOffset]);
  
  

  const currentWeekStart = addWeeks(startOfWeek(new Date()), weekOffset);

  const getCurrentWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const weekDays = getCurrentWeekDays();

  const handleDragEnd = (event: any) => {
    const { over, active } = event;
  
    if (!over) return; // If not dropped on a valid target, do nothing.
  
    const volunteerId = active.id; // The ID of the volunteer being dragged.
    const shiftDate = over.id; // The timestamp of the shift being dropped onto.
  
    // Create a copy of the assignments object to avoid direct mutation
    const newAssignments = { ...assignments };
  
    // Initialize the assignments for the shift if it doesn't exist
    if (!newAssignments[shiftDate]) {
      newAssignments[shiftDate] = [];
    }
  
    // Add the new volunteer to the shift (ensure no duplicates)
    if (!newAssignments[shiftDate].includes(volunteerId)) {
      newAssignments[shiftDate].push(volunteerId);
    }
  
    // Update the state with the new assignments
    setAssignments(newAssignments);
  };

  const handleRemoveVolunteer = (shiftDate: number, volunteerId: string) => {
    const newAssignments = { ...assignments };

    // Remove the volunteer from the specified shift (identified by shiftDate).
    newAssignments[shiftDate] = newAssignments[shiftDate].filter((id) => id !== volunteerId);

    setAssignments(newAssignments);
  };

  const handlePostSchedule = () => {
    // Prepare the shifts data with assigned volunteers to post to the database
    const updatedShifts = shiftsData.map((shift) => {
      const assignedVolunteers = assignments[shift.date.getTime()] || [];
      return {
        ...shift,
        volunteers: assignedVolunteers, // Include assigned volunteers
      };
    });

    console.log('Posting the schedule:', updatedShifts);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="p-8 text-black">
        {/* City Selector */}
        <div className="mb-4">
          <button
            onClick={() => setSelectedCity('Cuenca')}
            className={`px-4 py-2 rounded-lg mr-4 ${selectedCity === 'Cuenca' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Cuenca
          </button>
          <button
            onClick={() => setSelectedCity('Quito')}
            className={`px-4 py-2 rounded-lg ${selectedCity === 'Quito' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Quito
          </button>
        </div>

        {/* Week Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="px-4 py-2 rounded-lg bg-gray-300"
          >
            Previous Week
          </button>
          <p className="text-lg font-bold">
            {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
          </p>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white"
          >
            Next Week
          </button>
        </div>

        {/* Post Schedule Button */}
        <div className="mb-4">
          <button
            onClick={handlePostSchedule}
            className="px-4 py-2 rounded-lg bg-green-500 text-white"
          >
            Post Schedule
          </button>
        </div>

        {/* Weekly Shifts Grid */}
        <div className="grid grid-cols-7">
          {weekDays.map((date) => {
            const dayName = format(date, 'EEEE'); // Get the name of the day
            const dateString = format(date, 'yyyy-MM-dd'); // Get the specific date string for the key

            return (
              <div key={dateString} className="border p-4 rounded-lg bg-gray-50">
                <h3 className="text-center font-semibold">{dayName}</h3>
                <div className="mt-2">
                  {shiftsData
                    .filter((shift) => shift.city === selectedCity && format(shift.date, 'yyyy-MM-dd') === dateString) // Filter shifts by city and exact date
                    .map((shift) => (
                      <Droppable
                        key={shift.date.getTime()} // Using timestamp as key
                        id={shift.date.getTime()} // Use timestamp as the id for the droppable
                      >
                        <div className="border rounded-md my-2 p-2 bg-white w-full h-full">
                          <h4 className="font-semibold">{shift.orphanage}</h4>
                          <p>{shift.times.join(', ')}</p>
                          {assignments[shift.date.getTime()]?.map((volunteerId) => {
                            const volunteer = volunteers.find((v) => v.id === volunteerId);
                            if (!volunteer) {
                              console.log('Volunteer not found for ID:', volunteerId);
                            }
                            return volunteer ? (
                              <div
                                key={`${volunteer.id}`} // Use volunteer id as key
                                className="p-2 bg-blue-200 rounded-md mt-2 flex justify-between"
                              >
                                <span>{volunteer.name}</span>
                                <button
                                  onClick={() => handleRemoveVolunteer(shift.date.getTime(), volunteer.id)}
                                  className="bg-red-500 text-white rounded-full p-1"
                                >
                                  X
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </Droppable>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Draggable Volunteers */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Available Volunteers</h2>
          <div className="flex gap-4">
            {volunteers.map((volunteer) => {
              return (
                <Draggable key={volunteer.id} id={volunteer.id}>
                  <div className="p-2 bg-gray-300 rounded-md cursor-pointer">
                    {volunteer.name}
                  </div>
                </Draggable>
              );
            })}
          </div>
        </div>
      </div>
    </DndContext>
  );
}


// Draggable Component
function Draggable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab bg-blue-100 p-2 rounded-md border border-blue-300 shadow-sm"
    >
      {children}
    </div>
  );
}

// Droppable Component
// Droppable Component
function Droppable({ id, children }: { id: number; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="w-full rounded-lg bg-gray-50">
      {children}
    </div>
  );
}

