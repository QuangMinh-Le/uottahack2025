# Hack The Fllush | uottahack2025

![Toilet-Paper.png](https://cdn.dorahacks.io/static/files/1947e7fa9bf2a00cea28cdc4983b73f7.png)
DEMO: https://youtu.be/WoqqyPd7O_s
## 🚽 Overview  
**Hack The Fllush** is an innovative web application that empowers users and administrators to monitor the availability and usage of washrooms in a building. This platform leverages real-time data and event-driven architecture to ensure seamless tracking, optimal resource allocation, and improved user experience.

Built using React, Python, and JavaScript, and powered by Solace's event-driven architecture, Hack The Fllush is designed to deliver accurate, real-time information about washroom occupancy and usage. Whether you're a building user seeking the nearest available washroom or an admin optimizing cleaning schedules, Hack The Fllush provides actionable insights that make washroom management smarter and more efficient.

---
## 💡 Features
Hack The Fllush goes beyond merely locating toilets. By leveraging real-time vacancy data:

- **For Building Users**:
  - **Real-Time Washroom Availability**: Users can access a floor-wise dashboard that shows the status (vacant/occupied) of each washroom, updated in real-time.
  - **Washroom Location Mapping**: An intuitive map interface helps users locate washrooms quickly on any floor.
  - **Gender-Specific Filtering**: Users can filter washroom availability based on gender (male, female, or all).  
- **For Restroom Administrators**:
  - **Comprehensive Dashboard**: A detailed dashboard provides admins with:
     - Usage Counts: Track how many times each washroom has been used within a specified time frame.
     - Occupancy Status: Monitor which washrooms are currently in use and for how long.
     - Frequency Analysis: View trends in washroom usage across floors and time periods to identify peak hours.
  - **Data-Driven Cleaning Schedules**: Leverage real-time usage data and historical trends to plan optimal cleaning schedules, ensuring hygiene without overusing resources.
   - **Performance Metrics**: Measure and compare the frequency of use across washrooms to improve long-term maintenance planning.

This ensures that all subscribers receive the message (data) at the same time so that every user has a pleasant experience, and organizations save valuable time and resources.

![Screenshot 2025-01-19 095101.png](https://cdn.dorahacks.io/static/files/1947f108647020dce1a6b69445daa0a1.png)

![Screenshot 2025-01-19 095117.png](https://cdn.dorahacks.io/static/files/1947f10d370bb0d230871fb40da948b9.png)

![Screenshot 2025-01-19 095135.png](https://cdn.dorahacks.io/static/files/1947f0f75bb62fd82ca1cd4418a8af1e.png)
---

## 🚀 Highlights
- **Real-Time Updates**: Tracks toilet availability in real time to eliminate unnecessary waiting.
- **Event-Driven Architecture**: Built on PubSub+ Cloud for seamless data flow and responsiveness.
- **Actionable Insights**: Helps organizations optimize restroom logistics and cleaning schedules.
- **User-Centric Design**: Focused on enhancing the restroom experience for everyone.

---
![Real-Time Insights](https://cdn.dorahacks.io/static/files/1947e05336bb17cc15f843d45c7bf90a.png)

## 🛠️ Technologies Used

1. **Real-Time Data with Solace Event-Driven Architecture**:
  - Solace’s PubSub+ Cloud: Enables fast and efficient event-driven communication to provide real-time updates for both users and admins.
  - Scalable Event-Streaming: Supports seamless scalability for large buildings with multiple washrooms and high traffic.

1. **Modern Tech Stack**:
  - Frontend: Built with React, the web app delivers a clean and responsive user interface.
  - Backend: A powerful Python backend processes washroom usage data and interacts with Solace for real-time updates.
  - JavaScript Integration: Used for dynamic interactivity and advanced data visualization.

---

## ⚔️ Challenges

One of the biggest challenges we faced during this project was understanding the intricacies of event-driven architecture. It required us to dive deep into how a publisher communicates with the broker and how the broker efficiently routes messages to subscribers in real time. Unlike traditional REST APIs, which operate in a request-response model, event-driven architecture demanded a shift in our mindset to fully grasp its asynchronous, real-time nature.

![pub-sub-concept.png](https://cdn.dorahacks.io/static/files/1947e9cce279f17605f428b45feaccc9.png)

We spent time learning how to implement this architecture into our project to achieve real-time data processing. It was an eye-opening experience to see how seamlessly messages could flow between the publisher, broker, and subscribers, enabling live updates with exceptional speed and accuracy.

---

## 🔥 Things we gained
Through this journey, we truly discovered the transformative power of event-driven architecture. Unlike REST APIs that most of us learned in school, which often rely on polling or manual requests and can introduce latency, event-driven systems deliver instant, lag-free data updates with remarkable efficiency. This challenge pushed us to deepen our understanding of real-time data processing and its ability to revolutionize user experiences and decision-making. Along the way, we learned not just about the technical intricacies of designing and implementing event-driven architecture, but also the importance of collaboration, structured problem-solving, and adaptability.

This experience wasn’t just about overcoming technical challenges—it was about building lasting friendships, fostering teamwork, and working together to bring an idea to life. It gave us a rare opportunity to combine our knowledge with hands-on application, leaving us with not only a functional project but also one of the most rewarding and memorable experiences of our school journey.
---

## 🤝 Join the Movement
Hack The Flush isn’t just a project; it’s a revolution in restroom management. Let’s make restroom emergencies a thing of the past—one flush at a time!
