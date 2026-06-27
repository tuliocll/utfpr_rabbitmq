<script lang="ts">
  let {
    categories = [],
    active = '',
    onselect,
    subscribed = false,
    showAlert = false,
    ontogglealert,
  }: {
    categories?: string[];
    active?: string;
    onselect?: (category: string) => void;
    subscribed?: boolean;
    showAlert?: boolean;
    ontogglealert?: () => void;
  } = $props();

  const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
</script>

<div class="mx-auto mt-6 w-full max-w-5xl border-b border-gray-200 px-4">
  <nav class="mx-auto flex w-fit max-w-full gap-6 overflow-x-auto font-sans">
    {#each categories as item}
      <button
        onclick={() => onselect?.(item)}
        class="relative shrink-0 py-3 text-[15px] transition-colors
          {active === item
            ? 'font-semibold text-gray-900 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-yellow-400'
            : 'text-gray-600 hover:text-gray-900'}"
      >
        {label(item)}
      </button>
    {/each}
  </nav>
</div>

{#if showAlert}
  <div class="mx-auto mt-3 flex w-full max-w-5xl justify-end px-4">
    <button
      onclick={() => ontogglealert?.()}
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors
        {subscribed
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
    >
      {#if subscribed}
        <span>🔔</span> Alerta de {label(active)} ativo · Cancelar
      {:else}
        <span>🔕</span> Criar alerta de {label(active)}
      {/if}
    </button>
  </div>
{/if}
