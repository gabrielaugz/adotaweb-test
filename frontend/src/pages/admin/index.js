// frontend/src/pages/admin/index.js
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/api'
import { getAdoptionRequests } from '../../api/adoptionRequests'

export default function AdminPage() {
  const [pets, setPets] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openPetId, setOpenPetId] = useState(null)
  const [requestsByPet, setRequestsByPet] = useState({})
  const [requestsLoaded, setRequestsLoaded] = useState({})
  const navigate = useNavigate()

  // 1) Carrega lista de pets
  useEffect(() => {
    async function loadPets() {
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
    loadPets()
  }, [])

  // 2) Ao expandir um pet, carrega suas solicitações SE necessário
  useEffect(() => {
    if (openPetId !== null && !requestsLoaded[openPetId]) {
      getAdoptionRequests(openPetId)
        .then(resp => {
          // Garante que só existam os 3 status válidos
          const validatedRequests = resp.requests.map(req => ({
            ...req,
            status: ['approved', 'denied', 'pending'].includes(req.status) 
              ? req.status 
              : 'pending'
          }))
          
          setRequestsByPet(prev => ({
            ...prev,
            [openPetId]: validatedRequests
          }))
          
          setRequestsLoaded(prev => ({
            ...prev,
            [openPetId]: true
          }))
        })
        .catch(console.error)
    }
  }, [openPetId, requestsLoaded])

  // 3) Remove um animal
  async function handleDeletePet(petId) {
    if (!window.confirm('Remover este animal?')) return
    const res = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
      method: 'DELETE'
    })
    if (res.status === 204) {
      setPets(p => p.filter(x => x.id !== petId))
      // Remove também do estado de solicitações
      setRequestsByPet(prev => {
        const copy = { ...prev }
        delete copy[petId]
        return copy
      })
      setRequestsLoaded(prev => {
        const copy = { ...prev }
        delete copy[petId]
        return copy
      })
    } else {
      alert('Falha ao remover animal')
    }
  }

  // 4) Aprova uma solicitação
  async function handleApproveRequest(petId, requestId) {
    if (!window.confirm('Aprovar esta solicitação?')) return
  
    try {
      // Atualiza status da solicitação
      const resReq = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      if (!resReq.ok) throw new Error('Falha ao aprovar solicitação')
  
      // Marca pet como indisponível
      const resPet = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unavailable' })
      })
      if (!resPet.ok) throw new Error('Falha ao atualizar status do pet')
  
      // Atualiza UI
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === petId ? { ...pet, status: 'unavailable' } : pet
        )
      )
      
      // Update the request status in the local state
      setRequestsByPet(prev => ({
        ...prev,
        [petId]: (prev[petId] || []).map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      }))
  
      alert('Solicitação aprovada com sucesso!')
    } catch (err) {
      alert(err.message)
    }
  }
  
  // 5) Nega uma solicitação
async function handleDenyRequest(petId, requestId) {
  if (!window.confirm('Negar esta solicitação?')) return
  
  try {
    const res = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ status: 'denied' })
    })
    if (!res.ok) throw new Error('Falha ao negar solicitação')
    
    // Update the request status in the local state
    getAdoptionRequests(petId)
    .then(resp => {
      const validatedRequests = resp.requests.map(req => ({
        ...req,
        status: ['approved', 'denied', 'pending'].includes(req.status) 
          ? req.status 
          : 'pending'
      }))
      setRequestsByPet(prev => ({
        ...prev,
        [petId]: validatedRequests
      }))
    })
  } catch (err) {
    alert(err.message)
  }
}

  if (loading) return <p>Carregando animais...</p>
  if (error) return <p>Erro: {error}</p>

  const filteredPets = pets.filter(p =>
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
            <th>ID</th><th>Nome</th><th>Tipo</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredPets.map(pet => (
            <React.Fragment key={pet.id}>
              <tr>
                <td>{pet.id}</td>
                <td>{pet.name}</td>
                <td>{pet.type}</td>
                <td>{pet.status}</td>
                <td>
                  <Link to={`/admin/edit-pet/${pet.id}`} style={{ marginRight:'0.5rem' }}>
                    ✏️ Editar
                  </Link>
                  <button 
                    onClick={() => handleDeletePet(pet.id)} 
                    style={{ marginRight:'0.5rem' }}
                  >
                    🗑️ Remover
                  </button>
                  <button 
                    onClick={() => setOpenPetId(openPetId === pet.id ? null : pet.id)}
                  >
                    {openPetId === pet.id ? '▲ Ocultar' : '▼ Solicitações'}
                  </button>
                </td>
              </tr>

              {openPetId === pet.id && (
                <tr>
                  <td colSpan="5">
                    {requestsByPet[pet.id]?.length > 0 ? (
                      <ul className="requests-list">
                        {requestsByPet[pet.id].map(request => {
                          const statusInfo = {
                            approved: {
                              text: '✓ APROVADA',
                              color: 'green',
                              icon: '✓'
                            },
                            denied: {
                              text: '✗ NEGADA',
                              color: 'red',
                              icon: '✗'
                            },
                            pending: {
                              text: '⏳ PENDENTE',
                              color: 'orange',
                              icon: '⏳'
                            }
                          }[request.status] || {
                            text: '⏳ PENDENTE',
                            color: 'orange',
                            icon: '⏳'
                          }

                          return (
                            <li 
                              key={request.id}
                              style={{
                                borderLeft: `4px solid ${statusInfo.color}`,
                                padding: '0.5rem 1rem',
                                margin: '0.5rem 0',
                                borderRadius: '4px',
                                backgroundColor: '#f9f9f9'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                  <strong>{request.name}</strong> ({request.email})
                                </div>
                                <span style={{ color: statusInfo.color }}>
                                  {statusInfo.icon} {statusInfo.text}
                                </span>
                              </div>
                              <div style={{ margin: '0.5rem 0' }}>
                                <small>
                                  {new Date(request.created_at).toLocaleString()}
                                </small>
                              </div>
                              <p>{request.message}</p>
                              
                              {request.status === 'pending' && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  <button
                                    onClick={() => handleApproveRequest(pet.id, request.id)}
                                    style={{
                                      marginRight: '0.5rem',
                                      backgroundColor: '#4CAF50',
                                      color: 'white'
                                    }}
                                  >
                                    Aprovar
                                  </button>
                                  <button
                                    onClick={() => handleDenyRequest(pet.id, request.id)}
                                    style={{
                                      backgroundColor: '#f44336',
                                      color: 'white'
                                    }}
                                  >
                                    Negar
                                  </button>
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p style={{ padding: '1rem', textAlign: 'center' }}>
                        Nenhuma solicitação encontrada para este animal.
                      </p>
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