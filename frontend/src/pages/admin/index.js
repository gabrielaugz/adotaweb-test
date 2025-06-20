// src/frontend/src/pages/admin/index.js
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/api'
import { getAdoptionRequests } from '../../api/adoptionRequests'

export default function AdminPage() {
  const [pets, setPets]             = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)
  const [openPetId, setOpenPetId]   = useState(null)
  const [requestsByPet, setRequestsByPet] = useState({})
  const navigate                    = useNavigate()

  // Carrega lista de pets
  useEffect(() => {
    async function fetchPets() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/admin/animals`)
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`)
        const data = await res.json()
        setPets(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPets()
  }, [])

  // Carrega solicitações ao abrir cada pet
  useEffect(() => {
    if (openPetId !== null) {
      getAdoptionRequests(openPetId)
        .then(resp => {
          setRequestsByPet(prev => ({
            ...prev,
            [openPetId]: resp.requests
          }))
        })
        .catch(console.error)
    }
  }, [openPetId])

  // Exclui um pet
  const handleDeletePet = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este animal?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/animals/${id}`, {
        method: 'DELETE'
      })
      if (res.status === 204) {
        setPets(prev => prev.filter(p => p.id !== id))
      } else {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
    } catch (err) {
      alert('Falha ao remover animal: ' + err.message)
    }
  }

  // Aprova adoção (altera status do pet)
  const handleApprovePet = async (petId) => {
    if (!window.confirm('Aprovar adoção deste pet?')) return
    try {
      const res = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'adopted' })
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      // opcional: remover da lista
      setPets(prev => prev.filter(p => p.id !== petId))
    } catch (err) {
      alert('Falha ao aprovar pet: ' + err.message)
    }
  }

  // Exclui uma solicitação específica
  const handleDeleteRequest = async (petId, requestId) => {
    if (!window.confirm('Excluir esta solicitação?')) return
    try {
      const res = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'DELETE'
      })
      if (res.status === 204) {
        setRequestsByPet(prev => ({
          ...prev,
          [petId]: prev[petId].filter(r => r.id !== requestId)
        }))
      } else {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
    } catch (err) {
      alert('Falha ao excluir solicitação: ' + err.message)
    }
  }

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <p>Carregando animais...</p>
  if (error)   return <p>Erro ao carregar animais: {error}</p>

  return (
    <div className="admin-container">
      <h1>Área do Administrador</h1>

      <div className="admin-actions">
        <Link to="/admin/add-pet" className="btn btn-primary">
          + Adicionar Animal
        </Link>
        <input
          type="text"
          placeholder="Buscar animal..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginLeft: '1rem' }}
        />
      </div>

      <table className="pets-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredPets.map(pet => (
            <React.Fragment key={pet.id}>
              <tr>
                <td>{pet.id}</td>
                <td>{pet.name}</td>
                <td>{pet.type}</td>
                <td>
                  <button onClick={() => handleApprovePet(pet.id)}>
                    Aprovar
                  </button>
                  <button onClick={() => handleDeletePet(pet.id)} style={{ marginLeft: '0.5rem' }}>
                    🗑️
                  </button>
                  <button
                    onClick={() => setOpenPetId(openPetId === pet.id ? null : pet.id)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {openPetId === pet.id ? 'Ocultar Solicitações' : 'Ver Solicitações'}
                  </button>
                </td>
              </tr>
              {openPetId === pet.id && (
                <tr>
                  <td colSpan="4">
                    {requestsByPet[pet.id]?.length > 0 ? (
                      <ul>
                        {requestsByPet[pet.id].map(r => (
                          <li key={r.id} style={{ marginBottom: '1rem' }}>
                            <div>
                              <strong>{r.name}</strong> ({r.email}) —{' '}
                              {new Date(r.created_at).toLocaleString()}
                            </div>
                            <p>{r.message}</p>
                            <button
                              onClick={() => handleDeleteRequest(pet.id, r.id)}
                              style={{ color: 'red' }}
                            >
                              Excluir Solicitação
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Sem solicitações para este animal.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
