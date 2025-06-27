// frontend\src\pages\contact\index.js 

import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';

// rola a página para o topo quando o componente monta
const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formId = process.env.REACT_APP_FORMSPREE_ID;
  const [state, handleSubmit] = useForm(formId);

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <h1>Fale Conosco</h1>
        <p>Estamos aqui para ajudar você e seu pet</p>
      </div>

      <div className="contact-content">
        {/* Seção de informações de contato */}
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
            <p>
              Rua dos Pets, 123 - Vila Animal<br/>
              São Paulo/SP - CEP 01234-567
            </p>
          </div>
          
          <div className="contact-method">
            <h3>Horário de Atendimento</h3>
            <p>
              Segunda a Sexta: 9h às 18h<br/>
              Sábado: 9h às 14h
            </p>
          </div>
        </div>

        {/* Seção do formulário */}
        <div className="contact-form-container">
          <h2>Envie sua Mensagem</h2>

          {state.succeeded && (
            <div className="alert success">
              Mensagem enviada com sucesso! Retornaremos em breve.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            {/* Nome */}
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input id="name" type="text" name="name" required />
              <ValidationError prefix="Nome" field="name" errors={state.errors} />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" required />
              <ValidationError prefix="Email" field="email" errors={state.errors} />
            </div>

            {/* Assunto */}
            <div className="form-group">
              <label htmlFor="subject">Assunto</label>
              <select id="subject" name="subject" required>
                <option value="">Selecione um assunto</option>
                <option value="adoption">Adoção de Pets</option>
                <option value="partnership">Parcerias</option>
                <option value="donation">Doações</option>
                <option value="support">Suporte Técnico</option>
                <option value="other">Outros</option>
              </select>
              <ValidationError prefix="Assunto" field="subject" errors={state.errors} />
            </div>

            {/* Mensagem */}
            <div className="form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea id="message" name="message" rows="6" required />
              <ValidationError prefix="Mensagem" field="message" errors={state.errors} />
            </div>

            {/* Botão de envio */}
            <button type="submit" className="submit-button" disabled={state.submitting}>
              {state.submitting ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;