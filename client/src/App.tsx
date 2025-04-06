import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage"
import Lobby from "./pages/Lobby"
import Room from "./pages/Room"
import NoPage from "./pages/NoPage"

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

function App() {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const notSignedIn = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(user)
        setUser(user)

        const userRef = ref(db, `users/${user.uid}/role`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userRole = snapshot.val();
            setRole(userRole);
          } else {
            console.log("No role found for the user.");
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error.message);
        }
      } else {
        setUser(null)
      }
    });

    return () => notSignedIn();
  }, [auth, db]);

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/" />;
    }

    return children
  }


  const logout = async () => {
    const auth = getAuth();
  
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      // window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  }

  return (
    <Routes>
      {user ? 
        <Route path="/" element={
          <ProtectedRoute>
            <Lobby user={user} role={role} />
            <button onClick={logout}>Logout</button>
          </ProtectedRoute>
        }/>
      :
        <Route path="/" element={<HomePage />} />
      }
      <Route path="/rooms/:roomId" element={
        <ProtectedRoute>
          <Room user={user} role={role} />
          <button onClick={logout}>Logout</button>
        </ProtectedRoute>
      }/>
      <Route path="*" element={<NoPage />} />
    </Routes>
  )
}

export default App
