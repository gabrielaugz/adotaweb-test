import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockPets = [
          { id: 1, name: 'Rex', type: 'dog', breed: 'Labrador', age: 3 },
          { id: 2, name: 'Mimi', type: 'cat', breed: 'Siamese', age: 2 },
          { id: 3, name: 'Buddy', type: 'dog', breed: 'Golden Retriever', age: 5 },
          { id: 4, name: 'Luna', type: 'cat', breed: 'Persa', age: 1 },
          { id: 5, name: 'Max', type: 'dog', breed: 'Bulldog', age: 4 }
        ];
        
        setPets(mockPets);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover este animal?')) {
      setPets(pets.filter(pet => pet.id !== id));
      alert('Animal removido com sucesso!');
    }
  };

  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Carregando animais...</p>
    </div>
  );

  if (error) return (
    <div className="error">
      <p>Erro ao carregar animais: {error}</p>
      <button onClick={() => window.location.reload()} className="btn-retry">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="admin-container">
      <h1>Área do Administrador</h1>
      
      <div className="admin-actions">
        <Link to="/admin/add-pet" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Adicionar Animal
        </Link>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar animal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" className="search-button" aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
            </svg>
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
                    <Link to={`/admin/edit-pet/${pet.id}`} className="btn-icon btn-edit" aria-label="Editar animal" title="Editar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                      </svg>
                    </Link>
                    <button onClick={() => handleDelete(pet.id)} className="btn-icon btn-delete" aria-label="Remover animal" title="Remover">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;