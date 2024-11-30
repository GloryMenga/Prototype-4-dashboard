import React from "react";
import FullCalendar from "@fullcalendar/react"; 
import dayGridPlugin from "@fullcalendar/daygrid"; 
import timeGridPlugin from "@fullcalendar/timegrid"; 
import interactionPlugin from "@fullcalendar/interaction"; 
import SideNav from "../components/SideNav.jsx";

function Calendar() {
    return (
        <div className="container">
            <SideNav />
            <div className="calendar-container">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev today next",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    editable={false}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true} 
                    height="auto" 
                />
            </div>
        </div>
    );
}

export default Calendar;
