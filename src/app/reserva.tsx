import { Redirect } from 'expo-router';

// URL vieja de la versión anterior de la app.
export default function ReservaVieja() {
  return <Redirect href="/reservas" />;
}
