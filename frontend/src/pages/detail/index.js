import React, { useEffect, useState } from 'react';
import { getPetDetails } from '../../api/petfinder';
import { useParams, Navigate, useNavigate } from 'react-router-dom';

const PetDetailsPage = () => {
  //window.scrollTo(0, 0);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    message: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    async function getPetsData() {
      try {
        const petsData = await getPetDetails(id);
        setData(petsData);
        setError(false);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    }

    getPetsData();
  }, [id]);

  const handleAdoptionClick = () => {
    setShowAdoptionForm(true);
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar o formulário
    console.log('Dados do formulário:', { petId: id, ...formData });
    // Simulando envio bem-sucedido
    alert('Formulário enviado com sucesso! Entraremos em contato em breve.');
    setShowAdoptionForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      experience: '',
      message: ''
    });
  };

  return (
    <div>
      {loading ? (
        <h3>Carregando...</h3>
      ) : error ? (
        <Navigate to='/detalhes-nao-encontrados'/>
      ) : (
        <main>
          <div className="pet-detail">
            <div className="pet-image-container">
              <img
                className="pet-image"
                src={data.photos[0]?.medium || './media/aEcJUFK.png'}
                alt={`Foto de ${data.name}`}
              />
            </div>
            <div className="pet-detail-info">
              <h1>{data.name}</h1>
              <p><b>Raça:</b> {data.breeds.primary || 'Desconhecida'}</p>
              <p><b>Cor:</b> {data.colors.primary || 'Desconhecida'}</p>
              <p><b>Sexo:</b> {data.gender === 'Male' ? 'Macho' : 
                        data.gender === 'Female' ? 'Fêmea' : 
                        data.gender}</p>
              {data.contact?.address?.city || data.contact?.address?.state ? (
                <p><b>Cidade:</b> {`${data.contact.address.city} - ${data.contact.address.state}`}</p>
                  ) : ( <p><b>Cidade:</b> Não informado</p>
              )}
              <b>Descrição:</b>
              <p>{data.description || 'Nenhuma descrição disponível.'}</p>
              
              <div className="pet-detail-actions">
                <button 
                  onClick={handleAdoptionClick}
                  className="adoption-button"
                >
                  Quero Adotar
                </button>
                <button 
                  onClick={handleGoBack}
                  className="secondary-button"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>

          {showAdoptionForm && (
            <div className="adoption-form-container">
              <h2>Formulário de Adoção para {data.name}</h2>
              <form onSubmit={handleFormSubmit} className="adoption-form">
                <div className="form-group">
                  <label htmlFor="name">Nome Completo*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefone*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Endereço*</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Você já teve pets antes?*</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="yes">Sim, tenho experiência</option>
                    <option value="no">Não, será meu primeiro pet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Por que você quer adotar {data.name}?*</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Enviar Solicitação
                  </button>
                  <button 
                    type="button" 
                    className="secondary-button"
                    onClick={() => setShowAdoptionForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default PetDetailsPage;