// frontend\src\pages\admin\AddPet.js

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/api'

// função para adicionar um novo pet
export default function AddPet() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    organization_fk: '',
    type: 'Dog',
    name: '',
    description: '',
    age: 'baby',
    gender: 'Male',
    size: 'medium',
    primary_color: '',
    secondary_color: '',
    tertiary_color: '',
    breed: false,
    spayed_neutered: false,
    shots_current: false,
    status: 'adoptable'
  })

  useEffect(() => {
    fetch(`${API_BASE}/api/organizations`)
      .then(res => res.json())
      .then(data => setOrgs(data.organizations || []))
      .catch(err => console.error('Falha ao carregar ONGs:', err))
  }, [])

  function handleChange(e) {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file && file.type !== 'image/png') {
      alert('Apenas arquivos PNG são permitidos.')
      return
    }
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.organization_fk) {
      setError('Selecione uma ONG.')
      return
    }
    
    if (!imageFile) {
      setError('Selecione uma imagem para o pet.')
      return
    }
    
    setError(null)
    
    const formDataToSend = new FormData()
    
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })
    
    if (imageFile) {
      formDataToSend.append('image', imageFile)
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/animals`, {
        method: 'POST',
        body: formDataToSend
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
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="add-pet-form">
        {/* Campo de upload de foto */}
        <label>
          Foto do Animal* (PNG):
          <input
            type="file"
            accept="image/png"
            onChange={handleImageChange}
            required
          />
        </label>
        
        {/* Pré-visualização da imagem */}
        {imagePreview && (
          <div className="image-preview">
            <img 
              src={imagePreview} 
              alt="Pré-visualização" 
              style={{ width: '200px', borderRadius: '8px' }} 
            />
          </div>
        )}

        {/* Select de ONG */}
        <label>
          Organização*:
          <select
            name="organization_fk"
            value={formData.organization_fk}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            {orgs.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo*:
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option>Dog</option>
            <option>Cat</option>
          </select>
        </label>

        <label>
          Nome*:
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Descrição:
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>

        <label>
          Idade*:
          <select name="age" value={formData.age} onChange={handleChange} required>
            <option value="baby">Filhote</option>
            <option value="young">Jovem</option>
            <option value="adult">Adulto</option>
            <option value="senior">Idoso</option>
          </select>
        </label>

        <label>
          Sexo*:
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="Male">Macho</option>
            <option value="Female">Fêmea</option>
          </select>
        </label>

        <label>
          Tamanho*:
          <select name="size" value={formData.size} onChange={handleChange} required>
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </label>

        <label>
          Cor Primária*:
          <input
            type="text"
            name="primary_color"
            value={formData.primary_color}
            onChange={handleChange}
            placeholder="Ex: Marrom"
            required
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

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit">Salvar</button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}