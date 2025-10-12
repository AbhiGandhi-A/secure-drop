import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import Chatbot from "./components/Chatbot.jsx"
import Notifications from "./components/Notifications.jsx"
import "./styles.css";


export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <Notifications />
    </div>
  )
}
