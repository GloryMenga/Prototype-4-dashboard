import React, { useState, useEffect, useContext } from "react";
import SideNav from "../components/SideNav.jsx";
import Calendar from "../components/Calendar.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileLines, faClock } from "@fortawesome/free-solid-svg-icons";

function CalendarPage() {
    const { user } = useContext(AuthContext); 
    const [assignments, setAssignments] = useState([]);
    const [currentAssignment, setCurrentAssignment] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");

    const [eventDetails, setEventDetails] = useState(null); 

    useEffect(() => {
        if (user) {
            fetch("http://localhost:5000/assignments")
                .then((res) => res.json())
                .then((data) => setAssignments(data));
        }
    }, [user]);

    const handleAddAssignment = () => {
        fetch("http://localhost:5000/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, deadline }),
        })
            .then((res) => res.json())
            .then((data) => {
                setAssignments([data.assignment, ...assignments]);
                setName("");
                setDescription("");
                setDeadline("");
            });
    };

    const handleSelectAssignment = (assignment) => {
        setCurrentAssignment(assignment);
        setName(assignment.name);
        setDescription(assignment.description);
        setDeadline(assignment.deadline);
    };

    const handleUpdateAssignment = () => {
        fetch(`http://localhost:5000/assignments/${currentAssignment._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, deadline }),
        })
            .then((res) => res.json())
            .then(() => {
                setAssignments(assignments.map((a) => (a._id === currentAssignment._id ? { ...a, name, description, deadline } : a)));
                setCurrentAssignment(null);
                setName("");
                setDescription("");
                setDeadline("");
            });
    };

    const handleDeleteAssignment = () => {
        fetch(`http://localhost:5000/assignments/${currentAssignment._id}`, {
            method: "DELETE",
        }).then(() => {
            setAssignments(assignments.filter((a) => a._id !== currentAssignment._id));
            setCurrentAssignment(null);
            setName("");
            setDescription("");
            setDeadline("");
        });
    };

    const handleCancel = () => {
        setCurrentAssignment(null);
        setName("");
        setDescription("");
        setDeadline("");
    };

    const events = user
        ? assignments.map((assignment) => ({
              title: assignment.name,
              start: assignment.deadline,
              description: assignment.description,
          }))
        : []; // No events for non-logged-in users

    const handleEventClick = (eventDetails) => {
        if (user && user.status === "Teacher") {
            setName(eventDetails.name);
            setDeadline(eventDetails.deadline);
            setDescription(eventDetails.description);
            setCurrentAssignment(eventDetails);
        } else if (user && user.status === "Student") {
            setEventDetails(eventDetails);
        }
    };

    return (
        <div className="container">
            <SideNav />
            <div className="calendar-container">
                <Calendar events={events} onEventClick={handleEventClick} />
                {user ? (
                    user.status === "Teacher" ? (
                        <div className="assignments">
                            <div className="all-assignments">
                                <h2>All assignments</h2>
                                <div className="list-assignments">
                                    {assignments && assignments.length > 0 ? (
                                        assignments.map((assignment) => (
                                            <p key={assignment._id} onClick={() => handleSelectAssignment(assignment)}>
                                                {assignment.name}
                                            </p>
                                        ))
                                    ) : (
                                        <p>No assignments available.</p>
                                    )}
                                </div>
                            </div>
                            <div className="add-assignments">
                                <h2>{currentAssignment ? "Edit Assignment" : "Add Assignment"}</h2>
                                <div className="form-assignment">
                                    <div className="input-assignments">
                                        <FontAwesomeIcon icon={faUser} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter assignment name"
                                            disabled={!!currentAssignment}
                                        />
                                    </div>
                                    <div className="input-assignments">
                                        <FontAwesomeIcon icon={faFileLines} />
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter description"
                                        />
                                    </div>
                                    <div className="input-assignments">
                                        <FontAwesomeIcon icon={faClock} />
                                        <input
                                            type="datetime-local"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                    {currentAssignment ? (
                                        <>
                                            <button onClick={handleUpdateAssignment}>Update</button>
                                            <button onClick={handleDeleteAssignment}>Delete</button>
                                            <button onClick={handleCancel}>Cancel</button>
                                        </>
                                    ) : (
                                        <button onClick={handleAddAssignment}>Add Assignment</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : eventDetails ? (
                        <div className="event-details">
                            <h2>Assignment Details</h2>
                            <p>
                                <strong>Name:</strong> {eventDetails.name}
                            </p>
                            <p>
                                <strong>Description:</strong> {eventDetails.description}
                            </p>
                            <p>
                                <strong>Deadline:</strong>{" "}
                                {new Date(eventDetails.deadline).toLocaleString("en-GB")}
                            </p>
                        </div>
                    ) : null
                ) : null}
            </div>
        </div>
    );
}

export default CalendarPage;
