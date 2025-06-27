// frontend\src\pages\adoptionGuide\index.js

import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// sempre rola a página para o topo
const AdoptionGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="guia-adocao-container">
      <div className="guia-adocao-header">
        <h1>Guia Completo para Adoção Responsável</h1>
        <p>Tudo o que você precisa saber antes de adotar um pet</p>
      </div>

      <div className="guia-adocao-content">
        {/* 1. Por que adotar? */}
        <section className="guia-section">
          <h2>1. Por que adotar?</h2>
          <p>
            Adotar um pet é um ato de amor que transforma vidas. Você ganha um companheiro leal
            e ainda ajuda a reduzir o número de animais abandonados.
          </p>
          <ul>
            <li>
              Salva uma vida animal{' '}
              <small>
                (<a
                  href="https://blog.polipet.com.br/adocao-um-ato-que-salva-vidas/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Blog Polipet
                </a>)
              </small>
            </li>
            <li>
              Custos menores que comprar{' '}
              <small>
                (<a
                  href="https://agenciadenoticias.uniceub.br/economia/como-decidir-entre-adotar-ou-comprar-um-animal-confira-custos/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Agência Uniceub
                </a>)
              </small>
            </li>
            <li>
              Animais já vacinados e castrados{' '}
              <small>
                (<a
                  href="https://adoteumgatinho.org.br/sobre"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Adote um Gatinho
                </a>)
              </small>
            </li>
            <li>
              Combate aos criadouros irresponsáveis{' '}
              <small>
                (<a
                  href="https://gradbrasil.org.br/adocaodeanimais/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GRAD Brasil
                </a>)
              </small>
            </li>
          </ul>
        </section>

        {/* 2. Processo de Adoção */}
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

        {/* 3. Requisitos para Adoção */}
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

        {/* 4. Cuidados Necessários */}
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

      {/* Rodapé de Referências */}
      <footer className="guia-referencias">
        <h2>Referências</h2>
        <ul>
          <li>
            “Adoção: um ato que salva vidas” – Blog Polipet. Disponível em:{' '}
            <a
              href="https://blog.polipet.com.br/adocao-um-ato-que-salva-vidas/"
              target="_blank"
              rel="noopener noreferrer"
            >
              blog.polipet.com.br
            </a>
          </li>
          <li>
            “Como decidir entre adotar ou comprar um animal; confira custos” – Agência Uniceub. Disponível em:{' '}
            <a
              href="https://agenciadenoticias.uniceub.br/economia/como-decidir-entre-adotar-ou-comprar-um-animal-confira-custos/"
              target="_blank"
              rel="noopener noreferrer"
            >
              agenciadenoticias.uniceub.br
            </a>
          </li>
          <li>
            Sobre vacinação e castração – Adote um Gatinho. Disponível em:{' '}
            <a
              href="https://adoteumgatinho.org.br/sobre"
              target="_blank"
              rel="noopener noreferrer"
            >
              adoteumgatinho.org.br
            </a>
          </li>
          <li>
            “Adoção de animais: pets não são presentes” – GRAD Brasil. Disponível em:{' '}
            <a
              href="https://gradbrasil.org.br/adocaodeanimais/"
              target="_blank"
              rel="noopener noreferrer"
            >
              gradbrasil.org.br
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default AdoptionGuide;