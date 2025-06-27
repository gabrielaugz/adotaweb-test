// frontend\src\pages\faq\index.js

import React from 'react';
import { NavLink } from 'react-router-dom';

// página de FAQ (Perguntas Frequentes)
const FaqPage = () => {
    
  const faqItems = [
    {
      question: "Quais são os requisitos para adotar um pet?",
      answer: "Você precisa ser maior de 18 anos, apresentar RG, CPF e comprovante de residência. Também realizamos uma entrevista para garantir que o pet se adaptará ao novo lar."
    },
    {
      question: "Quanto custa adotar um animal?",
      answer: "A adoção é gratuita, mas todos os nossos pets são castrados, vacinados e microchipados, o que seria um custo considerável se feito particularmente."
    },
    {
      question: "Posso adotar se moro em apartamento?",
      answer: "Sim, desde que você possa proporcionar os cuidados e espaço adequados para o animal. Algumas raças de cães, por exemplo, se adaptam melhor a apartamentos."
    },
    {
      question: "Como sei que o pet é compatível comigo?",
      answer: "Nossa equipe faz uma avaliação do perfil do adotante e do pet para sugerir os melhores matches. Também oferecemos um período de adaptação."
    },
    {
      question: "E se a adoção não der certo?",
      answer: "Temos uma política de devolução responsável. Se por qualquer motivo a adoção não der certo, você pode trazer o pet de volta para nós."
    },
    {
      question: "Os pets são vacinados e castrados?",
      answer: "Sim, todos os pets disponíveis para adoção são castrados, vacinados, vermifugados e microchipados antes da adoção."
    }
  ];

  const [activeIndex, setActiveIndex] = React.useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Perguntas Frequentes</h1>
        <p>Tire suas dúvidas sobre o processo de adoção</p>
      </div>

      <div className="faq-content">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div 
              className="faq-question"
              onClick={() => toggleAccordion(index)}
            >
              <h3>{item.question}</h3>
              <span className="faq-toggle">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="faq-cta">
        <h2>Não encontrou sua dúvida?</h2>
        <p>Entre em contato conosco para mais informações</p>
        <NavLink to="/contact" className="cta-button">
          Fale conosco
        </NavLink>
      </div>
    </div>
  );
};

export default FaqPage;