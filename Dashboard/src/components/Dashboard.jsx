import React, { useState, useEffect, useContext } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { AuthContext } from "../context/AuthContext.jsx";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    TimeScale
);

function Dashboard() {
    const { user } = useContext(AuthContext); 
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [subjectCount, setSubjectCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);
    const [assignmentCount, setAssignmentCount] = useState(0);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [trendData, setTrendData] = useState({ labels: [], datasets: [] });
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");

    useEffect(() => {
        if (!user) return; // Fetch only if user is logged in

        const fetchData = async () => {
            try {
                // Fetch Students
                const studentsResponse = await fetch("http://localhost:5000/students");
                if (!studentsResponse.ok) throw new Error("Failed to fetch students");
                const studentsData = await studentsResponse.json();
                setStudents(studentsData);
                if (studentsData.length > 0) setSelectedStudent(studentsData[0].name);

                // Fetch Subjects Count and List
                const subjectsResponse = await fetch("http://localhost:5000/subjects");
                if (!subjectsResponse.ok) throw new Error("Failed to fetch subjects");
                const subjectsData = await subjectsResponse.json();
                setSubjectCount(subjectsData.length);
                setSubjects(["All Subjects", ...subjectsData.map((subject) => subject.name)]);

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
    }, [user]);

    useEffect(() => {
        const fetchChartData = async () => {
            if (!selectedStudent) return;

            try {
                const gradesResponse = await fetch("http://localhost:5000/grades");
                if (!gradesResponse.ok) throw new Error("Failed to fetch grades");
                const gradesData = await gradesResponse.json();

                const studentGrades = gradesData.filter((grade) => grade.studentName === selectedStudent);

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
                    return (total / subjectGrades[subject].length).toFixed(2);
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

    useEffect(() => {
        const fetchTrendData = async () => {
            if (!selectedStudent) return;

            try {
                const gradesResponse = await fetch("http://localhost:5000/grades");
                if (!gradesResponse.ok) throw new Error("Failed to fetch grades");
                const gradesData = await gradesResponse.json();

                let studentGrades = gradesData.filter((grade) => grade.studentName === selectedStudent);
                if (selectedSubject !== "All Subjects") {
                    studentGrades = studentGrades.filter((grade) => grade.subjectName === selectedSubject);
                }

                const trendDataMap = {};
                studentGrades.forEach((grade) => {
                    const dateKey = new Date(grade.date).toISOString().split("T")[0];
                    if (!trendDataMap[dateKey]) {
                        trendDataMap[dateKey] = [];
                    }
                    trendDataMap[dateKey].push(grade.grade);
                });

                const trendLabels = Object.keys(trendDataMap).sort();
                const trendValues = trendLabels.map((date) => {
                    const grades = trendDataMap[date];
                    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
                });

                setTrendData({
                    labels: trendLabels,
                    datasets: [
                        {
                            label: selectedSubject,
                            data: trendValues,
                            fill: false,
                            borderColor: "rgb(75, 192, 192)",
                            tension: 0.4,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching trend data:", error.message);
                alert(`Error: ${error.message}`);
            }
        };

        fetchTrendData();
    }, [selectedStudent, selectedSubject]);

    const handleStudentChange = (e) => {
        setSelectedStudent(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    if (!user) {
        return <h2 style={{ textAlign: "center", height: "100%", display: "flex", alignItems: "center",justifyContent: "center" }}>You should be logged in to see the dashboard</h2>;
    }

    return (
        <div className="dashboard">
            <div className="dropdown-container">
                {user.status === "Student" ? (
                    <h2>{user.username}</h2>
                ) : (
                    <select className="modern-dropdown" value={selectedStudent || ""} onChange={handleStudentChange}>
                        <option value="" disabled>
                            Select a Student
                        </option>
                        {students.map((student) => (
                            <option key={student._id} value={student.name}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

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
                        <div className="title-performance-trend">
                            <h2>Performance Trend Over Time</h2>
                            <div className="subject-dropdown">
                                <select
                                    className="modern-chart-dropdown"
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                >
                                    {subjects.map((subject, index) => (
                                        <option key={index} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Line
                            data={trendData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: true, position: "top" },
                                },
                                scales: {
                                    x: {
                                        type: "time",
                                        time: {
                                            unit: "month",
                                            displayFormats: {
                                                month: "MMMM",
                                            },
                                        },
                                        title: {
                                            display: true,
                                            text: "Time (Months)",
                                        },
                                        ticks: {
                                            autoSkip: true,
                                            maxTicksLimit: 12,
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Grade",
                                        },
                                        min: 0,
                                        max: 100,
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
                <div className="row1">
                    <div className="percentage-subject">
                        <h2>Percentage of each subject</h2>
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: true, position: "top" },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Subjects",
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Percentage (%)",
                                        },
                                        min: 0,
                                        max: 100,
                                    },
                                },
                            }}
                            style={{ width: "100%", height: "100%" }}
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
