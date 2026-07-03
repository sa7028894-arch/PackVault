import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({ name: '', version: '', path: '' });

  const fetchPackages = () => {
    fetch('http://localhost:5000/api/packages')
      .then(res => res.json())
      .then(data => setPackages(data))
      .catch(err => console.error("Error fetching packages:", err));
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', version: '', path: '' });
    fetchPackages();
  };

  const deletePackage = async (name) => {
    await fetch(`http://localhost:5000/api/packages/${name}`, {
      method: 'DELETE',
    });
    fetchPackages();
  };

  return (
    <div className="App">
      <h1>PackVault Dashboard</h1>
      
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input placeholder="Version" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} required />
        <input placeholder="Path" value={formData.path} onChange={e => setFormData({...formData, path: e.target.value})} required />
        <button type="submit">Add Package</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Path</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, index) => (
            <tr key={index}>
              <td>{pkg.name}</td>
              <td>{pkg.version}</td>
              <td>{pkg.path}</td>
              <td>
                <button onClick={() => deletePackage(pkg.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;