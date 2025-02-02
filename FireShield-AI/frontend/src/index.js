import React from 'react';
import ReactDOM from 'react-dom/client'; // Note: Import from 'react-dom/client' in React 18
import App from './App';
import './styles/main.css';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<App />);
