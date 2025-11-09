import React, { useState } from 'react';
<<<<<<< HEAD
import { format, setHours, setMinutes, parse } from 'date-fns';

// --- Define EventModalProps ---
interface EventModalProps {
    event: { id: string; title: string; start: Date; end: Date; }; 
    onClose: () => void;
    isNew: boolean; 
    // Action now includes new start/end dates
    onAction: (action: 'update' | 'delete' | 'create', newTitle?: string, newStart?: Date, newEnd?: Date) => void;
=======
// FIX: Import format from date-fns
import { format } from 'date-fns';

// --- Define EventModalProps ---
interface EventModalProps {
    // Note: event now includes the 'end' date for better context
    event: { id: string; title: string; start: Date; end: Date; }; 
    onClose: () => void;
    // Flag to determine if we are creating (true) or editing (false)
    isNew: boolean; 
    // Action now includes 'create'
    onAction: (action: 'update' | 'delete' | 'create', newTitle?: string) => void;
>>>>>>> origin/calendar-sidebar
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, isNew, onAction }) => {
    
<<<<<<< HEAD
    const [currentTitle, setCurrentTitle] = useState(event.title);

    // State for time inputs
    const getFormattedTime = (date: Date) => format(date, 'HH:mm');
    const [currentStartTime, setCurrentStartTime] = useState(getFormattedTime(event.start));
    const [currentEndTime, setCurrentEndTime] = useState(getFormattedTime(event.end));
    
    // Format the date header (e.g., "Monday, November 9, 2025")
=======
    // State to manage the input field value
    const [currentTitle, setCurrentTitle] = useState(event.title);
    
    // Format the date for display (e.g., "Sunday, November 9, 2025 (10:00 AM - 11:00 AM)")
>>>>>>> origin/calendar-sidebar
    const formattedDate = event.start.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
<<<<<<< HEAD
    });
=======
    }) + " (" + format(event.start, 'h:mm a') + " - " + format(event.end, 'h:mm a') + ")";

>>>>>>> origin/calendar-sidebar

    // Helper to combine the base date with the time from the input string (HH:mm)
    const getCombinedDateTime = (baseDate: Date, timeString: string): Date => {
        const [hours, minutes] = timeString.split(':').map(Number);
        let newDate = setHours(baseDate, hours);
        newDate = setMinutes(newDate, minutes);
        return newDate;
    };


    const handleSave = () => {
        if (currentTitle.trim() === '') {
<<<<<<< HEAD
=======
            // Using console.error instead of alert()
>>>>>>> origin/calendar-sidebar
            console.error("Title cannot be empty."); 
            return;
        }
        
<<<<<<< HEAD
        // Calculate the final modified start and end dates
        const newStart = getCombinedDateTime(event.start, currentStartTime);
        const newEnd = getCombinedDateTime(event.end, currentEndTime);
        
        onAction(isNew ? 'create' : 'update', currentTitle, newStart, newEnd);
    };

    const handleDelete = () => {
=======
        // Determine the action based on the isNew flag
        onAction(isNew ? 'create' : 'update', currentTitle);
    };

    const handleDelete = () => {
        // Using window.confirm as a temporary solution until custom confirmation UI is built
>>>>>>> origin/calendar-sidebar
        if (window.confirm(`Are you sure you want to delete the event: "${event.title}"?`)) {
             onAction('delete');
        }
    };

    return (
        // Modal Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000]">
            {/* Modal Content */}
<<<<<<< HEAD
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {isNew ? 'Create New Event' : 'Edit Event'}
                </h3>
                <p className="text-sm text-gray-500 mb-4 border-b pb-3 font-medium">
                    {formattedDate}
                </p>

                <div className="space-y-4 mb-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                        <input 
                            id="event-title"
                            type="text"
                            value={currentTitle}
                            onChange={(e) => setCurrentTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="e.g., Physics Exam"
                        />
                    </div>
                    
                    {/* Time Inputs */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input 
                                id="start-time"
                                type="time"
                                value={currentStartTime}
                                onChange={(e) => setCurrentStartTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input 
                                id="end-time"
                                type="time"
                                value={currentEndTime}
                                onChange={(e) => setCurrentEndTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4">
=======
            <div style={styles.modalContent}>
                <h3 style={styles.header}>{isNew ? 'Create New Event' : 'Edit Event'}</h3>
                <p style={styles.dateText}>
                    {formattedDate}
                </p>

                <div style={styles.inputGroup}>
                    <label htmlFor="event-title" style={styles.label}>Title</label>
                    <input 
                        id="event-title"
                        type="text"
                        value={currentTitle}
                        onChange={(e) => setCurrentTitle(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <div style={styles.buttonContainer}>
>>>>>>> origin/calendar-sidebar
                    {/* Only show delete button for existing events */}
                    {!isNew && (
                         <button 
                            onClick={handleDelete}
<<<<<<< HEAD
                            className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition shadow-md"
=======
                            style={{ ...styles.button, ...styles.deleteButton }}
>>>>>>> origin/calendar-sidebar
                        >
                            Delete
                        </button>
                    )}
                   
<<<<<<< HEAD
                    
                    <span className="flex gap-3 ml-auto">
                        <button 
                            onClick={onClose}
                            className="text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                        >
                            Cancel
                        </button>

                        <button 
                            onClick={handleSave}
                            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition shadow-md"
                        >
                            {isNew ? 'Create Event' : 'Save Changes'}
                        </button>
                    </span>
=======
                    <button 
                        onClick={onClose}
                        style={{ ...styles.button, ...styles.cancelButton }}
                    >
                        Cancel
                    </button>

                    <button 
                        onClick={handleSave}
                        style={{ ...styles.button, ...styles.saveButton }}
                    >
                        {isNew ? 'Create' : 'Save'}
                    </button>
>>>>>>> origin/calendar-sidebar
                </div>
            </div>
        </div>
    );
};

<<<<<<< HEAD
=======
// Basic inline styles (replace these with your global CSS or utility classes)
const styles: { [key: string]: React.CSSProperties } = {
    backdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 1000 
    },
    modalContent: {
        backgroundColor: '#fff', padding: '30px', borderRadius: '12px', 
        width: '90%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    header: {
        fontSize: '1.5rem', marginBottom: '10px', color: '#333'
    },
    dateText: {
        color: '#666', fontSize: '0.9rem', marginBottom: '20px'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block', marginBottom: '5px', fontWeight: 'bold'
    },
    input: {
        width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc',
        boxSizing: 'border-box'
    },
    buttonContainer: {
        display: 'flex', justifyContent: 'flex-end', gap: '10px'
    },
    button: {
        padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', border: 'none',
        fontWeight: 'bold'
    },
    deleteButton: {
        backgroundColor: '#dc3545', color: 'white', marginRight: 'auto'
    },
    cancelButton: {
        backgroundColor: '#e9ecef', color: '#333'
    },
    saveButton: {
        backgroundColor: '#007bff', color: 'white'
    }
};

>>>>>>> origin/calendar-sidebar
export default EventModal;