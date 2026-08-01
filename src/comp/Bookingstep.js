import '../Componentcss/Bookingsteps.css';
// Ensure you have installed react-icons: npm install react-icons
import { FaBed, FaUserCheck, FaCreditCard, FaCheck } from 'react-icons/fa';

function BookingSteps({ activeStep = 1 }) {
  const steps = [
    { id: 1, label: "Select Room", icon: <FaBed /> },
    { id: 2, label: "Guest Details", icon: <FaUserCheck /> },
    { id: 3, label: "Payment & Confirm", icon: <FaCreditCard /> }
  ];

  // Calculate progress width (0% to 100%)
  const progressWidth = ((activeStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="bk-stepper-container">
      
      {/* Title Section */}
      <div className="bk-header">
        <span className="bk-subtitle">YOUR JOURNEY</span>
        <h2 className="bk-title">Plan Your Stay</h2>
      </div>

      {/* Stepper Component */}
      <div className="bk-stepper-wrapper">
        
        {/* Background Track */}
        <div className="bk-track"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="bk-progress" 
          style={{ width: `${progressWidth}%` }}
        ></div>

        {/* Steps */}
        <div className="bk-steps-flex">
          {steps.map((step) => {
            const isCompleted = activeStep > step.id;
            const isActive = activeStep === step.id;

            return (
              <div 
                key={step.id} 
                className={`bk-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {/* Circle Icon */}
                <div className="bk-circle">
                  {isCompleted ? <FaCheck /> : step.icon}
                </div>

                {/* Label */}
                <p className="bk-label">{step.label}</p>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}

export default BookingSteps;