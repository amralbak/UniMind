import React, { useState } from 'react';
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
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, isNew, onAction }) => {
    
    // State to manage the input field value
    const [currentTitle, setCurrentTitle] = useState(event.title);
    
    // Format the date for display (e.g., "Sunday, November 9, 2025 (10:00 AM - 11:00 AM)")
    const formattedDate = event.start.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) + " (" + format(event.start, 'h:mm a') + " - " + format(event.end, 'h:mm a') + ")";


    const handleSave = () => {
        if (currentTitle.trim() === '') {
            // Using console.error instead of alert()
            console.error("Title cannot be empty."); 
            return;
        }
        
        // Determine the action based on the isNew flag
        onAction(isNew ? 'create' : 'update', currentTitle);
    };

    const handleDelete = () => {
        // Using window.confirm as a temporary solution until custom confirmation UI is built
        if (window.confirm(`Are you sure you want to delete the event: "${event.title}"?`)) {
             onAction('delete');
        }
    };

    return (
        // Modal Backdrop
        <div style={styles.backdrop}>
            {/* Modal Content */}
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
                    {/* Only show delete button for existing events */}
                    {!isNew && (
                         <button 
                            onClick={handleDelete}
                            style={{ ...styles.button, ...styles.deleteButton }}
                        >
                            Delete
                        </button>
                    )}
                   
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
                </div>
            </div>
        </div>
    );
};

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

export default EventModal;