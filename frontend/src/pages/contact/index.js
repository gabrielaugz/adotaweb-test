import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const ContactPage = () => {
    window.scrollTo(0, 0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulação de envio
    console.log('Formulário enviado:', formData);
    setSubmitStatus('success');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Em uma aplicação real, você faria uma chamada API aqui
    // fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    //   .then(response => setSubmitStatus('success'))
    //   .catch(error => setSubmitStatus('error'));
  };

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <h1>Fale Conosco</h1>
        <p>Estamos aqui para ajudar você e seu pet</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Informações de Contato</h2>
          
          <div className="contact-method">
            <h3>Email</h3>
            <p>contato@adotaweb.com.br</p>
          </div>
          
          <div className="contact-method">
            <h3>Telefone</h3>
            <p>(11) 98765-4321</p>
          </div>
          
          <div className="contact-method">
            <h3>Endereço</h3>
            <p>Rua dos Pets, 123 - Vila Animal<br/>São Paulo/SP - CEP 01234-567</p>
          </div>
          
          <div className="contact-method">
            <h3>Horário de Atendimento</h3>
            <p>Segunda a Sexta: 9h às 18h<br/>Sábado: 9h às 14h</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Envie sua Mensagem</h2>
          
          {submitStatus === 'success' && (
            <div className="alert success">
              Mensagem enviada com sucesso! Retornaremos em breve.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="alert error">
              Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Assunto</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um assunto</option>
                <option value="adoption">Adoção de Pets</option>
                <option value="partnership">Parcerias</option>
                <option value="donation">Doações</option>
                <option value="support">Suporte Técnico</option>
                <option value="other">Outros</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-button">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;