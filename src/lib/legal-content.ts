/**
 * Testi legali del sito (Privacy e Cookie Policy) — UNICA fonte, usata sia dal
 * seed (prima creazione) sia dallo script di aggiornamento (src/scripts/update-legal.ts).
 *
 * I contenuti descrivono il trattamento REALE del sito: modulo di contatto via
 * Formspree, hosting Vercel, immagini Cloudinary, mappa Stadia Maps e statistiche
 * anonime attivate solo previo consenso. Dati del Titolare dalla visura camerale.
 *
 * NB: sono testi accurati e completi rispetto a ciò che il sito fa davvero, ma
 * NON sostituiscono una verifica legale sul caso specifico del negozio. Se
 * cambiano gli strumenti (newsletter, videosorveglianza, e-commerce…) vanno
 * aggiornati di conseguenza.
 */

export const LEGAL_UPDATED = 'luglio 2026'

export const PRIVACY_TITOLO = 'Privacy Policy'
export const PRIVACY_SOMMARIO =
  'Informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).'

export const PRIVACY_PARTS: string[] = [
  `Ultimo aggiornamento: ${LEGAL_UPDATED}.`,
  'La presente informativa descrive come L’Impronta di Zaffino Fabio tratta i dati personali degli utenti che visitano questo sito e che ci contattano. Il sito è la vetrina del negozio: non vende online e non richiede la creazione di alcun account.',
  '## Titolare del trattamento',
  'Titolare del trattamento è L’Impronta di Zaffino Fabio, ditta individuale con sede in Via Vittorio Emanuele II 12/A, 10043 Orbassano (TO). Partita IVA e Codice Fiscale 11162620014, iscrizione al Registro delle Imprese di Torino REA TO-1194672. Per qualsiasi questione relativa ai dati personali puoi scrivere all’indirizzo PEC fabiozaffino@pec.it o utilizzare i recapiti della pagina Contatti.',
  '## Quali dati trattiamo',
  'Dati che ci fornisci volontariamente tramite il modulo di contatto: nome, indirizzo email, numero di telefono (facoltativo) e il testo del messaggio. Servono unicamente a ricontattarti e a rispondere alla tua richiesta.',
  'Dati raccolti automaticamente durante la navigazione: il fornitore di hosting registra dati tecnici essenziali (ad esempio l’indirizzo IP e il tipo di browser) per la sicurezza e il corretto funzionamento del sito. Previo tuo consenso raccogliamo inoltre statistiche di utilizzo in forma anonima e aggregata: i dettagli sono nella Cookie Policy.',
  '## Finalità e base giuridica',
  'Trattiamo i dati del modulo di contatto per dare riscontro alle tue richieste e adottare misure precontrattuali su tua richiesta (art. 6.1.b GDPR). I dati tecnici di navigazione sono trattati per il nostro legittimo interesse a garantire la sicurezza e il funzionamento del sito (art. 6.1.f GDPR). Le statistiche di utilizzo sono trattate solo previo tuo consenso (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento.',
  '## Destinatari e fornitori di servizi',
  'Non vendiamo né cediamo i tuoi dati a terzi per finalità di marketing. Per erogare il servizio ci avvaliamo di alcuni fornitori che trattano dati per nostro conto, in qualità di responsabili del trattamento: Formspree Inc. (recapito dei messaggi inviati dal modulo di contatto), Vercel Inc. (hosting e distribuzione del sito), Cloudinary Ltd. (archiviazione e distribuzione delle immagini) e Stadia Maps (mappa interattiva del negozio, caricata solo previo consenso o azione esplicita).',
  'Alcuni di questi fornitori hanno sede o infrastrutture al di fuori dell’Unione Europea. Gli eventuali trasferimenti di dati verso paesi terzi avvengono nel rispetto delle garanzie previste dal GDPR, quali l’adesione all’EU-US Data Privacy Framework o l’adozione delle Clausole Contrattuali Standard approvate dalla Commissione Europea.',
  '## Conservazione dei dati',
  'I dati inviati tramite il modulo di contatto sono conservati per il tempo necessario a gestire la tua richiesta e, successivamente, per il periodo richiesto da eventuali obblighi di legge. I dati tecnici e le statistiche anonime sono conservati per periodi limitati, secondo le impostazioni dei rispettivi servizi.',
  '## I tuoi diritti',
  'In qualità di interessato hai diritto di chiedere in ogni momento l’accesso ai tuoi dati, la loro rettifica o cancellazione, la limitazione o l’opposizione al trattamento e la portabilità dei dati. Quando il trattamento si basa sul consenso, puoi revocarlo in qualsiasi momento senza pregiudicare la liceità del trattamento effettuato prima della revoca.',
  'Per esercitare questi diritti puoi contattarci alla PEC fabiozaffino@pec.it o ai recapiti della pagina Contatti. Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
  '## Modifiche a questa informativa',
  'Possiamo aggiornare la presente informativa per adeguarla a modifiche normative o del sito. La versione in vigore è sempre quella pubblicata in questa pagina, con l’indicazione della data di ultimo aggiornamento riportata in alto.',
]

export const COOKIE_TITOLO = 'Cookie Policy'
export const COOKIE_SOMMARIO =
  'Informativa sull’uso dei cookie e delle tecnologie di tracciamento su questo sito.'

export const COOKIE_PARTS: string[] = [
  `Ultimo aggiornamento: ${LEGAL_UPDATED}.`,
  'Questa Cookie Policy spiega quali cookie e tecnologie simili (come il localStorage del browser) sono utilizzati su questo sito e come puoi gestire le tue preferenze. Per il trattamento degli altri dati personali si rimanda alla Privacy Policy.',
  '## Cosa sono i cookie',
  'I cookie sono piccoli file di testo che i siti salvano sul dispositivo dell’utente. Insieme a tecnologie analoghe (come il localStorage) permettono al sito di funzionare, di ricordare le tue scelte e, se acconsenti, di raccogliere statistiche anonime.',
  '## Cookie e strumenti tecnici (necessari)',
  'Sono indispensabili per la navigazione e la sicurezza del sito e non richiedono consenso. Rientra in questa categoria la memorizzazione della tua scelta sui cookie: la conserviamo nel localStorage del browser (voce “limpronta-consent-v1”) proprio per non richiederti il consenso a ogni visita.',
  '## Statistiche di utilizzo (previo consenso)',
  'Solo dopo il tuo consenso attiviamo Vercel Analytics, uno strumento che raccoglie statistiche di navigazione in forma anonima e aggregata (ad esempio le pagine più viste), senza profilare i singoli utenti. Finché non presti il consenso, questo strumento non viene caricato.',
  '## Contenuti di terze parti (previo consenso)',
  'La pagina Contatti include una mappa interattiva fornita da Stadia Maps. Per mostrarla il tuo browser deve collegarsi ai server del fornitore, trasmettendo dati tecnici come l’indirizzo IP. Per questo la mappa viene caricata solo dopo il tuo consenso oppure dopo un tuo click esplicito su “Mostra la mappa”: fino a quel momento nessun dato raggiunge il fornitore. Le immagini del sito sono invece distribuite tramite Cloudinary.',
  '## Come gestire il consenso',
  'Alla prima visita un banner ti permette di accettare o rifiutare gli strumenti non necessari. Puoi modificare la tua scelta in qualsiasi momento dal pulsante “Cookie” presente in basso a sinistra su ogni pagina. Puoi inoltre gestire o eliminare i cookie e i dati di navigazione direttamente dalle impostazioni del tuo browser.',
  '## Titolare e contatti',
  'Il Titolare del trattamento è L’Impronta di Zaffino Fabio, Via Vittorio Emanuele II 12/A, 10043 Orbassano (TO), P.IVA 11162620014, PEC fabiozaffino@pec.it. Per maggiori informazioni consulta la Privacy Policy.',
]
