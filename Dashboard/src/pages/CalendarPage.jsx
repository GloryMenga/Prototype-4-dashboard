import React, { useState, useEffect } from "react";
import SideNav from "../components/SideNav.jsx";
import Calendar from "../components/Calendar.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFileLines, faClock } from "@fortawesome/free-solid-svg-icons";

function CalendarPage() {
    const [assignments, setAssignments] = useState([]);
    const [currentAssignment, setCurrentAssignment] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");

    // Fetch all assignments
    useEffect(() => {
        fetch("http://localhost:5000/assignments")
            .then((res) => res.json())
            .then((data) => setAssignments(data));
    }, []);

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

    // Convert assignments to calendar events
    const events = assignments.map((assignment) => ({
        title: assignment.name,
        start: assignment.deadline, // Ensure deadline is in ISO format
        description: assignment.description,
    }));

    const handleEventClick = (eventDetails) => {
        setName(eventDetails.name);
        setDeadline(eventDetails.deadline); // Deadline in the correct format for datetime-local
        setDescription(eventDetails.description);
        setCurrentAssignment(eventDetails);
    };

    return (
        <div className="container">
            <SideNav />
            <div className="calendar-container">
                <Calendar events={events} onEventClick={handleEventClick} />
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
            </div>
        </div>
    );
}

export default CalendarPage;
