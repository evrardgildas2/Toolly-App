import api from './api';

// Upload d'une seule image. Retourne l'URL Cloudinary générée.
export async function televerserImage(fichier) {
  const formData = new FormData();
  formData.append('image', fichier);
  const reponse = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return reponse.data.url;
}

// Upload de plusieurs images en une fois. Retourne un tableau d'URLs.
export async function televerserImages(fichiers) {
  const formData = new FormData();
  fichiers.forEach((fichier) => formData.append('images', fichier));
  const reponse = await api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return reponse.data.urls;
}
