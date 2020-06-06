/* eslint-disable @typescript-eslint/interface-name-prefix */
import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Feather as Icon } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';

import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import logo from '../../assets/logo.png';
import background from '../../assets/home-background.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
});

const inputStyle = StyleSheet.create({
  inputAndroid: {
    borderRadius: 8,
    height: 60,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputAndroidContainer: {
    borderRadius: 8,
  },
  inputIOSContainer: {
    borderRadius: 8,
  },
  inputIOS: {
    borderRadius: 8,
    height: 60,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  iconContainer: {
    right: 10,
    top: 20,
  },
});

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [ufs, setUfs] = React.useState<{ uf: string; name: string }[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);

  const [selectedUF, setUFSelected] = React.useState('0');
  const [selectedCity, setCitySelected] = React.useState('0');

  function handleNavigateToPoints(): void {
    navigation.navigate('Points', {
      uf: selectedUF,
      city: selectedCity,
    });
  }

  function handleSelectedUF(value: string): void {
    setUFSelected(value);
  }

  function handleSelectedCity(value: string): void {
    setCitySelected(value);
  }

  React.useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
        {
          params: {
            orderBy: 'nome',
          },
        },
      )
      .then(response =>
        response.data.map(uf => ({
          name: uf.nome,
          uf: uf.sigla,
        })),
      )
      .then(result => {
        setUfs(result);
      });
  }, []);

  React.useEffect(() => {
    if (selectedUF === '0') {
      setCities([]);
      return;
    }
    axios
      .get<{ nome: string }[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`,
        {
          params: {
            orderBy: 'nome',
          },
        },
      )
      .then(response => response.data.map(city => city.nome))
      .then(result => {
        setCities(result);
      });
  }, [selectedUF]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={background}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={logo} />
          <View>
            <Text style={styles.title}>
              Seu marktplace de coleta de resíduos
            </Text>
            <Text style={styles.description}>
              Ajudamos pessoas a encontrarem pontos de coleta de forma
              eficiente.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <RNPickerSelect
            placeholder={{
              label: 'Selecione a UF',
              value: null,
            }}
            value={selectedUF}
            items={ufs.map(uf => ({ label: uf.name, value: uf.uf }))}
            onValueChange={handleSelectedUF}
            style={{ ...inputStyle }}
            Icon={() => <Icon name="chevron-down" size={24} color="#A0A0B2" />}
          />

          <RNPickerSelect
            placeholder={{
              label: 'Selecione a Cidade',
              value: null,
            }}
            value={selectedCity}
            items={cities.map(city => ({ label: city, value: city }))}
            onValueChange={handleSelectedCity}
            style={{ ...inputStyle }}
            Icon={() => <Icon name="chevron-down" size={24} color="#A0A0B2" />}
          />

          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

export default Home;
