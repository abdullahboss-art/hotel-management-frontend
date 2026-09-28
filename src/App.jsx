
import './App.css'
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Navbar from './Navbar';
import Footer from './Footer';
import SignUp from './Signup';
import Rooms from './Rooms';
import Reservation from './Reservation';
import About from './About';
import Event from './Event';
import Contact from './Contact';
import Login from './Login';
import Booking from './Booking';
import Profile from './profile';
import WhatsAppButton from "./WhatsAppButton";

import "./App.css";

function App() {
 

  return (
    <>
    <Navbar/>
    
    <Routes>
  <Route path="/" element={<Home />} />
   <Route path="/Signup" element={<SignUp />} />
   <Route path="/Login" element={<Login />} />
   <Route path="/Rooms" element={<Rooms />} />
   <Route path="/Reservation" element={<Reservation />} />
   <Route path="/About" element={<About />} />
     <Route path="/booking/:id" element={<Booking />} />
   <Route path="/Event" element={<Event />} />
   <Route path="/profile" element={<Profile />} />
   <Route path="/Contact" element={<Contact />} />
 
</Routes>
<Footer/>
 <WhatsAppButton />  

    </>
  )
}

export default App
