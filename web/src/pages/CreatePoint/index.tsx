/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable @typescript-eslint/interface-name-prefix */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';
import logo from '../../assets/logo.svg';

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = React.useState<ItemProps[]>([]);
  const [ufs, setUfs] = React.useState<{ uf: string; name: string }[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);
  const [initialPosition, setInitialPosition] = React.useState<
    [number, number]
  >([0, 0]);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedUF, setUFSelected] = React.useState('0');
  const [selectedCity, setCitySelected] = React.useState('0');
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = React.useState<
    [number, number]
  >([0, 0]);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  React.useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

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

  function handleSelectedUF(event: React.ChangeEvent<HTMLSelectElement>): void {
    setUFSelected(event.target.value);
  }
  function handleSelectedCity(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    setCitySelected(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent): void {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number): void {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    /* eslint-disable no-shadow */
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const items = selectedItems;
    const [latitude, longitude] = selectedPosition;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };

    await api.post('points', data);
    alert('Ponto de coleta criado!');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft /> Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do
          <br />
          Ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="tel"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUF}
                onChange={handleSelectedUF}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf.uf} value={uf.uf}>
                    {uf.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
              >
                {cities.length === 0 ? (
                  <option value="0">Selecione uma cidade</option>
                ) : (
                  cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(({ id, title, image_url }) => (
              <li
                key={id}
                onClick={() => handleSelectItem(id)}
                className={selectedItems.includes(id) ? 'selected' : ''}
              >
                <img src={image_url} alt={title} />
                <span>{title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
