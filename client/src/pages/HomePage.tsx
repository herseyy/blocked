import { useState, useEffect, useRef } from "react"

import Button from "../components/Button"
import { Link } from 'react-router-dom';
import styles from "../static/homepage.module.css";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function HomePage() {
  const navigate = useNavigate();
  const [sign, setSign] = useState("signin");

  const signinEmailRef = useRef<HTMLInputElement>(null);
  const signinPasswordRef = useRef<HTMLInputElement>(null);
  const signupEmailRef = useRef<HTMLInputElement>(null);
  const signupUsernameRef = useRef<HTMLInputElement>(null);
  const signupPasswordRef = useRef<HTMLInputElement>(null);
  const signupConfirmPasswordRef = useRef<HTMLInputElement>(null);

  function selectsign(sign) {
    setSign(sign)
  }

  async function signin() {
    if (!(signinEmailRef.current && signinPasswordRef.current)) return;
    const email = signinEmailRef.current.value.trim()
    const password = signinPasswordRef.current.value.trim()

    if (!email || !password) {
      alert("All fields are required");
      return;
    }

    // post signin
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed In
        const user = userCredential.user;

        if (user) {
          // go to lobby
          navigate("/lobby");
        }

      })
      .catch((err) => {
        console.log(`Error signing in: ${err.code} - ${err.message}`)
      })
  }


  async function signup() {
    if (!(signupEmailRef.current && signupUsernameRef.current && signupPasswordRef.current && signupConfirmPasswordRef.current)) return;

    const email = signupEmailRef.current.value.trim();
    const username = signupUsernameRef.current.value.trim();
    const password = signupPasswordRef.current.value.trim();
    const confirmPassword = signupConfirmPasswordRef.current.value.trim();

    if (!email || !password || !username || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password != confirmPassword) {
      alert("Passwords not matched");
      return;
    }

    // post signup
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
        // Signed Up
        if (userCredential) {
          const userId = userCredential.user.uid;
          console.log(userCredential);
          console.log(userId);

          const res = await axios.post("http://localhost:3000/api/auth/signup", {
            userId,
            email,
            username
          }).then((res) => {
            console.log(res.data)
          }).catch((err) => {
            console.log(`ERROR SIGNING UP: ${err.code} - ${err.message}`)
          })
        }
      })
      .catch((err) => {
        console.log(`Error signing up: ${err.code} - ${err.message}`)
        throw err;
      })
  }

  useEffect(() => {
    if (signinEmailRef.current) signinEmailRef.current.value = "";
    if (signinPasswordRef.current) signinPasswordRef.current.value = "";
    if (signupEmailRef.current) signupEmailRef.current.value = "";
    if (signupUsernameRef.current) signupUsernameRef.current.value = "";
    if (signupPasswordRef.current) signupPasswordRef.current.value = "";
  }, [sign])

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div>Blocked</div>
      </div>
      <div className={styles.mainContainer}>
        <div className={styles.loginContainer}>
          <div className={styles.signContainer}>
            <button id="player" className={`${styles.signButton} ${sign == "signin" ? styles.active : ""}`} onClick={() => selectsign("signin")} >Sign-In</button>
            <button id="admin" className={`${styles.signButton} ${sign == "signup" ? styles.active : ""}`} onClick={() => selectsign("signup")} >Sign-Up</button>
          </div>
          {sign == "signin" ? 
            <div>
              <div className={styles.inputContainer}>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signinEmail">Email</label>
                  <input id="signinEmail" ref={signinEmailRef} />
                </div>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signinPassword">Password</label>
                  <input id="signinPassword" ref={signinPasswordRef} type="password" />
                </div>
              </div>
              <div className={styles.bottomContainer}>
                <button onClick={signin}>Sign In</button>
              </div>
            </div>
          : 
            <div>
              <div className={styles.inputContainer}>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signupEmail">Email</label>
                  <input id="signupEmail" ref={signupEmailRef} type="email" />
                </div>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signupUsername">Username</label>
                  <input id="signupUsername" ref={signupUsernameRef}/>
                </div>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signupPassword">Password</label>
                  <input id="signupPassword" ref={signupPasswordRef} type="password" />
                </div>
                <div className={styles.innerInputContainer}>
                  <label htmlFor="signupPassword">Confirm Password</label>
                  <input id="signupConfirmPassword" ref={signupConfirmPasswordRef} type="password" />
                </div>
              </div>
              <div className={styles.bottomContainer}>
                <button onClick={signup}>Sign Up</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default HomePage
