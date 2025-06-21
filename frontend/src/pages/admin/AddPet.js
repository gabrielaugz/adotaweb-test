// src/frontend/src/pages/admin/AddPet.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/api'
import './AddPet.css'

export default function AddPet() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    url: '',
    type: 'Dog',
    name: '',
    description: '',
    age: 'baby',             // baby, young, adult, senior
    gender: 'Male',          // Male, Female
    size: 'medium',          // small, medium, large
    primary_color: '',
    secondary_color: '',
    tertiary_color: '',
    breed: false,            // true = "Raça definida", false = "Sem raça definida"
    spayed_neutered: false,  // true = sim, false = não
    shots_current: false     // true = sim, false = não
  })
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/admin/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const text = await res.text().catch(() => null)
        throw new Error(text || `Erro ${res.status}`)
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="add-pet-container">
      <h1>Adicionar Novo Pet</h1>
      {error && <p className="error">Erro: {error}</p>}
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
          <select name="age" value={formData.age} onChange={handleChange} required>
            <option value="baby">Filhote</option>
            <option value="young">Jovem</option>
            <option value="adult">Adulto</option>
            <option value="senior">Idoso</option>
          </select>
        </label>

        <label>
          Sexo:
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="Male">Macho</option>
            <option value="Female">Fêmea</option>
          </select>
        </label>

        <label>
          Tamanho:
          <select name="size" value={formData.size} onChange={handleChange} required>
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </label>

        <label>
          Cor Primária:
          <input
            type="text"
            name="primary_color"
            value={formData.primary_color}
            onChange={handleChange}
            placeholder="Ex: Marrom"
          />
        </label>

        <label>
          Cor Secundária:
          <input
            type="text"
            name="secondary_color"
            value={formData.secondary_color}
            onChange={handleChange}
            placeholder="Ex: Branco"
          />
        </label>

        <label>
          Cor Terciária:
          <input
            type="text"
            name="tertiary_color"
            value={formData.tertiary_color}
            onChange={handleChange}
            placeholder="Ex: Preto"
          />
        </label>

        <label>
          Raça:
          <select name="breed" value={formData.breed} onChange={handleChange}>
            <option value={false}>Sem raça definida</option>
            <option value={true}>Raça definida</option>
          </select>
        </label>

        <label>
          Castrado:
          <select name="spayed_neutered" value={formData.spayed_neutered} onChange={handleChange}>
            <option value={false}>Não</option>
            <option value={true}>Sim</option>
          </select>
        </label>

        <label>
          Vacinado:
          <select name="shots_current" value={formData.shots_current} onChange={handleChange}>
            <option value={false}>Não</option>
            <option value={true}>Sim</option>
          </select>
        </label>

        <button type="submit">Salvar</button>
        <button type="button" onClick={() => navigate('/admin')} className="btn-cancel">
          Cancelar
        </button>
      </form>
    </div>
  )
}
