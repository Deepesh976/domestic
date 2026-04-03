import React from 'react';

const LoadingSpinner = ({ size = 'default', color = '#3498db' }) => {
    const getSize = () => {
        switch(size) {
            case 'small':
                return { width: '20px', height: '20px', borderWidth: '3px' };
            case 'large':
                return { width: '60px', height: '60px', borderWidth: '6px' };
            default:
                return { width: '40px', height: '40px', borderWidth: '4px' };
        }
    };

    return (
        <div style={{
            ...styles.loadingContainer,
            ...(size === 'button' && styles.buttonContainer)
        }}>
            <div style={{
                ...styles.spinner,
                ...getSize(),
                borderTop: `${getSize().borderWidth} solid ${color}`
            }} />
            {size !== 'button' && size !== 'small' && (
                <p style={styles.loadingText}>Loading...</p>
            )}
        </div>
    );
};

const styles = {
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
    },
    buttonContainer: {
        minHeight: 'unset',
        margin: '0 10px'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '20px',
        fontSize: '1.2rem',
        color: '#666'
    }
};

// Add global CSS for the spin animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default LoadingSpinner; 