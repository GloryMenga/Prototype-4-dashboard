import React, { useState, useEffect, useContext } from "react"; // Added useContext
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faUser, faClock, faStar } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";

function Grading() {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);

    const [customAssignmentName, setCustomAssignmentName] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [deadline, setDeadline] = useState("");
    const [grade, setGrade] = useState("");
    const [currentGrade, setCurrentGrade] = useState(null);

    const { user } = useContext(AuthContext); // Added useContext here

    // Prevent access if not a teacher
    if (!user || user.status !== "Teacher") {
        return null; // Don't render anything for non-teachers
    }

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Subjects
                const subjectsResponse = await fetch("http://localhost:5000/subjects");
                if (!subjectsResponse.ok) throw new Error("Failed to fetch subjects");
                const studentsResponse = await fetch("http://localhost:5000/students");
                if (!studentsResponse.ok) throw new Error("Failed to fetch students");
                const gradesResponse = await fetch("http://localhost:5000/grades");
                if (!gradesResponse.ok) throw new Error("Failed to fetch grades");

                const subjectsData = await subjectsResponse.json();
                const studentsData = await studentsResponse.json();
                const gradesData = await gradesResponse.json();

                setSubjects(subjectsData.map((subject) => subject.name));
                setStudents(studentsData.map((student) => student.name));
                setGrades(gradesData);
            } catch (error) {
                console.error("Error fetching data:", error.message);
                alert(`Error: ${error.message}`);
            }
        };

        fetchData();
    }, []);

    // Add a new grade
    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentName: customAssignmentName,
                    studentName: selectedStudent,
                    subjectName: selectedSubject,
                    date: deadline,
                    grade: parseFloat(grade),
                }),
            });

            if (!response.ok) throw new Error("Failed to submit grade");

            const responseData = await response.json();
            setGrades((prevGrades) => [responseData.data, ...prevGrades]);

            alert("Grade submitted successfully!");
            resetForm();
        } catch (error) {
            console.error("Error submitting grade:", error.message);
            alert(`Failed to submit grade: ${error.message}`);
        }
    };

    const handleSelectGrade = (grade) => {
        setCurrentGrade(grade);
        setCustomAssignmentName(grade.assignmentName);
        setSelectedSubject(grade.subjectName);
        setSelectedStudent(grade.studentName);
        setDeadline(new Date(grade.date).toISOString().slice(0, 16));
        setGrade(grade.grade);
    };

    const handleUpdateGrade = async () => {
        if (!currentGrade) return;

        try {
            const response = await fetch(`http://localhost:5000/grades/${currentGrade._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentName: customAssignmentName,
                    studentName: selectedStudent,
                    subjectName: selectedSubject,
                    date: deadline,
                    grade: parseFloat(grade),
                }),
            });

            if (!response.ok) throw new Error("Failed to update grade");

            setGrades((prevGrades) =>
                prevGrades.map((g) =>
                    g._id === currentGrade._id
                        ? { ...g, assignmentName: customAssignmentName, studentName: selectedStudent, subjectName: selectedSubject, date: deadline, grade }
                        : g
                )
            );

            alert("Grade updated successfully!");
            resetForm();
        } catch (error) {
            console.error("Error updating grade:", error.message);
            alert(`Failed to update grade: ${error.message}`);
        }
    };

    const handleDeleteGrade = async () => {
        if (!currentGrade) return;

        try {
            const response = await fetch(`http://localhost:5000/grades/${currentGrade._id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete grade");

            setGrades((prevGrades) => prevGrades.filter((g) => g._id !== currentGrade._id));

            alert("Grade deleted successfully!");
            resetForm();
        } catch (error) {
            console.error("Error deleting grade:", error.message);
            alert(`Failed to delete grade: ${error.message}`);
        }
    };

    const resetForm = () => {
        setCurrentGrade(null);
        setCustomAssignmentName("");
        setSelectedSubject("");
        setSelectedStudent("");
        setDeadline("");
        setGrade("");
    };

    return (
        <div className="grading">
            <div className="grades">
                <h2>All Grades</h2>
                <div className="list-grades">
                    {grades.length > 0 ? (
                        grades.map((gradeItem) => (
                            <div
                                key={gradeItem._id}
                                className="grade-item"
                                onClick={() => handleSelectGrade(gradeItem)}
                            >
                                <p>Assignment: {gradeItem.assignmentName}</p>
                                <p>Student: {gradeItem.studentName}</p>
                                <p>Subject: {gradeItem.subjectName}</p>
                                <p>Date: {new Date(gradeItem.date).toLocaleString()}</p>
                                <p>Grade: {gradeItem.grade}</p>
                            </div>
                        ))
                    ) : (
                        <p>No grades available.</p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmitGrade} className="grades-form">
                <h2>{currentGrade ? "Edit Grade" : "Add a Grade"}</h2>

                <div className="input-grades">
                    <FontAwesomeIcon icon={faBook} />
                    <input
                        type="text"
                        name="customAssignmentName"
                        value={customAssignmentName}
                        onChange={(e) => setCustomAssignmentName(e.target.value)}
                        placeholder="Enter assignment name"
                        required
                    />
                </div>

                <div className="input-grades">
                    <FontAwesomeIcon icon={faBook} />
                    <select
                        name="subject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select Subject
                        </option>
                        {subjects.map((subject, index) => (
                            <option key={index} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-grades">
                    <FontAwesomeIcon icon={faUser} />
                    <select
                        name="student"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select Student
                        </option>
                        {students.map((student, index) => (
                            <option key={index} value={student}>
                                {student}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-grades">
                    <FontAwesomeIcon icon={faClock} />
                    <input
                        type="datetime-local"
                        name="deadline"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                    />
                </div>

                <div className="input-grades">
                    <FontAwesomeIcon icon={faStar} />
                    <input
                        type="number"
                        name="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade"
                        min="0"
                        max="100"
                        required
                    />
                </div>

                {currentGrade ? (
                    <div className="grade-actions">
                        <button type="button" onClick={handleUpdateGrade}>
                            Update Grade
                        </button>
                        <button type="button" onClick={handleDeleteGrade}>
                            Delete Grade
                        </button>
                        <button type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button type="submit" className="add-grade-button">
                        Submit Grade
                    </button>
                )}
            </form>
        </div>
    );
}

export default Grading;
