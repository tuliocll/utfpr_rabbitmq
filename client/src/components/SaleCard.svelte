<script>
  let { promo, onupvote, ondownvote, onseemore } = $props();

  const fmt = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const discount = $derived(
    promo.original_price > 0
      ? Math.round((1 - promo.promo_price / promo.original_price) * 100)
      : 0
  );

  const temperature = $derived((promo.upvotes ?? 0) - (promo.downvotes ?? 0));
  const isHot = $derived(promo.is_hot_deal);
</script>

<article
  class="flex flex-col rounded-2xl border bg-white p-4 shadow-sm font-sans max-w-md transition
    {isHot ? 'border-yellow-300 ring-1 ring-yellow-100' : 'border-gray-200'}"
>
  <div class="flex gap-4">
    <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
      <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18 5.25h.008v.008H18V5.25zm-12 0h12a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z"/>
      </svg>
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-2">
        <span class="text-sm text-gray-400">{promo.store}</span>
        <div class="flex items-center gap-1">
          {#if isHot}
            <span class="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
              🔥 Quente
            </span>
          {/if}
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {promo.category.charAt(0).toUpperCase() + promo.category.slice(1)}
          </span>
        </div>
      </div>

      <h3 class="mt-1 font-bold leading-snug text-gray-800">
        {promo.title}
      </h3>

      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-xl font-bold text-gray-900">{fmt(promo.promo_price)}</span>
        {#if discount > 0}
          <span class="text-sm text-gray-400 line-through">{fmt(promo.original_price)}</span>
          <span class="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-semibold text-gray-900">
            -{discount}%
          </span>
        {/if}
      </div>
    </div>
  </div>

  {#if promo.description}
    <p class="mt-3 line-clamp-2 text-sm text-gray-500">{promo.description}</p>
  {/if}

  <div class="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
    <div class="flex items-center gap-1 rounded-full bg-gray-50 px-1 py-1">
      <button
        onclick={() => ondownvote?.(promo.promo_id)}
        disabled={promo.myVote === 'down'}
        aria-label="Esfriar promoção"
        class="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 hover:bg-blue-50 disabled:cursor-default
          {promo.myVote === 'down' ? 'bg-blue-100' : ''}"
      >
        ❄️
      </button>
      <span class="min-w-12 text-center text-sm font-bold {temperature >= 0 ? 'text-yellow-600' : 'text-blue-500'}">
        {temperature}°
      </span>
      <button
        onclick={() => onupvote?.(promo.promo_id)}
        disabled={promo.myVote === 'up'}
        aria-label="Esquentar promoção"
        class="flex h-7 w-7 items-center justify-center rounded-full text-yellow-600 hover:bg-yellow-50 disabled:cursor-default
          {promo.myVote === 'up' ? 'bg-yellow-100' : ''}"
      >
        🔥
      </button>
    </div>

    <button
      onclick={() => onseemore?.(promo.promo_id)}
      class="flex items-center gap-1 rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500"
    >
      Ver mais
      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
      </svg>
    </button>
  </div>
</article>