import { Text, View } from 'react-native';

type Props = {
  titulo: string;
};

export function PantallaProvisoria({ titulo }: Props) {
  return (
    <View>
      <Text>{titulo}</Text>
    </View>
  );
}
