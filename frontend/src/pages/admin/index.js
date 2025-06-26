// src/frontend/src/pages/admin/index.js
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
          setRequestsByPet(prev => ({
            ...prev,
            [openPetId]: resp.requests
          }))
          // Marca como carregado
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

  // 4) Deferir uma solicitação: atualiza status da solicitação e do pet
  async function handleDeferRequest(petId, requestId) {
    if (!window.confirm('Deferir esta solicitação? Todas as outras serão indeferidas automaticamente.')) return
  
    try {
      // 1. Deferir a solicitação selecionada
      const resReq = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deferido' })
      })
      
      if (!resReq.ok) {
        throw new Error('Falha ao deferir solicitação')
      }
  
      // 2. Indeferir todas as outras solicitações do mesmo pet
      const otherRequests = requestsByPet[petId].filter(r => r.id !== requestId);
      for (const request of otherRequests) {
        await fetch(`${API_BASE}/api/adoptions/${request.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'indeferido' })
        })
      }
  
      // 3. Marcar pet como indisponível
      const resPet = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unavailable' })
      })
      
      if (!resPet.ok) {
        throw new Error('Falha ao marcar pet como indisponível')
      }
  
      // 4. Atualizar UI
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === petId 
            ? { ...pet, status: 'unavailable' } 
            : pet
        )
      )
  
      // Atualizar solicitações
      setRequestsByPet(prev => ({
        ...prev,
        [petId]: (prev[petId] || []).map(req => {
          if (req.id === requestId) {
            return { ...req, status: 'deferido' }
          } else {
            return { ...req, status: 'indeferido' }
          }
        })
      }))
  
      alert('Solicitação deferida. Todas as outras foram indeferidas automaticamente. O pet foi marcado como indisponível.')
    } catch (err) {
      alert(err.message || 'Ocorreu um erro ao processar a solicitação')
    }
  }

  // 5) Indeferir uma solicitação
  async function handleIndeferRequest(petId, requestId) {
    if (!window.confirm('Indeferir esta solicitação?')) return
    try {
      const res = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ status: 'indeferido' })
      })
      
      if (!res.ok) {
        throw new Error('Falha ao indeferir solicitação')
      }
      
      // Atualiza localmente
      setRequestsByPet(prev => ({
        ...prev,
        [petId]: (prev[petId] || []).map(req => 
          req.id === requestId 
            ? { ...req, status: 'indeferido' } 
            : req
        )
      }))
    } catch (err) {
      alert(err.message || 'Ocorreu um erro ao indeferir a solicitação')
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
            <th>ID</th><th>Nome</th><th>Tipo</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(pet => (
            <React.Fragment key={pet.id}>
              <tr>
                <td>{pet.id}</td>
                <td>{pet.name}</td>
                <td>{pet.type}</td>
                <td>{pet.status}</td>
                <td>
                  <Link to={`/admin/edit-pet/${pet.id}`} style={{ marginRight:'0.5rem' }}>
                    ✏️
                  </Link>
                  <button onClick={() => handleDeletePet(pet.id)} style={{ marginRight:'0.5rem' }}>
                    🗑️
                  </button>
                  <button onClick={() => setOpenPetId(openPetId === pet.id ? null : pet.id)}>
                    {openPetId === pet.id ? 'Ocultar Solicitações' : 'Ver Solicitações'}
                  </button>
                </td>
              </tr>

              {openPetId === pet.id && (
                <tr>
                  <td colSpan="5">
                    {requestsByPet[pet.id]?.length > 0 ? (
                      <ul>
                        {requestsByPet[pet.id].map(r => (
                          <li key={r.id} style={{ 
                            marginBottom: '1rem',
                            borderLeft: 
                              r.status === 'deferido' ? '4px solid green' : 
                              r.status === 'indeferido' ? '4px solid red' : 
                              '4px solid yellow',
                            paddingLeft: '8px'
                          }}>
                            <div>
                              <strong>{r.name}</strong> ({r.email}) —{' '}
                              {new Date(r.created_at).toLocaleString()}
                              {r.status === 'deferido' && (
                                <span style={{ color: 'green', marginLeft: '8px' }}>✓ DEFERIDO</span>
                              )}
                              {r.status === 'indeferido' && (
                                <span style={{ color: 'red', marginLeft: '8px' }}>✗ INDEFERIDO</span>
                              )}
                              {!r.status || r.status === 'em_analise' && (
                                <span style={{ color: 'orange', marginLeft: '8px' }}>⧗ EM ANÁLISE</span>
                              )}
                            </div>
                            <p>{r.message}</p>
                            
                            {/* Mostrar botões apenas se estiver em análise */}
                            {(!r.status || r.status === 'em_analise') && (
                              <>
                                <button
                                  onClick={() => handleDeferRequest(pet.id, r.id)}
                                  style={{ marginRight: '0.5rem', background: 'green', color: 'white' }}
                                >
                                  Deferir
                                </button>
                                <button
                                  onClick={() => handleIndeferRequest(pet.id, r.id)}
                                  style={{ background: 'red', color: 'white' }}
                                >
                                  Indeferir
                                </button>
                              </>
                            )}
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