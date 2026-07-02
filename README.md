# ⏱️ Chrome Extension for Time Tracking and Productivity Analytics

**Company Name:** CODTECH IT Solutions  

**Intern Name:** MUKESH KUMAR  

**Intern ID:** CTIS9298  

**Domain:** Web Development  

**Batch Duration:** 8 WEEK  

**Mentor Name:** Nila Santos  

## 📌 Project Description

This project is a Chrome Extension for Time Tracking and Productivity Analytics developed as part of my internship at CODTECH IT Solutions. The extension automatically tracks the amount of time a user spends on different websites while browsing and provides detailed productivity analytics through a dashboard. It classifies visited websites as either productive (such as coding platforms, documentation sites, and learning portals) or unproductive (such as social media and entertainment sites), helping users understand and improve their browsing habits.

## 🛠️ Tools and Technologies Used

The entire project was developed using Visual Studio Code (VS Code) as the primary code editor. The Chrome Extension itself is built using HTML, CSS, and JavaScript along with the Chrome Extensions Manifest V3 API, which allows tracking of active tabs and browsing time. The backend is powered by Node.js and Express.js, which handles API requests and stores user browsing data. MongoDB is used as the database to persist time-tracking records and website classifications. The dashboard for analytics is built using React.js along with Chart.js/Recharts to visually represent productivity data through graphs and charts.

## ⚙️ How the Application Works

Once installed, the Chrome Extension runs in the background and monitors the currently active browser tab using the `chrome.tabs` and `chrome.windows` APIs. Whenever a user switches tabs or the active tab changes, the extension calculates the time spent on the previous website and logs this data.

Each tracked website is checked against a predefined (and user-editable) classification list to determine whether it is productive or unproductive. This data, along with timestamps, is periodically sent to the Node.js backend via REST API calls and stored in MongoDB against the respective user.

The dashboard, built with React.js, fetches this stored data from the backend and displays it using interactive charts — showing daily and weekly time distribution, top visited websites, and a productive vs. unproductive time ratio. At the end of each week, the system compiles this data into a Weekly Productivity Report, summarizing total browsing time, most time-consuming websites, and overall productivity score.

## 🌍 Where This Project is Applicable

Time tracking and productivity extensions like this one have wide real-world applications. Organizations can use this tool to help employees monitor and improve their work efficiency during work hours. Freelancers and remote workers can use it to analyze how their time is spent across different tools and platforms, helping with better time management and client billing.

Educational institutions can use similar tools to help students track study-related versus distraction-related browsing during online learning sessions. Productivity coaching platforms can integrate such analytics to provide personalized recommendations to users. HR and management teams can use aggregated (anonymized) data to identify patterns and suggest workflow improvements across teams.

This project demonstrates a strong understanding of Chrome Extension development using Manifest V3, browser API integration, full-stack web development with the MERN stack, REST API design, and building interactive dashboards for data visualization.

## ✨ Features

- 🌐 Automatic tracking of time spent on each website
- ✅ Classification of websites as productive or unproductive
- 📊 Interactive dashboard with charts and graphs
- 📅 Weekly productivity reports
- 🕒 Real-time tab switching detection
- 🗂️ Editable website classification list
- 💾 Persistent data storage using MongoDB
- 📱 Responsive dashboard UI

## 🔑 Setup Instructions

**Extension Setup**
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer Mode** (top-right
