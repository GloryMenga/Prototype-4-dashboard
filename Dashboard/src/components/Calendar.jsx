import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/core/locales/en-gb";

function Calendar({ events, onEventClick }) {
    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: "prev today next",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
            }}
            locale="en-gb"
            editable={false}
            selectable={true}
            dayMaxEvents={true}
            height="auto"
            events={events}
            eventClick={(info) => {
                const eventDetails = {
                    name: info.event.title,
                    description: info.event.extendedProps.description || "",
                    deadline: info.event.start.toISOString().slice(0, 16), // Format for datetime-local input
                };
                onEventClick(eventDetails);
            }}
        />
    );
}

export default Calendar;
