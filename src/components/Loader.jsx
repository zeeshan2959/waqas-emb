import React from 'react'

function Loader() {
    return (
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
            {[0, 0.15, 0.3].map((d, i) => (
                <div key={i} style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: '#D85A30',
                    animation: `bounce 0.9s ${d}s ease-in-out infinite`,
                }} />
            ))}
        </div>
    );
}

export default Loader