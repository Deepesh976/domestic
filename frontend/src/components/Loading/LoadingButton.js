import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingButton = ({ 
    isLoading, 
    onClick, 
    style = {}, 
    children, 
    disabled = false,
    loadingText = "Processing...",
    type = "button"
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            style={{
                ...styles.button,
                ...style,
                cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
                opacity: isLoading || disabled ? 0.7 : 1
            }}
            disabled={isLoading || disabled}
        >
            {isLoading ? (
                <div style={styles.loadingContent}>
                    <LoadingSpinner size="small" color={style.color || '#fff'} />
                    <span style={styles.loadingText}>{loadingText}</span>
                </div>
            ) : children}
        </button>
    );
};

const styles = {
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.3s ease',
    },
    loadingContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: '8px'
    }
};

export default LoadingButton; 