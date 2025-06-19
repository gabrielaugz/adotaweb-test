// src/pages/admin/index.js
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const AdminPage = () => {
  const [pets, setPets]             = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading]   = useState(true)
  const [error, setError]           = useState(null)
  const navigate                    = useNavigate()

  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/admin/animals', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.status === 401) {
          // token inválido ou expirado
          localStorage.removeItem('token')
          return navigate('/admin/login', { replace: true })
        }
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`)
        }
        const data = await res.json()
        setPets(data)    // data é um array vindo do servidor
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPets()
  }, [navigate])

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este animal?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/animals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.status === 204) {
        setPets(prev => prev.filter(pet => pet.id !== id))
        alert('Animal removido com sucesso!')
      } else if (res.status === 401) {
        localStorage.removeItem('token')
        navigate('/admin/login', { replace: true })
      } else {
        const errMsg = await res.text()
        throw new Error(errMsg || res.statusText)
      }
    } catch (err) {
      alert(`Falha ao remover animal: ${err.message}`)
    }
  }

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Carregando animais...</p>
    </div>
  )

  if (error) return (
    <div className="error">
      <p>Erro ao carregar animais: {error}</p>
      <button onClick={() => window.location.reload()} className="btn-retry">
        Tentar novamente
      </button>
    </div>
  )

  return (
    <div className="admin-container">
      <h1>Área do Administrador</h1>

      <div className="admin-actions">
        <Link to="/admin/add-pet" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Adicionar Animal
        </Link>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar animal..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="button" className="search-button" aria-label="Buscar">
            🔍
          </button>
        </div>
      </div>

      <div className="pets-list">
        {filteredPets.length === 0 ? (
          <div className="no-results">
            <p>Nenhum animal encontrado.</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="btn btn-clear">
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Raça</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPets.map(pet => (
                <tr key={pet.id}>
                  <td>{pet.id}</td>
                  <td>{pet.name}</td>
                  <td>{pet.type}</td>
                  <td>{pet.breed}</td>
                  <td>{pet.age} {pet.age === 1 ? 'ano' : 'anos'}</td>
                  <td className="actions">
                    <Link to={`/admin/edit-pet/${pet.id}`} className="btn-icon btn-edit" title="Editar">
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="btn-icon btn-delete"
                      title="Remover"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminPage
