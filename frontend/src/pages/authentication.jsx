import React, { useState, useContext} from "react";
import '../App.css';
import { AuthContext } from '../contexts/auth';
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from 'react-router-dom';



export default function Authentication() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState(0);
  const [open, setOpen] = useState(false);
  const {handleRegister, handleLogin } = useContext(AuthContext);

  
  const link = '/home';

  let routeTo = useNavigate();

  let handleAuth = async () => {
    try{
      if (formState===0) {
        let result = await handleLogin(username, password);
        console.log(result.message.message);
        setMessage(result.message.message);
        routeTo(link);
      }
      if (formState===1)  {
        let result = await handleRegister(name, username, password);
        console.log(result.message);
        setMessage(result.message);
        routeTo(link);
        setFormState(0);
        setPassword('');
        setError('');
        setUsername('');
        setOpen(true);
      }
    } catch (error) {
      setError(error.message);
    }   
  }

  return (
    <div className="authentication-container">
        <div className="signin-container row">
            <div className="signin-header">
                <button style={{backgroundColor: " #007bff" ,marginRight: "2rem"}} variant={formState===0? "contained": ""} onClick={()=> setFormState(0)}>SignIn</button>
                <button style={{backgroundColor: " #007bff" ,marginLeft: "2rem"}} variant={formState===1? "contained": ""} onClick={()=> setFormState(1)}>SignUp</button>
            </div>
            <form>
                {formState===1? <div className="input-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                    margin="normal"
                    autoFocus
                    type="text"
                    id="username"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    placeholder="Enter your fullname"
                    required
                />
                </div> : <></>}
                
                
                <div className="input-group">
                <label htmlFor="email">Username</label>
                <input
                    margin="normal"
                    autoFocus
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                />
                </div>

                <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
                </div>
                {error && <div style={{color: 'red'}} className="error">{error}</div>}
                <button type="button" onClick={handleAuth} className="signin-btn">
                {formState===0? "Login" : "Register"}
                </button>
            </form>
        </div>
        <Snackbar
               open={open}
               autoHideDuration={2000}
               message={message}
        />
    </div>
  );
};