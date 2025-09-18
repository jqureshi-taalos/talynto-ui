import React from 'react';

const LocationIcon = ({ width = "20", height = "20", fill = "#949494", className = "" }) => {
    return (
        <svg className={className} width={width} height={height} viewBox="0 0 14 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0ZM2 7C2 4.24 4.24 2 7 2C9.76 2 12 4.24 12 7C12 9.88 9.12 14.19 7 16.88C4.92 14.21 2 9.85 2 7Z" fill="#7A7A7A" />
            <path d="M6.99902 9.5C8.37974 9.5 9.49902 8.38071 9.49902 7C9.49902 5.61929 8.37974 4.5 6.99902 4.5C5.61831 4.5 4.49902 5.61929 4.49902 7C4.49902 8.38071 5.61831 9.5 6.99902 9.5Z" fill="#7A7A7A" />
        </svg>
    );
};

export default LocationIcon;