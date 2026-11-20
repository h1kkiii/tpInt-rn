import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';

import { Boton } from '@/components/Boton';
import { FormularioConTeclado } from '@/components/FormularioConTeclado';
import { MENSAJES } from '@/constants/mensajes';
import { ALTO_LINEA, BORDE, ESPACIO, MINIMO_TACTIL, RADIO, TAMANIO_TEXTO, type Paleta } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';
import { useEstilos } from '@/hooks/useEstilos';
import { useTema } from '@/hooks/useTema';

// No navega: si las credenciales son correctas cambia la sesión y la
// protección del layout raíz (redirectTo="/mostrador") cierra este modal.
export function FormularioLogin() {
  const estilos = useEstilos(crearEstilos);
  const paleta = useTema();
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const campoClave = useRef<TextInputInstance>(null);

  function ingresar() {
    if (usuario.trim() === '' || clave === '') {
      setError(MENSAJES.loginIncompleto);
      return;
    }
    if (!iniciarSesion(usuario, clave)) {
      setError(MENSAJES.loginIncorrecto);
      setClave('');
    }
  }

  return (
    <FormularioConTeclado>
      <Text style={estilos.titulo} accessibilityRole="header">
        Ingreso del personal
      </Text>
      <Text style={estilos.ayuda}>Solo para el personal de la biblioteca, para entregar libros en el mostrador.</Text>

      <View style={estilos.campo}>
        <Text style={estilos.etiqueta} nativeID="etiqueta-usuario">
          Usuario
        </Text>
        <TextInput
          value={usuario}
          onChangeText={(texto) => {
            setUsuario(texto);
            setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => campoClave.current?.focus()}
          submitBehavior="submit"
          accessibilityLabel="Usuario"
          accessibilityLabelledBy="etiqueta-usuario"
          placeholderTextColor={paleta.textoSecundario}
          style={estilos.entrada}
        />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.etiqueta} nativeID="etiqueta-clave">
          Clave
        </Text>
        <TextInput
          ref={campoClave}
          value={clave}
          onChangeText={(texto) => {
            setClave(texto);
            setError(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={ingresar}
          accessibilityLabel="Clave"
          accessibilityLabelledBy="etiqueta-clave"
          style={estilos.entrada}
        />
      </View>

      {error && (
        <Text style={estilos.error} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      )}

      <Boton titulo="Ingresar" icono="log-in-outline" onPress={ingresar} />
    </FormularioConTeclado>
  );
}

const crearEstilos = (paleta: Paleta) =>
  StyleSheet.create({
    titulo: { color: paleta.texto, fontSize: TAMANIO_TEXTO.grande, lineHeight: ALTO_LINEA.grande, fontWeight: '700' },
    ayuda: { color: paleta.textoSecundario, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal },
    campo: { gap: ESPACIO.xs },
    etiqueta: { color: paleta.texto, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, fontWeight: '600' },
    entrada: {
      minHeight: MINIMO_TACTIL,
      paddingHorizontal: ESPACIO.m,
      backgroundColor: paleta.superficie,
      borderWidth: BORDE.fino,
      borderColor: paleta.borde,
      borderRadius: RADIO.normal,
      color: paleta.texto,
      fontSize: TAMANIO_TEXTO.normal,
    },
    error: { color: paleta.peligro, fontSize: TAMANIO_TEXTO.normal, lineHeight: ALTO_LINEA.normal, fontWeight: '600' },
  });
