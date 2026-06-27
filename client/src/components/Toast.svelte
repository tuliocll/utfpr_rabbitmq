<script lang="ts">
  import { getToasts, dismissToast } from '../lib/toast.svelte';

  const styles: Record<string, string> = {
    success: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-gray-200 bg-white text-gray-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  };

  const icons: Record<string, string> = {
    success: '✓',
    info: '🔔',
    error: '⚠',
  };
</script>

<div class="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2 font-sans">
  {#each getToasts() as toast (toast.id)}
    <div
      class="pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-md {styles[toast.type]}"
    >
      <span>{icons[toast.type]}</span>
      <span>{toast.message}</span>
      <button
        onclick={() => dismissToast(toast.id)}
        class="ml-2 text-gray-400 transition-colors hover:text-gray-700"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  {/each}
</div>
