// src/frontend/src/pages/admin/EditPet.js
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../../utils/api'

export default function EditPet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [error, setError]     = useState(null)

  // Fetch pet details and map to flat formData
  useEffect(() => {
    fetch(`${API_BASE}/api/animals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setFormData({
          // flat fields matching DB columns
          url: data.photos?.[0]?.medium || data.photoUrl || null,
          type: data.type,
          name: data.name,
          description: data.description,
          age: data.age,
          gender: data.gender,
          size: data.size,
          primary_color: data.colors.primary,
          secondary_color: data.colors.secondary,
          tertiary_color: data.colors.tertiary,
          breed: data.breeds.breed,
          spayed_neutered: data.attributes.spayed_neutered,
          shots_current: data.attributes.shots_current,
          children: data.environment.children,
          dogs: data.environment.dogs,
          cats: data.environment.cats,
          status: data.status
        })
      })
      .catch(err => setError(err.message))
  }, [id])

  function handleChange(e) {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/api/admin/animals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `Erro ${res.status}`)
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="error">Erro: {error}</p>
  if (!formData) return <p>Carregando dados do pet…</p>

  return (
    <div className="edit-pet-container">
      <h1>Editar Pet #{id}</h1>
      <form onSubmit={handleSubmit} className="edit-pet-form">
        <label>
          Nome:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Descrição:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>
        <label>
          Idade:
          <input
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </label>
        {/* adicione demais campos conforme precisar */}
        <button type="submit">Salvar Alterações</button>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="btn-cancel"
        >
          Cancelar
        </button>
      </form>
    </div>
  )
}
