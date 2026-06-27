<script lang="ts">
  import utfprLogo from '../assets/utfpr.png'

  const year = new Date().getFullYear();
</script>

<footer class="mt-12 border-t border-gray-200 bg-white font-sans">
  <div class="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
    <!-- Marca / trabalho -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <img src={utfprLogo} alt="UTFPR" class="h-8 w-auto" />
        <span class="text-lg font-bold text-gray-900">
          Promoções <span class="text-yellow-500">SD</span>
        </span>
      </div>
      <p class="text-sm leading-relaxed text-gray-500">
        Projeto da disciplina de Sistemas Distribuídos, usando RabbitMQ
        para a comunicação entre microsserviços.
      </p>
    </div>

    <!-- Acadêmico -->
    <div class="flex flex-col gap-2">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900">Acadêmico</h3>
      <p class="text-sm text-gray-500">
        Universidade Tecnológica Federal do Paraná (UTFPR)
      </p>
      <p class="text-sm text-gray-500">
        PPGCA, Programa de Pós-Graduação em Computação Aplicada (Mestrado)
      </p>
      <a
        href="https://sites.google.com/view/anacristina-kochemvendramin"
        target="_blank"
        rel="noopener noreferrer"
        class="w-fit text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        Profª. Ana Cristina Barreiras Kochem Vendramin
      </a>
    </div>

    <!-- Links -->
    <div class="flex flex-col gap-2">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-900">Projeto</h3>
      <a
        href="https://github.com/tuliocll/utfpr_rabbitmq"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex w-fit items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.1-.73.08-.72.08-.72 1.21.08 1.85 1.22 1.85 1.22 1.08 1.81 2.83 1.29 3.52.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.31-5.47-5.83 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 3-.4c1.02 0 2.05.13 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.64.24 2.86.12 3.16.77.83 1.24 1.88 1.24 3.17 0 4.53-2.81 5.53-5.49 5.82.43.36.81 1.08.81 2.18 0 1.57-.01 2.84-.01 3.23 0 .31.21.68.83.56A12.04 12.04 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"/>
        </svg>
        github.com/tuliocll/utfpr_rabbitmq
      </a>
    </div>
  </div>

  <div class="border-t border-gray-100">
    <div class="mx-auto w-full max-w-5xl px-4 py-4">
      <p class="text-xs text-gray-400">
        © {year} Promoções SD. Projeto acadêmico sem fins comerciais.
      </p>
    </div>
  </div>
</footer>
