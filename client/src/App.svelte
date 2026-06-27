<script lang="ts">
  import Navbar from './components/Navbar.svelte'
  import Categories from './components/Categories.svelte'
  import SaleCard from './components/SaleCard.svelte'
  import Footer from './components/Footer.svelte'
  import Loading from './components/Loading.svelte'
  import Toast from './components/Toast.svelte'
  import { onMount, onDestroy } from 'svelte'
  import { getCategories } from './services/categories.service'
  import { getPromotions, votePromotion, type Promotion } from './services/promotions.service'
  import { getInterests, addInterest, removeInterest } from './services/interests.service'
  import { connectNotifications } from './services/sse.service'
  import { getClientId } from './lib/client'
  import { showToast } from './lib/toast.svelte'
  import { ApiError } from './lib/api'

  const ALL = 'todos';
  const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  let categories = $state<string[]>([]);
  let selected = $state(new URLSearchParams(location.search).get('category') ?? ALL);
  let promos = $state<Promotion[]>([]);
  let loading = $state(false);
  let interests = $state<string[]>([]);

  let requestId = 0;

  const subscribed = $derived(interests.includes(selected));

  onMount(async () => {
    try {
      categories = [ALL, ...(await getCategories())];
    } catch (err) {
      console.error('Falha ao carregar categorias', err);
    }

    const clientId = getClientId();

    try {
      interests = await getInterests(clientId);
    } catch (err) {
      console.error('Falha ao carregar alertas', err);
    }

    stopSse = connectNotifications(clientId, {
      onNewPromo: (promo) => {
        showToast(`Nova promoção em ${label(promo.category)}: ${promo.title}`, 'success', 5000);
        refreshIfVisible(promo.category);
      },
      onHotDeal: (deal) => {
        showToast(`🔥 Hot deal em ${label(deal.category)}: ${deal.title}`, 'info', 5000);
        refreshIfVisible(deal.category);
      },
    });
  });

  let stopSse: (() => void) | undefined;
  onDestroy(() => stopSse?.());

  function loadPromos(category: string, withLoading = true) {
    const id = ++requestId;
    if (withLoading) loading = true;

    getPromotions(category === ALL ? '*' : category)
      .then((data) => {
        if (id === requestId) promos = data;
      })
      .catch((err) => console.error('Falha ao carregar promoções', err))
      .finally(() => {
        if (withLoading && id === requestId) loading = false;
      });
  }

  function refreshIfVisible(category: string) {
    if (selected === ALL || selected === category) loadPromos(selected, false);
  }

  $effect(() => {
    const category = selected;
    if (!category) return;

    syncUrl(category);
    loadPromos(category);
  });

  function syncUrl(category: string) {
    const url = new URL(location.href);
    url.searchParams.set('category', category);
    history.replaceState({}, '', url);
  }

  async function handleVote(promo_id: string, type: 'upvote' | 'downvote') {
    const promo = promos.find((p) => p.promo_id === promo_id);
    if (!promo) return;

    const vote = type === 'upvote' ? 'up' : 'down';
    if (promo.myVote === vote) return; // já é esse o voto; só pode escolher 1

    // snapshot para rollback em caso de erro.
    const prev = { myVote: promo.myVote, upvotes: promo.upvotes, downvotes: promo.downvotes };

    if (promo.myVote === 'up') promo.upvotes -= 1;
    else if (promo.myVote === 'down') promo.downvotes -= 1;
    if (vote === 'up') promo.upvotes += 1;
    else promo.downvotes += 1;
    promo.myVote = vote;

    try {
      await votePromotion(promo_id, vote, getClientId());
    } catch (err) {
      // rollback completo em qualquer falha, exceto 409 (servidor já tem esse voto).
      if (!(err instanceof ApiError && err.status === 409)) {
        promo.myVote = prev.myVote;
        promo.upvotes = prev.upvotes;
        promo.downvotes = prev.downvotes;
      }
      console.error('Falha ao registrar voto', err);
    }
  }

  async function toggleInterest() {
    const category = selected;
    if (category === ALL) return;

    const clientId = getClientId();
    const wasSubscribed = interests.includes(category);

    try {
      if (wasSubscribed) {
        await removeInterest(clientId, category);
        interests = interests.filter((c) => c !== category);
        showToast(`Alerta de "${label(category)}" cancelado`, 'info');
      } else {
        await addInterest(clientId, category);
        interests = [...interests, category];
        showToast(`Você receberá alertas de "${label(category)}"`, 'success');
      }
    } catch (err) {
      console.error('Falha ao atualizar alerta', err);
      showToast('Não foi possível atualizar o alerta. Tente novamente.', 'error');
    }
  }

  function goto(url: string) {
    window.location.href = url;
  }
</script>

<div class="flex min-h-screen flex-col">
  <Navbar />
  <Categories
    {categories}
    active={selected}
    onselect={(c) => (selected = c)}
    {subscribed}
    showAlert={selected !== ALL}
    ontogglealert={toggleInterest}
  />

  <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
    {#if loading}
      <Loading />
    {:else if promos.length === 0}
      <p class="py-16 text-center text-gray-500">Nenhuma promoção encontrada.</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {#each promos as promo (promo.promo_id)}
          <SaleCard
            {promo}
            onupvote={(id: string) => handleVote(id, 'upvote')}
            ondownvote={(id: string) => handleVote(id, 'downvote')}
            onseemore={(id: string) => goto(`/promo/${id}`)}
          />
        {/each}
      </div>
    {/if}
  </main>

  <Footer />
</div>

<Toast />
