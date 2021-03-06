import React, { Component } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import Slider from '@material-ui/core/Slider';
import {
  getWeatherForLocation,
  Weather,
  getWeatherForCity,
} from './api/weather';
import { BackgroundColors, StaticContentAPI } from './constants';

interface AppState {
  loading: boolean;
  errorMsg: string;
  userLocation: UserLocation;
  weatherCondition: Weather;
  searchCity: string;
}

export type UserLocation = {
  latt: number;
  long: number;
};

class App extends Component<{}, AppState> {
  state = {
    loading: true,
    errorMsg: '',
    userLocation: {
      latt: 0,
      long: 0,
    },
    weatherCondition: {
      description: '',
      icon: '',
      id: 0,
      main: '',
      degrees: 0,
    },
    searchCity: '',
  };

  // Get weather data for users current location
  componentDidMount() {
    // request users location
    navigator.geolocation.getCurrentPosition(
      this.onLocationGet,
      this.onLocationGetFail
    );
  }

  onLocationGet = (position: Position) => {
    this.setState(
      {
        userLocation: {
          latt: position.coords.latitude,
          long: position.coords.longitude,
        },
      },
      async () => {
        const { latt, long } = this.state.userLocation;
        const weatherCondition = await getWeatherForLocation({ latt, long });
        // handle API error
        if (typeof weatherCondition === 'string') {
          this.setState({
            errorMsg: 'Unable to fetch weather for your location, try later',
            loading: false,
          });
          return;
        }
        this.setState({ weatherCondition, loading: false });
      }
    );
  };

  onLocationGetFail = (error: PositionError) =>
    this.setState({
      errorMsg: 'Unable to get your location',
      loading: false,
    });

  search = async () => {
    const { searchCity } = this.state;

    this.setState(
      {
        loading: true,
      },
      async () => {
        const weather = await getWeatherForCity(searchCity);
        // handle API error
        if (typeof weather === 'string') {
          this.setState({
            errorMsg:
              'Unable to fetch weather for the searched location, try later',
            loading: false,
          });
          return;
        }

        this.setState({
          loading: false,
          weatherCondition: weather,
          errorMsg: '',
        });
      }
    );
  };

  // returns HEX of background color representing current weather status
  getBackground = (): string => {
    const {
      weatherCondition: { degrees },
      loading,
    } = this.state;

    if (loading) {
      return BackgroundColors.default;
    }

    if (degrees <= -10) {
      return BackgroundColors.snow;
    } else if (degrees > -10 && degrees <= 10) {
      return BackgroundColors.cool;
    } else if (degrees > 10 && degrees <= 30) {
      return BackgroundColors.warm;
    } else if (degrees > 30) {
      return BackgroundColors.hot;
    } else {
      return BackgroundColors.default;
    }
  };

  // returns URL of icon representing current weather status
  getWeatherIcon = (): string => {
    const {
      weatherCondition: { icon },
    } = this.state;

    return `${StaticContentAPI}/img/wn/${icon}@2x.png`;
  };

  onSliderChange = (event: any, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      this.setState((prevState: AppState) => ({
        weatherCondition: {
          ...prevState.weatherCondition,
          degrees: newValue,
        },
      }));
    }
  };

  render(): JSX.Element {
    const backgroundColor = this.getBackground();
    const weatherIcon = this.getWeatherIcon();
    const {
      weatherCondition: { description, degrees },
      loading,
      errorMsg,
    } = this.state;
    return (
      <div className="pageContainer" style={{ backgroundColor }}>
        {loading ? (
          <ClipLoader
            size={50}
            color={'#123abc'}
            loading={this.state.loading}
          />
        ) : (
          <div className="pageContent">
            <div className="searchBarContainer">
              <input
                className="searchInput"
                placeholder="Enter city name"
                onChange={(event: any) => {
                  this.setState({
                    searchCity: event.target.value,
                  });
                }}
              />
              <button
                type="button"
                className="searchButton"
                onClick={this.search}
              >
                Search
              </button>
            </div>

            {errorMsg ? (
              <h1 className="errorLabel">{errorMsg}</h1>
            ) : (
              <>
                <div className="weatherResults">
                  <img
                    src={weatherIcon}
                    className="weatherIcon"
                    alt="Weather Icon"
                  />
                  <div className="weatherStats">
                    <p className="weatherDegrees">
                      {degrees > 0 ? '+' : degrees === 0 ? '' : '-'}
                      {degrees}°C
                    </p>
                    <p className="weatherDescription">It's {description}</p>
                  </div>
                </div>
                <Slider
                  className="weatherSlider"
                  min={-50}
                  max={50}
                  value={degrees}
                  onChange={this.onSliderChange}
                  aria-labelledby="continuous-slider"
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
