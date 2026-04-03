import React, { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCommentDots, FaPaperPlane } from "react-icons/fa";
import Navbar from '../../components/Navbar/Headadmin-Navbar';
import AdminNavbar from '../../components/Navbar/Admin-Navbar';
import { useSelector } from 'react-redux';
import { getCurrentUser } from '../../services/userService';
import './AdminSupport.css';

const SupportPage = () => {
  const role = localStorage.getItem('role');
  const { token } = useSelector(state => state.auth);
  const [orgData, setOrgData] = useState({
    name: "Organization Name",
    emailId: "support@example.com",
    phoneNumber: "+123 456 7890",
    address: "12, This is your address section"
  });
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser(token);
        
        if (userData.organization) {
          setOrgData({
            name: userData.organization.name || "Organization Name",
            emailId: userData.organization.emailId || (userData.organization.support?.emailId || "support@example.com"),
            phoneNumber: userData.organization.phoneNumber || (userData.organization.support?.phoneNumber || "+123 456 7890"),
            address: userData.organization.address || "Address not available"
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      alert('Please write feedback before submitting');
      return;
    }

    try {
      setSubmitLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubmitSuccess(true);
      setFeedbackText('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="support-wrapper">
      {role === 'headadmin' ? <Navbar /> : <AdminNavbar />}
      <div className="support-container">
        {/* Header Section */}
        <div className="support-header">
          <div>
            <h1 className="support-title">Support Center</h1>
            <p className="support-subtitle">Get in touch with us. We're here to help!</p>
          </div>
        </div>

        {/* Organization Name Section */}
        <div className="organization-section">
          <h2 className="organization-name">{orgData.name}</h2>
          <p className="organization-description">Contact Information & Feedback</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <p className="loading-text">Loading support information...</p>
          </div>
        ) : (
          <div className="support-grid">
            {/* Email Card */}
            <div className="support-card email-card">
              <div className="card-icon-wrapper email-icon-wrapper">
                <FaEnvelope className="card-icon" />
              </div>
              <h3 className="card-heading">Email</h3>
              <p className="card-content email-content">{orgData.emailId}</p>
              <a href={`mailto:${orgData.emailId}`} className="card-link">
                Send Email
              </a>
            </div>

            {/* Phone Card */}
            <div className="support-card phone-card">
              <div className="card-icon-wrapper phone-icon-wrapper">
                <FaPhone className="card-icon" />
              </div>
              <h3 className="card-heading">Phone</h3>
              <p className="card-content phone-content">{orgData.phoneNumber}</p>
              <a href={`tel:${orgData.phoneNumber}`} className="card-link">
                Call Us
              </a>
            </div>

            {/* Address Card */}
            <div className="support-card address-card">
              <div className="card-icon-wrapper address-icon-wrapper">
                <FaMapMarkerAlt className="card-icon" />
              </div>
              <h3 className="card-heading">Address</h3>
              <p className="card-content address-content">{orgData.address}</p>
              <div className="card-link-placeholder">Visit Us</div>
            </div>

            {/* Feedback Card */}
            <div className="support-card feedback-card feedback-card-full">
              <div className="feedback-header">
                <div className="card-icon-wrapper feedback-icon-wrapper">
                  <FaCommentDots className="card-icon" />
                </div>
                <h3 className="card-heading">Send Feedback</h3>
              </div>
              <p className="feedback-description">We'd love to hear from you. Share your thoughts and suggestions.</p>
              <textarea 
                className="feedback-textarea"
                placeholder="Write your feedback here..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={submitLoading}
                rows="5"
              />
              <button 
                className={`submit-button ${submitSuccess ? 'success' : ''}`}
                onClick={handleSendFeedback}
                disabled={submitLoading || submitSuccess}
              >
                {submitLoading && <span className="loading-spinner"></span>}
                {submitSuccess ? 'Feedback Sent!' : (
                  <>
                    <FaPaperPlane className="button-icon" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
