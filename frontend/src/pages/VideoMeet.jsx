import React, {useEffect, useRef, useState} from 'react';
import styles from '../style/videoMeet.module.css';
import io from'socket.io-client';
import { IconButton, Badge, Button, TextField } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import server from '../env';

const server_url = `${server}`;

var connections = {};

const peerConfigConnection = {
    iceServers : [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setShowModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState('');
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState('');
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);

    // TODO
    // if (isChrome() === false) {

    // }

    const getPermissions = async () => {

        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});
            if (videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});
            if (audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
            else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }


        } catch(error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {

        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch(error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;
        
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketIdRef.current.emit('signal', id, JSON.stringify({sdp: connections[id].localDescription }));
                }).catch (error => console.log(error));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch(error) {
                console.log(error);
            }

            let blackSilence = (...args) => new MediaStream([black(...args), scilence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject =  window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketIdRef.current.emit('signal', id, JSON.stringify({sdp: connections[id].localDescription }));
                    }).catch (error => console.log(error));
                })
            }
        })
    }

    let scilence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enable: false });
    }

    let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement('canvas'), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enable: false });
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess)
            .then((stream) => {})
            .catch(error => {
                console.log(error);
            });
        } else{
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch(error) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio!== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        
        if (fromId === socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({sdp: connections[fromId].localDescription }));
                            }).catch(error => {
                                console.log(error);
                            });
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }).catch(error => console.log(error));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(error => console.log(error));
            }
        }
    };

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((preMessages) => [...preMessages, { sender: `${sender}`, data: `${data}` }]);

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((preNewMessages) => preNewMessages + 1);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos)=>videos.filter(video => video.socketId!== id));
            });
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId)=>{
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnection);
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice' : event.candidate}));
                        }
                    };
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find((video) => video.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video => {
                                    (video.socketId === socketListId? {...video, stream: event.stream } : video);
                                });
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            }
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    }
                    else {
                        let blackSilence = (...args) => new MediaStream([black(...args), scilence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                })
                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2=== socketIdRef.current) continue;
                        try {
                            connections[id2].addStream(window.localStream);
                        } catch(error) {}

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(()=> {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp' : connections[id2].localDescription}));
                            }).catch(error => console.log(error));
                        })
                    }
                }
            });
        });
    };
    
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    let routeTo = useNavigate();

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    };

    let handleAudio = () => setAudio(!audio);

    let handleVideo = () => setVideo(!video);

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch(error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                .then(()=> {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp' : connections[id].localDescription}));
                }).catch(error => console.log(error));
            })
        }

        screen.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch(error) {
                console.log(error);
            }

            let blackSilence = (...args) => new MediaStream([black(...args), scilence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject =  window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then(getDisplayMediaSuccess)
                .then((stream)=> {})
                .catch(error => {
                    console.log(error);
                });
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen]);

    let handleScreen = () => setScreen(!screen);

    let sendMessage = () => {
        socketRef.current.emit('chat-message', {message, username});
        setMessage('');
    };

    let handleEndCall = () => {
        try {
            let track = localVideoRef.current.srcObject.getTracks();
            track.forEach(track => track.stop());
        } catch (e) {
            window.location.href = '/';
        }
        routeTo('/home');
    };

    return (
        <div>
            {askForUsername === true ? 
            
            <div className={styles.Lobby}>
                <div className={styles.User}>
                    <h3>Enter into Lobby</h3>
                    <TextField style={{backgroundColor:'white'}} type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                </div>
                <button variant="contained" onClick={connect}>Connect</button>

                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div> : 
            <>
                
                <div className={styles.meetVideoContainer}>

                    {showModal === true ? (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h2>Chat</h2>
                                <div className={styles.chatDisplay}>

                                    {messages.length !== 0 ? ( 
                                        messages.map((item, index) => {
                                            return (
                                                <div style={{ marginBottom: "20px" }} key={index}>
                                                    <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                    <p>{item.data}</p>
                                                </div>
                                            )
                                        }))
                                        : <p style={{color:'black'}}>No messages yet.</p>
                                    }

                                </div>
                                <div className={styles.chatArea}>
                                    <TextField value={message} onChange={e => setMessage(e.target.value)} label="Enter your message" id="outlined-basic" variant="outlined" />
                                    <Button variant="contained" onClick={sendMessage}>SEND</Button>
                                </div>

                            </div>
                        </div> ) : <></>
                    }

                    <div className={styles.buttonContainer}>
                        <Badge badgeContainer={newMessages} max={999} color='secondary'>
                            <IconButton onClick={() => setShowModal(!showModal)} style={{color: 'white'}} >
                                {<ChatIcon/>}
                            </IconButton>
                        </Badge>
                        {screenAvailable===true ? 
                            <IconButton onClick={handleScreen} style={{color: 'white'}} >
                                {(screen===true)? <ScreenShareIcon /> : <StopScreenShareIcon/>}
                            </IconButton>
                        : <></>}
                        <IconButton onClick={handleVideo} style={{color: 'white'}} >
                            {(video===true)? <VideocamIcon /> : <VideocamOffIcon/>}
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{color: 'white'}} >
                            {(audio===true)? <MicIcon /> : <MicOffIcon/>}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{color: 'red'}} >
                            {<CallEndIcon/>}
                        </IconButton>
                    </div>
                
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted ></video>

                    {videos.map((video) => (
                        <div className={styles.conferenceView} key={video.socketId}>
                            <h4>{video.socketId}</h4>
                            <video 
                                data-socket={video.socketId}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                                autoPlay
                            >
                            </video>
                        </div>
                    ))}
                </div>
            </>}
        </div>
    );
}