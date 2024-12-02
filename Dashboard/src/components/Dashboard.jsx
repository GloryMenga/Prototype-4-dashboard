import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(""); // Default to an empty string
    const [subjectCount, setSubjectCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Students
                const studentsResponse = await fetch("http://localhost:5000/students");
                if (!studentsResponse.ok) throw new Error("Failed to fetch students");
                const studentsData = await studentsResponse.json();
                setStudents(studentsData);
                if (studentsData.length > 0) setSelectedStudent(studentsData[0].name); // Set the first student as default

                // Fetch Subjects Count
                const subjectsResponse = await fetch("http://localhost:5000/subjects");
                if (!subjectsResponse.ok) throw new Error("Failed to fetch subjects");
                const subjectsData = await subjectsResponse.json();
                setSubjectCount(subjectsData.length);

                // Fetch Student Count
                const studentCountResponse = await fetch("http://localhost:5000/students");
                if (!studentCountResponse.ok) throw new Error("Failed to fetch students");
                const studentCountData = await studentCountResponse.json();
                setStudentCount(studentCountData.length);

                // Fetch Assignments in the current week
                const assignmentsResponse = await fetch("http://localhost:5000/assignments");
                if (!assignmentsResponse.ok) throw new Error("Failed to fetch assignments");
                const assignmentsData = await assignmentsResponse.json();
                const currentWeekAssignments = assignmentsData.filter((assignment) => {
                    const assignmentDate = new Date(assignment.deadline);
                    const today = new Date();
                    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                    return assignmentDate >= startOfWeek && assignmentDate <= endOfWeek;
                });
                setAssignmentCount(currentWeekAssignments.length);
            } catch (error) {
                console.error("Error fetching dashboard data:", error.message);
                alert(`Error: ${error.message}`);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchChartData = async () => {
            if (!selectedStudent) return;

            try {
                const gradesResponse = await fetch("http://localhost:5000/grades");
                if (!gradesResponse.ok) throw new Error("Failed to fetch grades");
                const gradesData = await gradesResponse.json();

                // Filter grades for the selected student
                const studentGrades = gradesData.filter((grade) => grade.studentName === selectedStudent);

                // Calculate the average grade for each subject
                const subjectGrades = {};
                studentGrades.forEach((grade) => {
                    if (!subjectGrades[grade.subjectName]) {
                        subjectGrades[grade.subjectName] = [];
                    }
                    subjectGrades[grade.subjectName].push(grade.grade);
                });

                const labels = Object.keys(subjectGrades);
                const averages = labels.map((subject) => {
                    const total = subjectGrades[subject].reduce((sum, grade) => sum + grade, 0);
                    return (total / subjectGrades[subject].length).toFixed(2); // Average
                });

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Average Percentage (%)",
                            data: averages,
                            backgroundColor: labels.map(() => "rgb(255,242,122)"),
                            borderColor: labels.map(() => "rgba(255, 206, 86, 1)"),
                            borderWidth: 1,
                            hoverBackgroundColor: labels.map(() => "rgb(215, 204,105)"),
                            hoverBorderColor: labels.map(() => "rgb(197,187,97)"),
                            barPercentage: 0.5,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching chart data:", error.message);
                alert(`Error: ${error.message}`);
            }
        };

        fetchChartData();
    }, [selectedStudent]);

    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
    };

    return (
        <div className="dashboard">
            <div className="dropdown-container">
                <select
                    className="modern-dropdown"
                    value={selectedStudent || ""}
                    onChange={handleStudentChange}
                >
                    <option value="" disabled>
                        Select a Student
                    </option>
                    {students.map((student) => (
                        <option key={student._id} value={student.name}>
                            {student.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dashboard Wrapper */}
            <div className="dashboard-wrapper">
                <div className="row1">
                    <div className="number-subjects">
                        <div className="title-number-subjects">
                            <p>Number of subjects</p>
                        </div>
                        <div className="amount-number-subjects">
                            <h2>{subjectCount}</h2>
                        </div>
                    </div>
                    <div className="totale-students">
                        <div className="title-totale-students">
                            <p>Total of students</p>
                        </div>
                        <div className="amount-totale-students">
                            <h2>{studentCount}</h2>
                        </div>
                    </div>
                    <div className="performance-trend">
                        {/* Leave Empty */}
                    </div>
                </div>
                <div className="row1">
                    <div className="percentage-subject">
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: true,
                                        labels: { color: "#333", font: { size: 14 } },
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) =>
                                                `${tooltipItem.raw}%`, 
                                        },
                                        backgroundColor: "#333",
                                        borderColor: "#333",
                                        borderWidth: 1,
                                        titleFont: { size: 14 },
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Subjects",
                                            color: "#333",
                                            font: { size: 16 },
                                        },
                                        ticks: { color: "#333", font: { size: 12 } },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Percentage (%)",
                                            color: "#333",
                                            font: { size: 16 },
                                        },
                                        ticks: { color: "#333", font: { size: 12 } },
                                        min: 0,
                                        max: 100,
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="assignments-week">
                        <div className="title-assignments-week">
                            <p>Assignments this week</p>
                        </div>
                        <div className="amount-assignments-week">
                            <h2>{assignmentCount}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
