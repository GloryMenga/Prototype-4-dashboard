# Dashboard Application

This project is a **Dashboard Application** designed to display student performance data interactively. It includes features such as visualizing grades, tracking trends over time, and managing data dynamically.

## Features

- **Performance Visualization**: Bar charts and line charts to display grades and trends.
- **Role-Based Display**: Adjustments for students and admin users based on their roles.
- **Dynamic Data Handling**: Fetch data from APIs and render it in real-time.
- **Responsive Design**: Optimized for different screen sizes.

---

## Technologies Used

- **Frontend Framework**: React.js
- **Chart Library**: Chart.js (with `chartjs-adapter-date-fns` for time formatting)
- **Styling**: CSS for custom styles and layouts.
- **Backend**: Mock API endpoints for fetching data (`http://localhost:5000`).

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GloryMenga/Prototype-4-dashboard.git
   ```
2. Navigate to the project folder:
   ```bash
   cd Dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

---

## Usage

### Admin View

- Admins can view a dropdown to select students and visualize their performance across subjects.

### Student View

- Students see only their data without the dropdown for selecting others.

### Unauthorized Access

- Users not logged in are shown a message: "You should be logged in to see the dashboard."

### Charts

- **Bar Chart**: Displays the average grades for each subject.
- **Line Chart**: Shows grade trends over time with selectable subjects.

---

## References

1. **Chart.js Documentation**:

   - [Chart.js Official Documentation](https://www.chartjs.org/docs/latest/)
   - [Time Series Adapter for Chart.js](https://github.com/chartjs/chartjs-adapter-date-fns)

2. **React.js Documentation**:

   - [React.js Official Website](https://reactjs.org/docs/getting-started.html)

3. **CSS Techniques**:

   - [CSS-Tricks: Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

4. **API References**:

   - Mock API endpoints used for data fetching (`http://localhost:5000/students`, `http://localhost:5000/grades`).

5. **Authentication Context**:

   - Based on React's Context API: [React Context API Documentation](https://reactjs.org/docs/context.html).

6. **Icons and Assets**:
   - Icons sourced from [SVGRepo](https://www.svgrepo.com/).

---

## Future Enhancements

- Add more detailed role-based access controls.
- Enhance styling for better user experience.
- Integrate a database for persistent data storage.
- Deploy the application using a hosting service like Netlify or Vercel.

---

## License

This project is for educational purposes only and is not licensed for external use, modification, or distribution.

Contact Information 🪪 Feel free to contact me through the following email for further questions:

[mengaglory@gmail.com]

---
