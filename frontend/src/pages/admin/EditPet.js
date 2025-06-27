// frontend\src\pages\admin\EditPet.js

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../../utils/api'


export default function EditPet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState(null)

  // carrega dados do animal ao montar o componente
  useEffect(() => {
    fetch(`${API_BASE}/api/animals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setFormData({
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
          status: data.status
        })
        setImagePreview(data.photos?.[0]?.medium || data.photoUrl || '')
      })
      .catch(err => setError(err.message))
  }, [id])

  // manipula mudanças nos campos do formulário
  function handleChange(e) {
    const { name, type, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // manipula seleção de imagem
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file && file.type !== 'image/png') {
      alert('Apenas arquivos PNG são permitidos.')
      return
    }
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  // envia o formulário com imagem
  async function handleSubmit(e) {
    e.preventDefault()
    
    const formDataToSend = new FormData()

    // adiciona todos os campos do formulário
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })

    // adiciona a imagem, se houver
    if (imageFile) {
      formDataToSend.append('image', imageFile)
    }

    if (formData.url) {
      formDataToSend.append('url', formData.url);
    } 

    try {
      const res = await fetch(`${API_BASE}/api/admin/animals/${id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => null)
        throw new Error(errText || `Erro ${res.status}`)
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('Erro ao atualizar:', err)
      setError(err.message || 'Erro desconhecido')
    }
  }

  // renderiza erro ou carregando
  if (error) return <p className="error">Erro: {error}</p>
  if (!formData) return <p>Carregando dados do pet…</p>

  return (
    <div className="edit-pet-container">
      <h1>Editar Pet #{id}</h1>
      
      <form onSubmit={handleSubmit} className="edit-pet-form">
        {/* Campo de foto */}
        <label>
          Foto do Animal:
          <input
            type="file"
            accept="image/png"
            onChange={handleImageChange}
          />
        </label>

        {/* Prévia da imagem */}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Prévia do animal" style={{ width: '200px', borderRadius: '8px' }} />
          </div>
        )}

        <label>
          Status:
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="adoptable">Disponível para adoção</option>
            <option value="unavailable">Indisponível</option>
          </select>
        </label>

        {/* Campos normais */}
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
          <select name="age" value={formData.age} onChange={handleChange} required>
            <option value="Baby">Filhote</option>
            <option value="Young">Jovem</option>
            <option value="Adult">Adulto</option>
            <option value="Senior">Idoso</option>
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
            <option value="Small">Pequeno</option>
            <option value="Medium">Médio</option>
            <option value="Large">Grande</option>
          </select>
        </label>

        <label>
          Cor Primária:
          <input
            type="text"
            name="primary_color"
            value={formData.primary_color}
            onChange={handleChange}
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
          />
        </label>

        <label>
          Cor Terciária:
          <input
            type="text"
            name="tertiary_color"
            value={formData.tertiary_color}
            onChange={handleChange}
          />
        </label>

        <label>
          Raça:
          <select name="breed" value={formData.breed} onChange={handleChange}>
            <option value={false}>Vira-lata</option>
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

        {/* Botões de ação */}
        <div className="btn-actions">
          <button type="submit">Salvar Alterações</button>
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