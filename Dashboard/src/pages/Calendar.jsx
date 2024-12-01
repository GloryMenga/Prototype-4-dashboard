import React from "react";
import FullCalendar from "@fullcalendar/react"; // Main FullCalendar component
import dayGridPlugin from "@fullcalendar/daygrid"; // For Month View
import timeGridPlugin from "@fullcalendar/timegrid"; // For Week View
import interactionPlugin from "@fullcalendar/interaction"; // For interactivity
import SideNav from "../components/SideNav.jsx";
import "@fullcalendar/core/locales/en-gb"; // Import European locale for date format

function Calendar() {
    return (
        <div className="container">
            <SideNav />
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth" // Default to Month View
                    headerToolbar={{
                        left: "prev today next", // Navigation buttons
                        center: "title", // Calendar title
                        right: "dayGridMonth,timeGridWeek", // Show only Month and Week views
                    }}
                    locale="en-gb" // Use European date format (day-month-year)
                    editable={false} // Prevent dragging of events
                    selectable={true} // Enable date selection
                    dayMaxEvents={true} // Limit visible events per day
                    height="auto" // Automatically adjust height
                />
            </div>
        </div>
    );
}

export default Calendar;
