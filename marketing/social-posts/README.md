# St. Joseph Granite — Social Posts

## Estrutura

```
marketing/social-posts/
│
├── PLAYBOOK.md       ← identidade visual, voz, cores, CTA templates
├── TRACKER.md        ← status board de todos os 22 posts
├── README.md         ← este arquivo
│
├── briefs/           ← roteiros escritos (texto, headline, caption, hashtags)
│   ├── awareness.md      A01–A05
│   ├── education.md      E01–E05
│   ├── conversion.md     C01–C06
│   └── authority.md      AU01–AU06 + AU-RW
│
├── created/          ← posts prontos (HTML gerado pelo Claude)
│   ├── A02-countertop-mistake.html   ✅ PRONTO
│   └── AU-real-work.html             ✅ PRONTO
│
└── published/        ← posts já publicados no Instagram
    (vazio por enquanto)
```

---

## Como usar

### Ver status de todos os posts
Abrir [TRACKER.md](TRACKER.md)

### Gerar novo post
1. Ler o brief em `briefs/` para o post desejado
2. Pedir ao Claude para gerar o HTML
3. Arquivo vai para `created/`
4. Abrir no Chrome (zoom 100%), screenshot cada slide 1080×1080
5. Postar no Instagram

### Após publicar
1. Mover o HTML de `created/` para `published/`
2. Atualizar status no TRACKER.md: `📝 BRIEF` → `📱 PUBLICADO`
3. Preencher a coluna "Publicado em"

---

## Referências rápidas

| Info | Dado |
|---|---|
| Telefone | (774) 498-9863 |
| Endereço | 10 Mill St, Bellingham MA |
| Cor primária | `#9B1515` (vermelho escuro) |
| Fonte headline | Bebas Neue |
| Fonte corpo | Inter |
| Logo | `/public/st-joseph-logo-transparent.png` |
| Fotos projetos | `/imagens/` |

---

## Posts prontos: 2 / 22

**[A02] The Countertop Mistake** → `created/A02-countertop-mistake.html`
Dark carousel, 5 slides, awareness puro. Alto share.

**[AU-RW] Real Work** → `created/AU-real-work.html`
Fotos reais de projetos, 5 slides, authority + conversão.
