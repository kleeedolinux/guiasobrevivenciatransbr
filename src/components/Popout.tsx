"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Popout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

const Popout: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <motion.div 
            className="popout"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', top: '80px', left: 'calc(50% - 200px)', width: 'calc(100% - 40px)', maxWidth: '400px', transform: 'translate(0, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
            <button onClick={handleClose} className="close-button">✖</button>
            <div className="popout-content">
                <p>Entre no nosso servidor para ajudar a nossa comunidade e acrescer</p>
                <div className="button-container">
                    <button className="join-button">
                        <FontAwesomeIcon icon={faDiscord} /> Entrar no servidor
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Popout;
