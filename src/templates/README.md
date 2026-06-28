# Import massivo prodotti — L'Impronta

Strumenti per caricare molti prodotti in una volta sola dal tuo PC, usando la
Local API di Payload (nessun timeout serverless).

## 1. Genera il template Excel

```bash
pnpm template:prodotti
```

Crea `src/templates/prodotti-template.xlsx` con le intestazioni, alcune righe di
esempio e un foglio **Istruzioni**. Aprilo, cancella gli esempi e inserisci i tuoi
prodotti nel foglio **Prodotti**.

### Colonne

| Colonna | Obblig. | Formato |
|---|---|---|
| `sku` | Sì | Codice univoco (chiave dell'import e prefisso dei nomi foto) |
| `nome` | Sì | Nome del prodotto |
| `brand` | Sì | Nome marchio (se non esiste viene creato) |
| `categoria` | Sì | Nome categoria (se non esiste viene creata) |
| `descrizione` | No | Testo libero |
| `prezzo` | No | Numero in euro, es. `690`. Vuoto se su richiesta |
| `prezzo_su_richiesta` | No | `sì`/`no` |
| `taglie` | No | Separate da virgola, es. `48,50,52` o `S,M,L` |
| `colori` | No | Separati da `|` o virgola, es. `Blu|Sabbia` |
| `stagione` | No | `PE` o `AI` + anno, es. `PE25` o `AI2025` |
| `in_evidenza` | No | `sì`/`no` (home) |
| `disponibile` | No | `sì`/`no` (default `sì`) |

## 2. Prepara le foto

Metti le foto in una cartella (es. `photos/`) e nominale così:

```
{SKU}-01.jpg   ← foto principale (copertina)
{SKU}-02.jpg
{SKU}-03.jpg
...
```

Esempio per lo SKU `COR-GIA-001`:

```
COR-GIA-001-01.jpg
COR-GIA-001-02.jpg
```

Formati ammessi: `jpg`, `jpeg`, `png`, `webp`. L'ordine segue il numero finale.
Le foto vengono caricate su Cloudinary e collegate al prodotto in automatico.

## 3. Esegui l'import

Prima una **prova a vuoto** (non scrive nulla, mostra solo il report):

```bash
pnpm import:prodotti ./data/prodotti.xlsx ./photos --dry-run
```

Poi l'import reale:

```bash
pnpm import:prodotti ./data/prodotti.xlsx ./photos
```

- L'**upsert** avviene per `sku`: rieseguire l'import **aggiorna** i prodotti
  esistenti senza creare duplicati (anche le immagini già caricate non vengono
  ricaricate).
- A fine esecuzione viene stampato un report: creati / aggiornati / saltati,
  marchi e categorie creati, immagini caricate, eventuali errori riga per riga.

> Suggerimento: per lotti molto grandi su Neon, imposta temporaneamente
> `DATABASE_URI` alla **stringa diretta** (non-pooled) per maggiore stabilità.

## In alternativa: da fotocamera

Dall'admin di Payload (anche da smartphone/tablet) puoi aprire una scheda
prodotto e caricare le foto direttamente scattandole sul momento, senza
rispettare alcuna convenzione di naming.
