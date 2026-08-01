import React from 'react';
import '../Componentcss/small.css';

function Small() {
    // Data array makes it easier to manage content
    const stats = [
        {
            id: 1,
            number: "150+",
            label: "Luxury Rooms",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
            )
        },
        {
            id: 2,
            number: "12k+",
            label: "Happy Guests",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            )
        },
        {
            id: 3,
            number: "4.8",
            label: "Star Rating",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            )
        },
        {
            id: 4,
            number: "10+",
            label: "Years Service",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            )
        }
    ];

    return (
        <section className="stats-section">
            <div className="stats-container">
                {stats.map((item) => (
                    <div key={item.id} className="stat-card">
                        <div className="stat-icon-circle">
                            {item.icon}
                        </div>
                        <div className="stat-info">
                            <h3 className="stat-number">{item.number}</h3>
                            <p className="stat-label">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Small;