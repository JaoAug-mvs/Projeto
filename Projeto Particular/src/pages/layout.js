import { renderDietSection } from "./diet.js";
import { renderHomeSection } from "./home.js";
import { renderProfileSection } from "./profile.js";
import { renderProgressSection } from "./progress.js";

export function renderLayout(state, uiState) {
  return `
    <div class="app-shell">
      <div class="background-orb background-orb--left"></div>
      <div class="background-orb background-orb--right"></div>
      <header class="topbar">
        <a class="brand" href="#inicio">
          <span class="brand__mark">N</span>
          <div>
            <strong>NutriFlow</strong>
            <span>Dieta personalizada automática</span>
          </div>
        </a>
        <nav class="topbar__nav">
          <a href="#perfil">Perfil</a>
          <a href="#resultado">Dieta</a>
          <a href="#acompanhamento">Acompanhamento</a>
        </nav>
      </header>
      <main class="main-content">
        ${renderHomeSection()}
        ${renderProfileSection(state.profile, uiState)}
        ${renderDietSection(state.dietPlan)}
        ${renderProgressSection({
          profile: state.profile,
          dietPlan: state.dietPlan,
          progress: state.progress,
          uiState,
        })}
      </main>
      <footer class="footer">
        <p>NutriFlow foi projetado para educação alimentar e bem-estar com simplicidade e clareza.</p>
      </footer>
    </div>
  `;
}
