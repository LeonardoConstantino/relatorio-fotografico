# Task 07: Editor de Imagens & Canvas

## Objetivo
Permitir upload, compressão e anotação (desenho) em imagens.

## Arquivos de Saída
- `src/utils/canvasUtils.ts`
- `src/components/features/ImageUploader.ts`

## Detalhamento da Execução

1.  **Utils (`canvasUtils.ts`):**
    *   `compressImage(file, quality=0.7)`: Redimensiona para Max 1920px e exporta JPEG/WebP.
    *   `drawAnnotation(ctx, x, y)`: Funções para desenhar círculos vermelhos (padrão de inspeção).

2.  **Uploader (`<image-uploader>`):**
    *   Botão com estilo `.btn-secondary` ou área de drop.
    *   Ao selecionar, processa a imagem e emite evento com o Base64 otimizado.

## Critérios de Aceite
- [x] Imagem de 5MB vira <500KB.
- [x] UI alinhada ao tema "Estúdio".
