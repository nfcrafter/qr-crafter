import React from 'react';

export default function PhonePreview({ children }) {
    return (
        <div style={{
            width: '320px',
            height: '640px',
            background: '#111',
            borderRadius: '40px',
            padding: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '4px solid #222',
            position: 'relative',
            margin: '0 auto',
            overflow: 'hidden'
        }}>
            {/* Notch */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '120px',
                height: '24px',
                background: '#111',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                zIndex: 10
            }}></div>

            {/* Screen */}
            <div style={{
                width: '100%',
                height: '100%',
                background: 'white',
                borderRadius: '30px',
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative'
            }}>
                {children}
            </div>
            
            {/* Home indicator */}
            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '4px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '2px',
                zIndex: 10
            }}></div>
        </div>
    );
}
