# Migrazioni schema (Payload / Postgres)

## Stato attuale
- **Produzione**: `push` è **disattivato** (`push: !isProd` in `src/payload.config.ts`).
  Lo schema NON viene mai sincronizzato automaticamente in prod: nessun rischio di
  colonne alterate/eliminate senza controllo.
- **Sviluppo**: `push` attivo → lo schema si sincronizza verso il DB Neon (condiviso
  con la produzione) a ogni `getPayload`.
- `migrationDir` punta a `src/migrations/` (al momento vuota).

## Gotcha Windows
`payload migrate:create` / `migrate` falliscono su questa macchina per il bug tsx
`node:crypto?tsx-namespace` ENOENT (lo stesso di `generate:types`/`payload run`).
Le migrazioni vanno quindi **generate da un ambiente dove la CLI funziona**
(WSL, Linux, oppure la CI). Vedi la memoria di progetto `payload-cli-e-schema-push`.

## Adozione della baseline (una tantum, da fare in WSL/Linux/CI)
Lo schema attuale è già su Neon (creato via push). Per adottare le migrazioni
senza ricreare le tabelle:

1. Genera la migrazione baseline (cattura lo schema completo):
   ```
   node --env-file=.env ./node_modules/payload/bin.js migrate:create baseline
   ```
2. Committa il file generato in `src/migrations/`.
3. Poiché il DB Neon **ha già** quello schema, marca la baseline come già applicata
   (non rieseguirla) inserendo la riga nella tabella `payload_migrations`, oppure
   usando `payload migrate:status` per verificare e allineare. Su un DB vuoto,
   invece, `payload migrate` la applicherà creando tutto.

## Flusso a regime (dopo un cambio di schema)
1. Modifica collection/global.
2. In WSL/Linux/CI: `payload migrate:create <nome-descrittivo>`.
3. Committa il file di migrazione.
4. In deploy (prima del build) o manualmente verso Neon: `payload migrate`.

## Interim (finché la baseline non è adottata)
Vale ancora il workflow attuale: **push manuale dello schema verso il Neon
condiviso PRIMA del deploy** quando si aggiungono campi (via `src/scripts/_push.ts`
o `ALTER TABLE` diretto). Dettagli nella memoria `payload-cli-e-schema-push`.
