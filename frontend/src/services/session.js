// Lit la date d'expiration (champ exp) dans le token JWT, sans le vérifier :
// la vraie vérification reste faite par le serveur.
export function tokenEstExpire() {
  const token = localStorage.getItem('token');
  if (!token) return true;
  try {
    const charge = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return charge.exp ? charge.exp * 1000 < Date.now() : false;
  } catch (error) {
    return true;
  }
}

export function viderSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('utilisateur');
}