import React, { useEffect, useState } from 'react';

const WelcomePage = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
    else setGreeting('Good Night');
  }, []);

  const primaryColor = '#d25d78';

  const styles = {
    container: {
      position: "absolute", top: 0, width: '100%',
      height: '100%',
      // width: "100vw",
      background: 'linear-gradient(to right, #fff0f3, #ffe5ea)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '0 0',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    content: {
      maxWidth: '800px',
      padding: '4rem 6rem 0 6rem',
    },
    greeting: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: '1rem',
      textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '600',
      color: '#b0415b',
      marginBottom: '1rem',
    },
    paragraph: {
      fontSize: '1.15rem',
      color: '#444',
      marginBottom: '1rem',
      lineHeight: 1.7,
    },
    listItem: {
      fontSize: '1.05rem',
      marginBottom: '0.7rem',
    },
    button: {
      marginTop: '2rem',
      backgroundColor: primaryColor,
      color: '#fff',
      border: 'none',
      padding: '0.9rem 2rem',
      fontSize: '1rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      boxShadow: '0 4px 12px rgba(210, 93, 120, 0.3)',
    },
    waveContainer: {
      // marginTop: '4rem',
      overflow: 'hidden',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.greeting}>{greeting} 👋</h1>
        <h2 style={styles.title}>Welcome to Bhumi Registry</h2>
        <p style={styles.paragraph}>
          <strong>Bhumi Registry</strong> is a simple, secure, and cloud-based logbook automation tool. It lets you fill forms 
          online with minimal input and access your data anytime, from anywhere. Designed with a user-friendly interface, 
          it makes record-keeping faster, easier, and more reliable.
        </p>
        <ul>
          <li style={styles.listItem}>📋 Fill raw material inspection forms efficiently</li>
          <li style={styles.listItem}>✅ Enable multi-level form approvals with ease</li>
          <li style={styles.listItem}>📊 Centralized access to quality records and reports</li>
        </ul>
        {/* <button
          style={styles.button}
          // onClick={() => alert('Navigating to Dashboard...')}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b0415b';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = primaryColor;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Start Explore
        </button> */}
      </div>

      {/* SVG Wave */}
      <div style={styles.waveContainer}>
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#ffe5ea"
            d="M0,128L60,144C120,160,240,192,360,186.7C480,181,600,139,720,122.7C840,107,960,117,1080,122.7C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default WelcomePage;
