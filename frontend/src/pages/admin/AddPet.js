// src/frontend/src/pages/admin/AddPet.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../utils/api';

export default function AddPet() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: '',
    type: 'Dog',
    name: '',
    description: '',
    age: '',
    gender: '',
    size: '',
    primary_color: '',
    secondary_color: '',
    tertiary_color: '',
    breed: false,
    spayed_neutered: false,
    shots_current: false,
    children: false,
    dogs: false,
    cats: false,
    status: 'available'
  });
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Erro ${res.status}`);
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="add-pet-container">
      <h1>Adicionar Novo Pet</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="add-pet-form">
        <label>
          Tipo:
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option>Dog</option>
            <option>Cat</option>
          </select>
        </label>
        <label>
          Nome:
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          Descrição:
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>
        <label>
          Idade:
          <input name="age" value={formData.age} onChange={handleChange} />
        </label>
        <button type="submit">Salvar</button>
        <button type="button" onClick={() => navigate('/admin')} className="btn-cancel">
          Cancelar
        </button>
      </form>
    </div>
  );
}
