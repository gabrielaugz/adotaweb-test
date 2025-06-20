// src/frontend/src/pages/admin/index.js
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/api'
import { getAdoptionRequests } from '../../api/adoptionRequests'

export default function AdminPage() {
  const [pets, setPets]             = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [openPetId, setOpenPetId]   = useState(null)
  const [requestsByPet, setRequestsByPet] = useState({})
  const navigate = useNavigate()

  // load pets
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/api/admin/animals`)
        if (!res.ok) throw new Error(res.statusText)
        setPets(await res.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // when expanding a pet, load its adoption requests
  useEffect(() => {
    if (openPetId !== null) {
      getAdoptionRequests(openPetId)
        .then(resp =>
          setRequestsByPet(prev => ({
            ...prev,
            [openPetId]: resp.requests
          }))
        )
        .catch(console.error)
    }
  }, [openPetId])

  // delete pet
  async function handleDeletePet(petId) {
    if (!window.confirm('Remover este animal?')) return
    const res = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
      method: 'DELETE'
    })
    if (res.status === 204) {
      setPets(p => p.filter(x => x.id !== petId))
    } else {
      alert('Falha ao remover animal')
    }
  }

  // approve a specific request (and mark pet unavailable)
  async function handleApproveRequest(petId, requestId) {
    if (!window.confirm('Aprovar esta solicitação?')) return

    // 1) update request status
    const res1 = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    })
    if (!res1.ok) {
      alert('Falha ao aprovar solicitação')
      return
    }

    // 2) update pet status
    const res2 = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'unavailable' })
    })
    if (!res2.ok) {
      alert('Falha ao marcar pet como indisponível')
      return
    }

    // remove pet from list
    setPets(p => p.filter(x => x.id !== petId))
    alert('Solicitação aprovada e pet removido do catálogo')
  }

  // delete a specific request
  async function handleDeleteRequest(petId, requestId) {
    if (!window.confirm('Excluir esta solicitação?')) return
    const res = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
      method: 'DELETE'
    })
    if (res.status === 204) {
      setRequestsByPet(prev => ({
        ...prev,
        [petId]: prev[petId].filter(r => r.id !== requestId)
      }))
    } else {
      alert('Falha ao excluir solicitação')
    }
  }

  if (loading) return <p>Carregando animais...</p>
  if (error)   return <p>Erro: {error}</p>

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <th>ID</th><th>Nome</th><th>Tipo</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(pet => (
            <React.Fragment key={pet.id}>
              <tr>
                <td>{pet.id}</td>
                <td>{pet.name}</td>
                <td>{pet.type}</td>
                <td>
                  <Link to={`/admin/edit-pet/${pet.id}`} style={{ marginRight:'0.5rem' }}>
                    ✏️
                  </Link>
                  <button onClick={() => handleDeletePet(pet.id)} style={{ marginRight:'0.5rem' }}>
                    🗑️
                  </button>
                  <button onClick={() => setOpenPetId(openPetId===pet.id?null:pet.id)}>
                    {openPetId===pet.id ? 'Ocultar Solicitações' : 'Ver Solicitações'}
                  </button>
                </td>
              </tr>
              {openPetId === pet.id && (
                <tr>
                  <td colSpan="4">
                    {requestsByPet[pet.id]?.length > 0 ? (
                      <ul>
                        {requestsByPet[pet.id].map(r => (
                          <li key={r.id} style={{ marginBottom:'1rem' }}>
                            <div>
                              <strong>{r.name}</strong> ({r.email}) –{' '}
                              {new Date(r.created_at).toLocaleString()}
                            </div>
                            <p>{r.message}</p>
                            <button
                              onClick={() => handleApproveRequest(pet.id, r.id)}
                              style={{ marginRight:'0.5rem' }}
                            >
                              Aprovar Solicitação
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(pet.id, r.id)}
                              style={{ color:'red' }}
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
