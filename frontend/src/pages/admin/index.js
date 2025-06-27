// frontend\src\pages\admin\index.js

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

  // carrega a lista de animais ao montar o componente
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

  // carrega as solicitações de adoção para o animal aberto
  useEffect(() => {
    if (openPetId !== null && !requestsLoaded[openPetId]) {
      getAdoptionRequests(openPetId)
        .then(resp => {
          const validatedRequests = resp.requests.map(req => ({
            ...req,
            status: ['approved', 'denied', 'pending'].includes(req.status) ? req.status : 'pending'
          }))
          setRequestsByPet(prev => ({ ...prev, [openPetId]: validatedRequests }))
          setRequestsLoaded(prev => ({ ...prev, [openPetId]: true }))
        })
        .catch(console.error)
    }
  }, [openPetId, requestsLoaded])

  // manipula a remoção de um animal
  async function handleDeletePet(petId) {
    if (!window.confirm('Remover este animal?')) return
    const res = await fetch(`${API_BASE}/api/admin/animals/${petId}`, { method: 'DELETE' })
    if (res.status === 204) {
      setPets(p => p.filter(x => x.id !== petId))
      setRequestsByPet(prev => { const copy = { ...prev }; delete copy[petId]; return copy })
      setRequestsLoaded(prev => { const copy = { ...prev }; delete copy[petId]; return copy })
    } else {
      alert('Falha ao remover animal')
    }
  }

  // manipula a aprovação de uma solicitação de adoção
  async function handleApproveRequest(petId, requestId) {
    if (!window.confirm('Aprovar esta solicitação?')) return
    try {
      await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unavailable' })
      })
      setPets(prev => prev.map(pet => pet.id === petId ? { ...pet, status: 'unavailable' } : pet))
      const updatedResp = await getAdoptionRequests(petId)
      const validatedRequests = updatedResp.requests.map(req => ({
        ...req,
        status: ['approved', 'denied', 'pending'].includes(req.status) ? req.status : 'pending'
      }))
      setRequestsByPet(prev => ({ ...prev, [petId]: validatedRequests }))
      alert('Solicitação aprovada com sucesso!')
    } catch (err) {
      alert(err.message)
    }
  }

  // manipula a negação de uma solicitação de adoção
  async function handleDenyRequest(petId, requestId) {
    if (!window.confirm('Negar esta solicitação?')) return
    try {
      await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ status: 'denied' })
      })
      const resp = await getAdoptionRequests(petId)
      const validatedRequests = resp.requests.map(req => ({
        ...req,
        status: ['approved', 'denied', 'pending'].includes(req.status) ? req.status : 'pending'
      }))
      setRequestsByPet(prev => ({ ...prev, [petId]: validatedRequests }))
    } catch (err) {
      alert(err.message)
    }
  }

  // filtra os animais com base no termo de busca
  const filteredPets = pets.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="loading"><div className="spinner"></div><p>Carregando animais...</p></div>
  if (error) return <div className="error"><p>Erro: {error}</p></div>

  return (
    <div className="admin-container">
      <h1>Área do Administrador</h1>
      <div className="admin-actions">
        <Link to="/admin/add-pet" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Adicionar Animal
        </Link>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar animal..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
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
                <td>
                  <span className={`status ${pet.status}`}>
                    {pet.status === 'adoptable' ? '✅ Disponível' : '🚫 Indisponível'}
                  </span><br />
                  <small>
                    Última alteração: {pet.status_changed_at ? new Date(pet.status_changed_at).toLocaleString() : 'N/A'}
                  </small>
                </td>
                <td className="actions">
                  <Link
                    to={`/admin/edit-pet/${pet.id}`}
                    className="btn-icon btn-edit"
                    aria-label="Editar animal"
                    title="Editar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor" />
                    </svg>
                  </Link>

                  <button
                    onClick={() => handleDeletePet(pet.id)}
                    className="btn-icon btn-delete"
                    aria-label="Remover animal"
                    title="Remover"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                    </svg>
                  </button>

                  <button
                    onClick={() => setOpenPetId(openPetId === pet.id ? null : pet.id)}
                    className="btn-icon btn-toggle"
                    aria-label={openPetId === pet.id ? 'Ocultar solicitações' : 'Ver solicitações'}
                    title={openPetId === pet.id ? 'Ocultar solicitações' : 'Ver solicitações'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      {openPetId === pet.id ? (
                        <path d="M7 14l5-5 5 5H7z" fill="currentColor" />
                      ) : (
                        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                      )}
                    </svg>
                  </button>
                  </td>
                  </tr>

                  {openPetId === pet.id && (
                    <tr>
                      <td colSpan="5">
                        {requestsByPet[pet.id]?.length > 0 ? (
                          <div className="requests-panel">
                            <ul className="requests-list">
                              {requestsByPet[pet.id].map(request => {
                                const statusInfo = {
                                  approved: { text: '✓ APROVADA', color: 'green' },
                                  denied: { text: '✗ NEGADA', color: 'red' },
                                  pending: { text: '⏳ PENDENTE', color: 'orange' }
                                }[request.status] || { text: '⏳ PENDENTE', color: 'orange' };

                                return (
                                  <li
                                    key={request.id}
                                    className="request-card"
                                    style={{ borderLeft: `4px solid ${statusInfo.color}` }}
                                  >
                                    <div className="request-card-header">
                                      <div className="request-user">
                                        <strong>{request.name}</strong>
                                        <br />
                                        <span className="email">{request.email}</span>
                                      </div>
                                      <span
                                        className="status-text"
                                        style={{ color: statusInfo.color }}
                                      >
                                        {statusInfo.text}
                                      </span>
                                    </div>

                                    <div className="request-meta">
                                      <small>{new Date(request.created_at).toLocaleString()}</small>
                                    </div>

                                    <p className="request-message">{request.message}</p>

                                    {request.status === 'pending' && (
                                      <div className="request-actions">
                                        <button
                                          onClick={() => handleApproveRequest(pet.id, request.id)}
                                          className="btn-approve"
                                        >
                                          Aprovar
                                        </button>
                                        <button
                                          onClick={() => handleDenyRequest(pet.id, request.id)}
                                          className="btn-deny"
                                        >
                                          Negar
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <p className="no-requests">
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