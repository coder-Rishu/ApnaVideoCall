import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {AuthContext} from '../contexts/auth';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import '../App.css';


export default function History() {

    const {getHistoryOfUser} = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                // Snackbar
            }
        }
        fetchHistory();
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    return (
        <div className='history'>
            <IconButton onClick={() => routeTo('/home')} >
                <HomeIcon/>
            </IconButton>
            
            { (meetings.length !== 0) ? meetings.map((e, i) => {
                return (
                    <>
                        <Card key={i} variant="outlined">
                            <CardContent>
                                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                                    Code: {e.meetingCode}
                                </Typography>
                                
                                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    Date: {formatDate(e.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </>
                )
            }) : <p>No Meeting Yet</p>}
        </div>
    );
}