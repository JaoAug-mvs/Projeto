export function renderHomeSection() {
  return `
    <section class="hero" id="inicio">
      <div class="hero__copy">
        <span class="eyebrow">NutriFlow</span>
        <h1>Monte uma dieta personalizada em minutos, com base no seu perfil real.</h1>
        <p>
          Informe seus dados, preferências e restrições para receber uma sugestão automática de
          plano alimentar com calorias estimadas, refeições distribuídas ao longo do dia e ajustes
          conforme sua evolução.
        </p>
        <div class="hero__actions">
          <a class="button" href="#perfil">Montar minha dieta</a>
          <a class="button button--ghost" href="#acompanhamento">Ver acompanhamento</a>
        </div>
        <p class="disclaimer">
          Esta aplicação oferece uma sugestão automatizada e educativa. Ela não substitui
          avaliação individual com nutricionista.
        </p>
      </div>
      <div class="hero__panel">
        <article class="highlight-card">
          <strong>O que o sistema entrega</strong>
          <ul>
            <li>Estimativa calórica baseada no seu perfil</li>
            <li>Plano com 6 refeições e alternativas</li>
            <li>Painel com meta atual e histórico de peso</li>
          </ul>
        </article>
        <article class="highlight-card highlight-card--accent">
          <strong>Feito para ser simples</strong>
          <p>
            Sem backend, sem cadastro obrigatório e com salvamento local automático para continuar
            de onde parou.
          </p>
        </article>
      </div>
    </section>
  `;
}
