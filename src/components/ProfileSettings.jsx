import './Dashboard.css';
import './ProfileSettings.css';
import ProfileAvatar from './ProfileAvatar';
import EmailIcon from './EmailIcon';
import LocationIcon from './LocationIcon';
import Notification from './Notification';
import { useEffect, useRef, useState } from 'react';
import PDFIcon from './PDFIcon';


const getDisplayValue = (value) => {
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'Not specified';
    }
    return value || 'Not Specified';
};

const Render = ({ when = false, children }) => {
    return when ? <>{children}</> : null;
};

const defaultIndustryOptions = [
    'Healthcare',
    'Finance',
    'Technology',
    'Manufacturing',
    'Retail'
];

const countryOptions = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Switzerland",
    "Austria",
    "Belgium",
    "Ireland",
    "Portugal",
    "Greece",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Romania",
    "Bulgaria",
    "Croatia",
    "Slovenia",
    "Slovakia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Cyprus",
    "Japan",
    "South Korea",
    "Singapore",
    "Hong Kong",
    "Taiwan",
    "New Zealand",
    "Israel",
    "United Arab Emirates",
    "Saudi Arabia",
    "India",
    "China",
    "Brazil",
    "Mexico",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
    "Uruguay",
    "Ecuador",
    "Bolivia",
    "Paraguay",
    "Venezuela",
    "Costa Rica",
    "Panama",
    "Guatemala",
    "Honduras",
    "El Salvador",
    "Nicaragua",
    "Belize",
    "Jamaica",
    "Trinidad and Tobago",
    "Barbados",
    "Bahamas",
    "South Africa",
    "Egypt",
    "Morocco",
    "Tunisia",
    "Kenya",
    "Ghana",
    "Nigeria",
    "Ethiopia",
    "Tanzania",
    "Uganda",
    "Rwanda",
    "Botswana",
    "Namibia",
    "Zambia",
    "Zimbabwe",
    "Mauritius",
    "Seychelles",
    "Madagascar",
    "Russia",
    "Ukraine",
    "Belarus",
    "Kazakhstan",
    "Uzbekistan",
    "Kyrgyzstan",
    "Tajikistan",
    "Turkmenistan",
    "Mongolia",
    "Azerbaijan",
    "Armenia",
    "Georgia",
    "Turkey",
    "Lebanon",
    "Jordan",
    "Kuwait",
    "Qatar",
    "Bahrain",
    "Oman",
    "Yemen",
    "Iraq",
    "Iran",
    "Afghanistan",
    "Pakistan",
    "Bangladesh",
    "Sri Lanka",
    "Maldives",
    "Nepal",
    "Bhutan",
    "Myanmar",
    "Thailand",
    "Malaysia",
    "Indonesia",
    "Philippines",
    "Vietnam",
    "Cambodia",
    "Laos",
    "Brunei",
    "East Timor",
    "Papua New Guinea",
    "Fiji",
    "Solomon Islands",
    "Vanuatu",
    "Samoa",
    "Tonga",
    "Palau",
    "Marshall Islands",
    "Micronesia",
    "Nauru",
    "Kiribati",
    "Tuvalu",
];

const MultiSelectDropdown = ({ field, value, options, placeholder, onChange, XOXO }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleOptionToggle = (option) => {
        const currentValues = value || [];
        const newValues = currentValues.includes(option)
            ? currentValues.filter(v => v !== option)
            : [...currentValues, option];
        onChange(field, newValues);
    };

    const handleAddCustom = () => {
        const trimmedValue = customInput.trim();
        if (trimmedValue && !value.includes(trimmedValue)) {
            const newValues = [...(value || []), trimmedValue];
            onChange(field, newValues);
            setCustomInput('');
        }
    };

    const displayText = value && value.length > 0
        ? value.length === 1
            ? value[0]
            : `${value.length} selected`
        : placeholder;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    padding: '8px 12px',
                    border: '1px solid #000000',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '36px'
                }}
            >
                <span style={{ flex: 1 }}> {XOXO || displayText} </span>
                <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}> ▼ </span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #000000',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '250px',
                    overflowY: 'auto'
                }}>
                    {/* ===== Not needed as added with save =====
                        <div style={{
                            padding: '8px 12px',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: '#f8f9fa'
                        }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    placeholder="Add custom entry"
                                    style={{
                                        flex: 1,
                                        padding: '4px 8px',
                                        border: '1px solid #000000',
                                        borderRadius: '3px',
                                        fontSize: '12px'
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustom();
                                        }
                                    }}
                                />
                            
                                    <button type="button" onClick={handleAddCustom} style={{ padding: '4px 8px', border: '1px solid #4EC1EF', backgroundColor: '#4EC1EF', color: 'white', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}>
                                        Add
                                    </button>
                                
                            </div>
                        </div>
                    ============================================*/}

                    {/* Options list */}
                    {options && options.length > 0 ? (
                        options.map((option) => (
                            <div
                                key={option.value || option}
                                onClick={() => handleOptionToggle(option.value || option)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: value && value.includes(option.value || option) ? '#e7f3ff' : 'transparent',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    if (!(value && value.includes(option.value || option))) {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!(value && value.includes(option.value || option))) {
                                        e.target.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={value && value.includes(option.value || option)}
                                    onChange={() => { }} // Handled by div click
                                    style={{ margin: 0 }}
                                />
                                <span>{option.label || option}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '8px 12px', color: '#999', fontSize: '12px' }}>
                            No predefined options available. Use the input above to add custom entries.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProfileSettings = ({
    // Data
    userId,
    formData,
    setFormData,
    securityData,
    saving,
    userRole,
    isEditing = false,
    options,
    deactivationData,
    // Functions
    handleEdit,
    handleSave,
    handlePassword,
    handleCancel,
    handleChange,
    handleDeleteAccount,
    isSaving,
    setDeactivationData,
    handleChangePassword,
    notification,
    hideNotification,
    handlePictureUpload,
    hideSettingsHeader = false,
    contractorViewedByClient = false,
    handleViewResume,
}) => {


    const [industryOptions, setIndustryOptions] = useState(defaultIndustryOptions);

    const removeFromArray = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: prev[fieldName].filter(item => item !== value)
        }));
    };

    const handleMultiSelectChange = (field, selectedValues) => {
        // @checkpoint: for industry handling
        // File: src\components\ContractorIntakeForm.jsx
        setFormData(prev => ({
            ...prev,
            [field]: selectedValues
        }));
    };

    const renderMultiFields = (fieldName, fields, editMode = false) => {
        if (Array.isArray(fields)) {
            if (fields.length === 0) {
                return 'Not Specified'
            }

            return fields.map((f) => (
                <span key={f} className={editMode ? 'tag' : "x-badge"}>
                    {f}
                    {editMode && (
                        <button type="button" onClick={() => removeFromArray(fieldName, f)} className="tag-remove">
                            ×
                        </button>
                    )}
                </span>
            ));
        } else if (typeof fields === 'string') {
            return <span className="x-badge">{fields}</span>;
        } else {
            return <span style={{ color: 'gray' }}>Not Specified</span>;
        }
    };

    return (
        <div className='x-profile-settings'>
            {notification && <Notification
                type={notification?.type}
                message={notification?.message}
                isVisible={notification?.isVisible}
                onClose={hideNotification}
                duration={notification.duration}
            />}

            <Render when={!hideSettingsHeader}>
                <div className='x-header'>
                    <h1>Profile</h1>
                    <div className='x-button-parent'>
                        {!isEditing ? (
                            <button className="x-button" onClick={handleEdit}>Edit</button>
                        ) : (
                            <>
                                <button className="x-button cancel" onClick={handleCancel} disabled={saving} >
                                    Cancel
                                </button>
                                <button className="x-button" onClick={handleSave} disabled={saving}>
                                    {saving ? <div className='x-loading-spinner'></div> : 'Save'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </Render>

            <div className='x-profile-header'>
                <div className='x-profile-title'>
                    <div className='x-avatar-and-name'>
                        <ProfileAvatar
                            user={{
                                id: userId,
                                firstName: formData?.firstName,
                                lastName: formData?.lastName,
                                email: formData?.email
                            }}
                            size={150}
                            className='x-avatar'
                            timestamp={formData?.profilePictureTimestamp}
                            profilePictureData={formData?.profilePictureData}
                        />
                        {isEditing && (
                            <div className="profile-photo-upload">
                                {
                                    userRole === 'client' ? (
                                        <button
                                            className="change-photo-btn x-change-image"
                                            onClick={handlePictureUpload}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Uploading...' : 'Change Image'}
                                        </button>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                name="profilePicture"
                                                onChange={handleChange}
                                                accept="image/*"
                                                className="file-input"
                                                id="profile-picture-upload"
                                            />
                                            <label htmlFor="profile-picture-upload" className="change-photo-btn x-change-image">
                                                Change Image
                                            </label></>
                                    )
                                }
                            </div>
                        )}

                        <Render when={!isEditing}>
                            <div className='x-name x-title-font'>
                                {formData?.firstName} <strong>{formData?.lastName}</strong>
                            </div>
                        </Render>
                    </div>
                    <div className='x-email-and-location'>
                        <Render when={formData?.email}>
                            <div className='x-email'> <EmailIcon /> {formData?.email}</div>
                        </Render>
                        {isEditing ? (
                            <select
                                name={userRole === 'client' ? 'country' : 'location'}
                                value={formData?.location || formData?.country || ''}
                                onChange={
                                    userRole !== 'client'
                                        ? handleChange
                                        : (e) => handleChange('country', e.target.value)
                                }
                                style={{ background: 'transparent' }}
                                className="profile-select"
                            >
                                <option value="">Select country</option>
                                {countryOptions.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Render when={formData?.location || formData?.country}>
                                <div className='x-location'>
                                    <LocationIcon /> {formData?.location || (formData?.state ? `${formData?.state}, ${formData?.country}` : formData?.country)}
                                </div>
                            </Render>
                        )}
                    </div>
                </div>
            </div>

            {userRole === 'client' ? (
                <>
                    <div className='x-profile-details'>
                        <div className='x-profile-client-details-holder'>
                            <Render when={isEditing}>
                                <div className='x-detail edit'>
                                    <div className='x-detail-label'>First Name</div>
                                    <input
                                        type="text"
                                        value={formData?.firstName || ''}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                        className="profile-input"
                                        placeholder="Enter First Name"
                                    />
                                </div>
                            </Render>

                            <Render when={isEditing}>
                                <div className='x-detail edit'>
                                    <div className='x-detail-label'>Last Name</div>
                                    <input
                                        type="text"
                                        value={formData?.lastName || ''}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                        className="profile-input"
                                        placeholder="Enter Last Name"
                                    />
                                </div>
                            </Render>

                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Company Name</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData?.companyName || ''}
                                        onChange={(e) => handleChange('companyName', e.target.value)}
                                        className="profile-input"
                                        placeholder="Enter company name"
                                    />
                                ) : (
                                    < div className='x-detail-value'>{formData?.companyName || ''}</div>
                                )
                                }
                            </div>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Industry</div>
                                {isEditing ? (
                                    <select
                                        name="industry"
                                        value={formData?.industry}
                                        onChange={(e) => handleChange('industry', e.target.value)}
                                        className="profile-select"
                                    >
                                        <option value="">Select Industry</option>
                                        {industryOptions.map((industry) => (
                                            <option key={industry} value={industry}> {industry} </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className='x-detail-value'>
                                        {formData?.industry}
                                    </div>
                                )
                                }
                            </div>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Size</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData?.companySize || ''}
                                        onChange={(e) => handleChange('companySize', e.target.value)}
                                        className="profile-input"
                                        placeholder="Enter size"
                                    />
                                ) : (
                                    <div className='x-detail-value'>{formData?.companySize || 'Not Specified'}</div>
                                )
                                }
                            </div>
                        </div>
                    </div>

                    <div className='x-security-and-deactivate-section'>
                        <div className='x-width-100'>
                            <div className='x-security-and-deactivate-box'>
                                <div className='x-title-font'>Security <strong>Settings</strong></div>
                                <div><button onClick={handleChangePassword} className='x-button-secondary x-red'>Change Password</button> </div>
                            </div>
                            <div className='x-profile-details'>
                                < div className='x-profile-details-holder'>
                                    <div className='x-detail'>
                                        <div className='x-detail-label'>Old Password</div>
                                        <div className='x-detail-value'>
                                            <div className="x-badge">
                                                <input
                                                    type="password"
                                                    placeholder="OLD PASSWORD"
                                                    value={securityData?.oldPassword}
                                                    onChange={(e) => handlePassword('oldPassword', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                < div className='x-profile-details-holder'>
                                    <div className='x-detail'>
                                        <div className='x-detail-label'>New Password</div>
                                        <div className='x-detail-value'>
                                            <div className="x-badge">
                                                <input
                                                    type="password"
                                                    placeholder="NEW PASSWORD"
                                                    value={securityData?.newPassword}
                                                    onChange={(e) => handlePassword('newPassword', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                < div className='x-profile-details-holder'>
                                    <div className='x-detail'>
                                        <div className='x-detail-label'>Confirm Password</div>
                                        <div className='x-detail-value'>
                                            <div className="x-badge">
                                                <input
                                                    type="password"
                                                    placeholder="CONFIRM PASSWORD"
                                                    value={securityData?.confirmPassword}
                                                    onChange={(e) => handlePassword('confirmPassword', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <Render when={securityData?.newPassword && securityData?.confirmPassword && securityData.newPassword !== securityData.confirmPassword}>
                                    <div
                                        style={{
                                            marginTop: "5px",
                                            fontSize: "13px",
                                            color: "red",
                                            textAlign: "center",
                                        }}
                                    >
                                        Password do not match.
                                    </div>
                                </Render>

                            </div>
                        </div>
                        <div className='x-width-100'>
                            <div className='x-security-and-deactivate-box'>
                                <div className='x-title-font'>Deactivate <strong>Account</strong></div>
                                <div>
                                    <button
                                        onClick={() => {
                                            if (!deactivationData.eligibility) {
                                                handleDeleteAccount();
                                            } else {
                                                setDeactivationData(prev => ({ ...prev, eligibility: null }))
                                            }
                                        }}
                                        className={`x-button-secondary ${!deactivationData.eligibility ? 'x-blue' : 'x-gray'}`}
                                        disabled={deactivationData.loading}
                                    >
                                        {deactivationData.loading ? 'Checking...' : !deactivationData.eligibility ? 'Check Eligibility' : 'Check Again'}
                                    </button>
                                </div>
                            </div>
                            <div className='x-profile-details'>
                                < div className='x-profile-details-holder'>
                                    <div className='x-detail x-eligiblity-box'>
                                        {!deactivationData.eligibility ? (
                                            <>
                                                Account deactivation is only allowed when all projects are closed and all invoices are accepted and paid by admin.
                                            </>
                                        ) : (
                                            <>
                                                <div className="eligibility-status">
                                                    {deactivationData.eligibility?.isEligible ? (
                                                        <>
                                                            <div className="eligible-message">
                                                                <span className="success-icon">✓</span>
                                                                <p>{deactivationData.eligibility.message}</p>
                                                            </div>
                                                            <div className="account-summary">
                                                                <p><strong>Projects:</strong> {deactivationData.eligibility.closedProjects}/{deactivationData.eligibility.totalProjects} closed</p>
                                                                <p><strong>Invoices:</strong> {deactivationData.eligibility.paidInvoices}/{deactivationData.eligibility.totalInvoices} paid</p>
                                                            </div>
                                                            <button
                                                                className="delete-btn"
                                                                onClick={handleDeleteAccount}
                                                                disabled={isSaving}
                                                            >
                                                                {isSaving ? 'Processing...' : 'Deactivate Account'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="ineligible-message">
                                                                <span className="error-icon">⚠</span>
                                                                <p>{deactivationData.eligibility.message}</p>
                                                            </div>
                                                            <ul className="blocking-reasons">
                                                                {deactivationData.eligibility.blockingReasons.map((reason, index) => (
                                                                    <li key={index}>{reason}</li>
                                                                ))}
                                                            </ul>
                                                            <div className="account-summary">
                                                                <p><strong>Projects:</strong> {deactivationData.eligibility.closedProjects}/{deactivationData.eligibility.totalProjects} closed</p>
                                                                <p><strong>Invoices:</strong> {deactivationData.eligibility.paidInvoices}/{deactivationData.eligibility.totalInvoices} paid</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='x-profile-details'>
                        <div className='x-profile-client-details-holder'>
                            <Render when={isEditing}>
                                <div className='x-detail edit'>
                                    <div className='x-detail-label'>First Name</div>
                                    <input
                                        type="text"
                                        value={formData?.firstName || ''}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }));
                                        }}
                                        className="profile-input"
                                        placeholder="Enter First Name"
                                    />
                                </div>
                            </Render>

                            <Render when={isEditing}>
                                <div className='x-detail edit'>
                                    <div className='x-detail-label'>Last Name</div>
                                    <input
                                        type="text"
                                        value={formData?.lastName || ''}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                lastName: e.target.value,
                                            }));
                                        }}
                                        className="profile-input"
                                        placeholder="Enter Last Name"
                                    />
                                </div>
                            </Render>

                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Resume Upload</div>
                                <div className="field-group">
                                    {isEditing ? (
                                        <div className="file-upload-field">
                                            <input
                                                type="file"
                                                name="resumeUpload"
                                                onChange={handleChange}
                                                accept=".pdf,.doc,.docx"
                                                className="file-input"
                                                id="resume-upload"
                                            />
                                            <label htmlFor="resume-upload" className="file-label">
                                                {formData.resumeUpload ? 'Change File' : 'Choose File'}
                                            </label>
                                            {formData.resumeUpload && (
                                                <span className="file-name">{formData.resumeUpload}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {formData?.resumeUpload ? (
                                                <button className='x-resume-btn' onClick={handleViewResume}>
                                                    <span><PDFIcon /></span>
                                                    <span>{formData?.firstName?.toUpperCase()} RESUME</span>
                                                </button>
                                            ) : (
                                                <div className='x-detail-value'>
                                                    No Resume Uploaded
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>



                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>LinkedIn URL</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="linkedinUrl"
                                        value={formData?.linkedinUrl}
                                        onChange={handleChange}
                                        placeholder="in/yourprofile"
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className='x-detail-value'>
                                        {getDisplayValue(formData?.linkedinUrl)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className='x-title-font'>Professional <strong>Info</strong></div>

                    <div className='x-profile-contractor-details-holder'>
                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Certifications</div>
                                {isEditing ? (
                                    <div className="multi-select-container">
                                        <MultiSelectDropdown
                                            field="certifications"
                                            value={formData?.certifications}
                                            options={options.certifications}
                                            placeholder="Select certifications..."
                                            onChange={handleMultiSelectChange}
                                            XOXO={
                                                <div className="selected-tags">
                                                    {renderMultiFields('certifications', formData?.certifications, true)}
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className='x-detail-value'>
                                        {renderMultiFields('certifications', formData?.certifications)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Render when={contractorViewedByClient}>
                            <div className='x-profile-details-holder'>
                                <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                    <div className='x-detail-label'>Matched Project</div>
                                    <div className='x-detail-value'>
                                        <div className="x-badge">
                                            {formData?.matchedProject}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Render>

                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Skills / Experience</div>
                                {isEditing ? (
                                    <div className="multi-select-container">
                                        <MultiSelectDropdown
                                            field="skills"
                                            value={formData?.skills}
                                            options={options.skills}
                                            placeholder="Select skills..."
                                            onChange={handleMultiSelectChange}
                                            XOXO={
                                                <div className="selected-tags">
                                                    {renderMultiFields('skills', formData?.skills, true)}
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className='x-detail-value'>
                                        {renderMultiFields('skills', formData?.skills)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Software Tools</div>
                                {isEditing ? (
                                    <div className="multi-select-container">
                                        <MultiSelectDropdown
                                            field="softwareTools"
                                            value={formData?.softwareTools}
                                            options={options.softwareTools}
                                            placeholder="Select software tools..."
                                            onChange={handleMultiSelectChange}
                                            XOXO={
                                                <div className="selected-tags">
                                                    {renderMultiFields('softwareTools', formData?.softwareTools, true)}
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className='x-detail-value'>
                                        {renderMultiFields('softwareTools', formData?.softwareTools || formData?.software)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Hourly Rate</div>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="hourlyRate"
                                        value={formData?.hourlyRate}
                                        onChange={handleChange}
                                        min={1}
                                        placeholder="$90/hr"
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className="x-badge">{getDisplayValue(formData?.hourlyRate)} </div>
                                )}
                            </div>
                        </div>

                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Availability</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="availability"
                                        value={formData?.availability}
                                        onChange={handleChange}
                                        placeholder="20Hr/week, Full Time"
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className='x-detail-value'>
                                        <div className="x-badge"> {getDisplayValue(formData?.availability)} </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='x-profile-details-holder'>
                            <div className={isEditing ? 'x-detail edit' : 'x-detail'}>
                                <div className='x-detail-label'>Work model</div>
                                {isEditing ? (
                                    <select
                                        name="workModel"
                                        value={formData?.workModel}
                                        onChange={handleChange}
                                        className="profile-select"
                                    >
                                        <option value="">Select work model</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Onsite">Onsite</option>
                                    </select>
                                ) : (
                                    <div className='x-detail-value'>
                                        <div className="x-badge"> {getDisplayValue(formData?.workModel)} </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    )

}

export default ProfileSettings;