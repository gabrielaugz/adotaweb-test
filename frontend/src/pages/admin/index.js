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

  // Função para carregar solicitações de um pet
  const loadRequests = async (petId) => {
    try {
      const resp = await getAdoptionRequests(petId)
      return resp.requests
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error)
      return []
    }
  }

  // 3) Remove um animal
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

  // 4) Aprova uma solicitação: atualiza status da solicitação e do pet
  async function handleApproveRequest(petId, requestId) {
    if (!window.confirm('Aprovar esta solicitação?')) return
  
    // aprovar a própria solicitação
    const resReq = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    })
    if (!resReq.ok) {
      alert('Falha ao aprovar solicitação')
      return
    }
  
    // marcar pet como indisponível
    const resPet = await fetch(`${API_BASE}/api/admin/animals/${petId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'unavailable' })
    })
    if (!resPet.ok) {
      alert('Falha ao marcar pet como indisponível')
      return
    }
  
    // Atualizar UI - MANTÉM O PET NA LISTA, APENAS ATUALIZA O STATUS
    setPets(prevPets => 
      prevPets.map(pet => 
        pet.id === petId 
          ? { ...pet, status: 'unavailable' } 
          : pet
      )
    )
  
    alert('Solicitação aprovada. O pet foi marcado como indisponível.')
  }

  // 5) Nega (denies) uma solicitação sem apagar o registro
  async function handleDenyRequest(petId, requestId) {
    if (!window.confirm('Negar esta solicitação?')) return
    const res = await fetch(`${API_BASE}/api/adoptions/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ status: 'denied' })
    })
    if (!res.ok) {
      alert('Falha ao negar solicitação')
      return
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
                    <PetRequests 
                      petId={pet.id} 
                      onApprove={handleApproveRequest} 
                      onDeny={handleDenyRequest} 
                    />
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

// Componente separado para lidar com solicitações
function PetRequests({ petId, onApprove, onDeny }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const resp = await getAdoptionRequests(petId)
        setRequests(resp.requests)
      } catch (error) {
        console.error('Erro ao carregar solicitações:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRequests()
  }, [petId])

  if (loading) return <p>Carregando solicitações...</p>
  
  return (
    <>
      {requests.length > 0 ? (
        <ul>
          {requests.map(r => (
            <li key={r.id} style={{ 
              marginBottom: '1rem',
              borderLeft: r.status === 'approved' ? '4px solid green' : 
                         r.status === 'denied' ? '4px solid red' : 'none',
              paddingLeft: '8px'
            }}>
              <div>
                <strong>{r.name}</strong> ({r.email}) —{' '}
                {new Date(r.created_at).toLocaleString()}
                {r.status === 'approved' && <span style={{ color: 'green', marginLeft: '8px' }}>✓ APROVADA</span>}
                {r.status === 'denied' && <span style={{ color: 'red', marginLeft: '8px' }}>✗ NEGADA</span>}
              </div>
              <p>{r.message}</p>
              
              {/* Mostrar botões apenas se não estiver resolvida */}
              {!r.status && (
                <>
                  <button
                    onClick={() => onApprove(petId, r.id)}
                    style={{ marginRight: '0.5rem' }}
                  >
                    Aprovar Solicitação
                  </button>
                  <button
                    onClick={() => onDeny(petId, r.id)}
                    style={{ color: 'red' }}
                  >
                    Negar Solicitação
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem solicitações para este animal.</p>
      )}
    </>
  )
}