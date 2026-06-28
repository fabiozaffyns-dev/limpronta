# L'Impronta — sito vetrina/catalogo

Sito della boutique uomo **L'Impronta** (Orbassano, TO): catalogo elegante e
editoriale con call-to-action "contatta/prenota in negozio". Nessuna vendita
online.

Concept d'identità: **"La materia e il segno"** — wordmark e dettagli trattati
come un segno *debossato/inciso* su fondo materico.

## Stack

- **Next.js 16** (App Router, TypeScript) + **React 19**
- **Payload CMS 3** (admin + frontend nello stesso repo)
- **PostgreSQL** su Neon (adapter Drizzle)
- **Cloudinary** per le immagini (storage adapter, dietro env)
- **Tailwind CSS v4** + design token in CSS variables
- **Lenis** (smooth scroll) + **GSAP ScrollTrigger** (momento hero)
- Deploy: **Vercel**

## Avvio in locale

1. **Variabili d'ambiente**

   ```bash
   cp .env.example .env
   ```

   Compila almeno: `DATABASE_URI` (Neon), `PAYLOAD_SECRET`, le chiavi
   `CLOUDINARY_*` e, per i contatti, `NEXT_PUBLIC_WHATSAPP_NUMBER` /
   `NEXT_PUBLIC_FORMSPREE_ENDPOINT`. Senza Cloudinary, in dev le immagini usano
   lo storage su disco.

2. **Dipendenze**

   ```bash
   pnpm install
   ```

3. **Schema + dati iniziali** (categorie, marchi, servizi, pagine, impostazioni, admin)

   ```bash
   pnpm seed
   ```

   In sviluppo lo schema viene sincronizzato automaticamente su Neon (modalità
   *push* dell'adapter Postgres): `pnpm seed` avvia Payload — che crea/aggiorna le
   tabelle — e poi popola i dati in modo idempotente.

   > Nota: gli script CLI girano con `node --import tsx/esm` (vedi `package.json`).
   > I comandi `pnpm migrate:create/migrate` restano disponibili ma su Node 24 +
   > Windows hanno un bug noto del loader CJS di `tsx`; per la v1 lo schema è
   > gestito via *push* sul database Neon condiviso.

4. **Avvio**

   ```bash
   pnpm dev
   ```

   - Sito: http://localhost:3000
   - Admin: http://localhost:3000/admin

## Script utili

| Comando | Descrizione |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Dev / build / produzione |
| `pnpm typecheck` / `pnpm lint` | Controlli TypeScript / ESLint |
| `pnpm generate:types` | Rigenera `src/payload-types.ts` dal config |
| `pnpm generate:importmap` | Rigenera la import map dell'admin |
| `pnpm migrate:create` / `pnpm migrate` | Crea / applica migrazioni |
| `pnpm seed` | Seed idempotente |
| `pnpm template:prodotti` | Genera il template Excel per l'import |
| `pnpm import:prodotti <xlsx> <foto> [--dry-run]` | Import massivo prodotti |

L'import massivo e la convenzione di naming delle foto sono documentati in
[`src/templates/README.md`](./src/templates/README.md).

## Struttura

```
src/
├─ payload.config.ts        # config CMS (collezioni, globals, localization, plugin)
├─ collections/             # Products, Brands, Categories, Lookbooks, Pages, Services, Media, Users
├─ globals/Settings.ts      # contatti, indirizzo, orari, social, mappa
├─ app/(frontend)/          # sito pubblico (Home, Catalogo, schede, marchi, lookbook, …)
├─ app/(payload)/           # admin + API Payload
├─ components/              # UI, layout, motion
├─ lib/                     # client Payload, query, JSON-LD, helper
└─ scripts/                 # seed, import, template
```

## Portabilità

Database e storage sono dietro adapter/variabili d'ambiente: la migrazione a una
VPS (Postgres locale + dischi) o a un altro storage richiede solo cambi di
configurazione, non riscritture.

## Deploy su Vercel

Imposta le stesse variabili d'ambiente del `.env` nel progetto Vercel. Le
migrazioni vanno eseguite verso Neon (stringa diretta) prima/durante il deploy.
Le immagini risiedono su Cloudinary (il filesystem di Vercel è effimero).
