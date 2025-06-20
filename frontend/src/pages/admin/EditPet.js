import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../../utils/api'

export default function EditPet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [error, setError]     = useState(null)

  // 1) buscar dados atuais do pet
  useEffect(() => {
    fetch(`${API_BASE}/api/animals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setFormData(data))
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
        const t = await res.text()
        throw new Error(t || `Erro ${res.status}`)
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
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Descrição:
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
          />
        </label>
        <label>
          Idade:
          <input
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
          />
        </label>
        {/* … outros campos que quiser editar … */}
        <button type="submit">Salvar Alterações</button>
        <button type="button" onClick={() => navigate('/admin')} className="btn-cancel">
          Cancelar
        </button>
      </form>
    </div>
  )
}
