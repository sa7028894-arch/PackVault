import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/list-packages')
      .then(res => setPackages(res.data))
      .catch(err => console.error("Error fetching packages:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>PackVault Dashboard</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Path</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id}>
              <td>{pkg.name}</td>
              <td>{pkg.version}</td>
              <td>{pkg.local_path}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;