import api from '../utils/api';

// Instead of using axios directly to return JSON, we often want to trigger a download
// for CSVs. We can use a direct link or fetch blob and create object URL.
// The base API URL depends on the environment.

const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'https://kaammitra-backend.onrender.com/api/v1'; // Update to exact Render backend URL if different
    }
    return 'http://localhost:5000/api/v1';
};

export const downloadReport = (type, params = {}) => {
    // Generate query string
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token');
    
    // To download securely, we should fetch as blob and create a link.
    // That allows us to pass the Authorization header.
    return fetch(`${getBaseUrl()}/admin/exports/${type}.csv?${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kaammitra-${type}-report.csv`;
        document.body.appendChild(a); // append the element to the dom
        a.click();
        a.remove(); // afterwards, remove the element  
        window.URL.revokeObjectURL(url);
    });
};
