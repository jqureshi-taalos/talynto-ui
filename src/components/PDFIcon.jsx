import React from 'react';

const PDFIcon = ({ width = 20, height = 24, className = '' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M13.5 0.5H4.5C3.675 0.5 3 1.175 3 2V11C3 11.825 3.675 12.5 4.5 12.5H13.5C14.325 12.5 15 11.825 15 11V2C15 1.175 14.325 0.5 13.5 0.5ZM7.125 6.125C7.125 6.7475 6.6225 7.25 6 7.25H5.25V8.75H4.125V4.25H6C6.6225 4.25 7.125 4.7525 7.125 5.375V6.125ZM10.875 7.625C10.875 8.2475 10.3725 8.75 9.75 8.75H7.875V4.25H9.75C10.3725 4.25 10.875 4.7525 10.875 5.375V7.625ZM13.875 5.375H12.75V6.125H13.875V7.25H12.75V8.75H11.625V4.25H13.875V5.375ZM5.25 6.125H6V5.375H5.25V6.125ZM1.5 3.5H0V14C0 14.825 0.675 15.5 1.5 15.5H12V14H1.5V3.5ZM9 7.625H9.75V5.375H9V7.625Z" fill="#40B8E6" />
        </svg>
    );
};

export default PDFIcon;

