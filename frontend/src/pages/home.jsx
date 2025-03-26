import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import '../App.css';
import {IconButton, Button, TextField} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from "../contexts/auth";

function HomeComponenet() {

    let navigate = useNavigate();
    const {addToUserHistory} = useContext(AuthContext);
    const [meetingCode, setMeetingCode] = useState('');
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    return (
        <div className="home">
            <div style={{color:'white', display: 'flex', alignItems: 'center'}} className="navBar">
                    <h3>Apna Video Call</h3>
                
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <IconButton onClick={() => navigate('/history')}>
                        <RestoreIcon style={{color: 'white'}} /><p style={{color: 'white'}}>History</p>
                    </IconButton>
                    <Button onClick={()=>{
                        localStorage.removeItem('token');
                        navigate('/auth');
                    }} style={{color:'white'}}>
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanal">
                    <div>
                        <h1 style={{color:'white'}}>Providing Quality Video Just Like Quality Education</h1>
                        <br /><br />
                        <div style={{display:'flex', gap:'10px'}}>
                            <TextField onChange={e => setMeetingCode(e.target.value)} style={{backgroundColor:'white'}} placeholder="Meeting Code" />
                            <Button variant="contained" onClick={handleJoinVideoCall}>Join</Button>
                        </div>
                    </div>
                </div>
                <div className="rightPanal">
                    <img src="/logo.png" alt="" />
                </div>
            </div>

        </div>
    )
}

export default withAuth(HomeComponenet);