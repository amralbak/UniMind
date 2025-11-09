import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, Event, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from "date-fns"; 
import { enUS } from "date-fns/locale"; 

import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
    DocumentData,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useAuth0 } from "@auth0/auth0-react"; 
// NOTE: EventModal is no longer needed in this version, as we use prompt()
// We'll keep the import in case you restore the modal later.
import EventModal from "../components/EventModal"; 

// --- LOCALIZER SETUP ---
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
// -----------------------

// --- Define Custom Event Type ---
interface MyEvent extends Event {
    id: string; 
    title: string;
    start: Date;
    end: Date;
    isNew?: boolean; 
}

// --- CUSTOM TOOLBAR (Kept to fix broken navigation buttons) ---
const CustomToolbar = (props: any) => {
    
    const { setCurrentDate, setCurrentView, currentDate, currentView } = props;

    const navigate = (action: 'NEXT' | 'PREV' | 'TODAY') => {
        let newDate = currentDate;
        if (action === 'TODAY') {
            newDate = new Date();
        } else if (action === 'NEXT') {
            newDate = addMonths(currentDate, 1);
        } else if (action === 'PREV') {
            newDate = subMonths(currentDate, 1);
        }
        setCurrentDate(newDate);
    };
    
    const viewChange = (view: View) => {
        setCurrentView(view);
    };
    
    const toolbarLabel = format(props.date, 'MMMM yyyy');

    return (
        <div className="rbc-toolbar mb-4 flex justify-between items-center border-b pb-2">
            
            {/* Left side: Date Navigation */}
            <span className="rbc-btn-group flex gap-2">
                <button 
                    type="button" 
                    className="px-3 py-1 border rounded-md hover:bg-gray-100"
                    onClick={() => navigate('TODAY')}
                >
                    Today
                </button>
                <button 
                    type="button" 
                    className="px-3 py-1 border rounded-md hover:bg-gray-100"
                    onClick={() => navigate('PREV')}
                >
                    Back
                </button>
                <button 
                    type="button" 
                    className="px-3 py-1 border rounded-md hover:bg-gray-100"
                    onClick={() => navigate('NEXT')}
                >
                    Next
                </button>
            </span>

            {/* Center: Current Date Label */}
            <span className="rbc-toolbar-label font-semibold text-lg">
                {toolbarLabel}
            </span>

            {/* Right side: View Toggle */}
            <span className="rbc-btn-group flex gap-1">
                {
                    ['month', 'week', 'day'].map((view: string) => (
                        <button
                            key={view}
                            type="button"
                            className={`px-3 py-1 border rounded-md text-sm transition ${
                                currentView === view ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-100'
                            }`}
                            onClick={() => viewChange(view as View)}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                    ))
                }
            </span>
        </div>
    );
};


const CalendarPage: React.FC = () => {
    const { user } = useAuth0();
    const db = getFirestore(app);
    const userId = user?.sub ?? "demo_user";

    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [currentView, setCurrentView] = useState<View>(Views.MONTH); 

    const [events, setEvents] = useState<MyEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null); // Kept for consistency

    // --- Data Loading (omitted for brevity) ---
    const loadEvents = async () => { 
        const q = query(
            collection(db, "events"),
            where("user_id", "==", userId),
            orderBy("start", "asc")
        );
        
        const snapshot = await getDocs(q);

        const loadedEvents: MyEvent[] = snapshot.docs.map(doc => {
            const data = doc.data() as DocumentData; 

            const getValidDate = (value: any): Date => {
                if (value && typeof value.toDate === 'function') {
                    return value.toDate();
                }
                return new Date(value);
            };

            return {
                id: doc.id,
                title: data.title,
                start: getValidDate(data.start),
                end: getValidDate(data.end),
            } as MyEvent; 
        });

        setEvents(loadedEvents);
    };

    useEffect(() => { loadEvents(); }, [userId]);

    // --- SLOT HANDLER (SIMPLE NEW EVENT CREATION) ---
    const handleSelectSlot = async ({ start, end }: { start: Date, end: Date }) => {
        // Simple prompt logic restored
        const title = prompt("Enter a title for the new event:"); 
        
        if (!title) return;
        
        const dateFormat = "yyyy-MM-dd'T'HH:mm:ss";
        const startLocalString = format(start, dateFormat);
        const endLocalString = format(end, dateFormat);
        
        await addDoc(collection(db, "events"), {
            user_id: userId,
            title,
            notes: "",
            allDay: false,
            start: startLocalString,
            end: endLocalString,
            created_at: new Date().toISOString()
        });
        loadEvents();
    };


    // --- EVENT CLICK HANDLER (SIMPLE EDIT/DELETE RESTORED) ---
    const handleSelectEvent = async (event: MyEvent) => {
        // Simple prompt logic restored
        const choice = prompt(`Edit name or type DELETE to remove:`, event.title);
        if (!choice) return;

        const eventRef = doc(db, "events", event.id); 

        if (choice.toUpperCase() === "DELETE") {
            await deleteDoc(eventRef);
        } else {
            await updateDoc(eventRef, { title: choice });
        }

        loadEvents();
    };
    
    // Helper to close the modal (kept for completeness, though modal is unused)
    const handleCloseModal = () => {
        setSelectedEvent(null);
    };
    
    // --- NAVIGATION HANDLERS ---
    const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate); 
    };
    
    const handleViewChange = (newView: View) => {
        setCurrentView(newView);
    };


    return (
        <div className="p-8">
            <h2 className="text-3xl font-semibold text-sage-800 mb-6">Calendar</h2>

            <div className="bg-white p-4 rounded-xl border border-sage-200 shadow-sm">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    // The standard handler is simple again
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    
                    // --- CONTROLLED NAVIGATION & VIEW ---
                    date={currentDate} 
                    onNavigate={handleNavigate}
                    view={currentView}
                    onView={handleViewChange}
                    
                    // Force re-render for stability
                    key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}-${currentView}`}

                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    style={{ height: 600 }}
                    
                    components={{
                        // Custom Toolbar guarantees navigation buttons work
                        toolbar: (props) => (
                            <CustomToolbar
                                currentDate={currentDate}
                                setCurrentDate={setCurrentDate}
                                currentView={currentView}
                                setCurrentView={setCurrentView}
                                {...props} 
                            />
                        ),
                        // Removed CustomEvent override
                    }}
                />
            </div>
            
            {/* Removed custom modal rendering */}
        </div>
    );
};

export default CalendarPage;