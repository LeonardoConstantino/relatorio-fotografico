/**
 * Utilitários para edição de imagem via Canvas
 */
export const canvasUtils = {
  /**
   * Desenha uma imagem e suas anotações em um novo Base64
   */
  async applyAnnotations(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        ctx.drawImage(img, 0, 0);

        // Configurações da caneta de inspeção
        ctx.strokeStyle = '#E11D48'; // accent-danger (Vermelho vibrante)
        ctx.lineWidth = Math.max(img.width / 100, 4); // Espessura proporcional
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Aqui aplicaríamos as ações de desenho salvas...
        // Para o MVP simplificado, o modal salvará o canvas inteiro já achatado.
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  },
};
