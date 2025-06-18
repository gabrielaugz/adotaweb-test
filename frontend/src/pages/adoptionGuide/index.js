import React from 'react';
import { NavLink } from 'react-router-dom';


const AdoptionGuide = () => {
    
    //window.scrollTo(0, 0);
  return (
    <div className="guia-adocao-container">
      <div className="guia-adocao-header">
        <h1>Guia Completo para Adoção Responsável</h1>
        <p>Tudo o que você precisa saber antes de adotar um pet</p>
      </div>

      <div className="guia-adocao-content">
        <section className="guia-section">
          <h2>1. Por que adotar?</h2>
          <p>Adotar um pet é um ato de amor que transforma vidas. Você ganha um companheiro leal e ainda ajuda a reduzir o número de animais abandonados.</p>
          <ul>
            <li>Salva uma vida animal</li>
            <li>Custos menores que comprar</li>
            <li>Animais já vacinados e castrados</li>
            <li>Combate aos criadouros irresponsáveis</li>
          </ul>
        </section>

        <section className="guia-section">
          <h2>2. Processo de Adoção</h2>
          <div className="processo-steps">
            <div className="step">
              <h3>Escolha seu pet</h3>
              <p>Navegue pelos nossos animais disponíveis e encontre seu companheiro ideal.</p>
            </div>
            <div className="step">
              <h3>Formulário de Interesse</h3>
              <p>Preencha nosso formulário com suas informações básicas.</p>
            </div>
            <div className="step">
              <h3>Entrevista</h3>
              <p>Conversaremos para entender se há compatibilidade.</p>
            </div>
            <div className="step">
              <h3>Visita ao Animal</h3>
              <p>Agendamos um encontro para você conhecer o pet.</p>
            </div>
            <div className="step">
              <h3>Adoção</h3>
              <p>Assinatura do termo e orientações finais.</p>
            </div>
          </div>
        </section>

        <section className="guia-section">
          <h2>3. Requisitos para Adoção</h2>
          <ul>
            <li>Maior de 18 anos</li>
            <li>Documento de identificação</li>
            <li>Comprovante de residência</li>
            <li>Termo de responsabilidade</li>
            <li>Concordar com visita pós-adoção</li>
          </ul>
        </section>

        <section className="guia-section">
          <h2>4. Cuidados Necessários</h2>
          <div className="cuidados-grid">
            <div className="cuidado-item">
              <h3>Alimentação</h3>
              <p>Ração de qualidade e água fresca sempre disponível.</p>
            </div>
            <div className="cuidado-item">
              <h3>Saúde</h3>
              <p>Visitas regulares ao veterinário e vacinação em dia.</p>
            </div>
            <div className="cuidado-item">
              <h3>Exercícios</h3>
              <p>Passeios diários e atividades físicas regulares.</p>
            </div>
            <div className="cuidado-item">
              <h3>Carinho</h3>
              <p>Dedicação de tempo para brincar e interagir.</p>
            </div>
          </div>
        </section>

        <div className="guia-cta">
          <h2>Pronto para adotar?</h2>
          <p>Encontre seu novo melhor amigo hoje mesmo!</p>
          <NavLink to="/" className="cta-button">
            Ver Pets Disponíveis
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default AdoptionGuide;