import { logger } from '../libs/Logger';

/**
 * Utilitários para processamento de imagens Aura Technical
 */
export const imageProcessor = {
  /**
   * Comprime e redimensiona uma imagem mantendo a proporção
   * @param file Arquivo de imagem original
   * @param quality Qualidade JPEG/WebP (0.0 a 1.0)
   * @param maxWidth Largura máxima (padrão 1200px para A4)
   */
  async process(
    file: File,
    quality: number = 0.7,
    maxWidth: number = 1200,
  ): Promise<string> {
    logger.debug(
      'Image',
      `Processando imagem: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    );

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionamento proporcional
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Falha ao obter contexto Canvas');

          // Desenha a imagem no canvas redimensionado
          ctx.drawImage(img, 0, 0, width, height);

          // Converte para Base64 otimizado
          const base64 = canvas.toDataURL('image/jpeg', quality);

          logger.debug(
            'Image',
            `Imagem otimizada: ${(base64.length / 1024).toFixed(1)} KB`,
          );
          resolve(base64);
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  },

  /**
   * Calcula o tamanho estimado de uma string Base64 em bytes
   */
  estimateSize(base64: string): number {
    return (
      base64.length * (3 / 4) -
      (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
    );
  },
};
