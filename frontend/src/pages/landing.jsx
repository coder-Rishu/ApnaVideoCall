import React from 'react';
import "../App.css";
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {

  const router = useNavigate();

  return (
    <div className='landing-page-container'>
      <nav>
        <div className="navHeader">
            <h2 style={{color: 'white'}}>Apna Video Call</h2>
        </div>
        <div className="navList">
            <p onClick={() => router('/fdfdgfhgfgdfs')}>Join as Guest</p>
            <p onClick={() => router('/auth')}>Register</p>
            <div role='button'>
                <p onClick={() => router('/auth')}>Login</p>
            </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
            <h1><span style={{color: 'yellowgreen'}}>Connect</span> with your Loved Ones</h1>
            <b><p style={{color: 'black'}}>Cover a distance by Apna Video Call</p></b>
            <div role='button'>
                <a href="/auth"><span style={{color: 'white'}}>Get Started</span></a>
            </div>
        </div>
        <div>
            <img src="/mobile.png" alt="" />
        </div>
      </div>

    </div>
  );
}