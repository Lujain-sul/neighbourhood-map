import React, { Component } from 'react'
import './App.css'
import Map from './Map'
import PlacesList from './PlacesList'
import * as GoogleMapAPI from './GoogleMapAPI'


class App extends Component {
  /**
  * Favourite places to be shown in the map
  */
  state = {
    places: []
  }

  /**
  * Initialize favourite places
  */
  componentDidMount() {
    GoogleMapAPI.getPlaces().then((places) => {
      this.setState({ places })
    })
  }

  /**
  * Render the component
  */
  render() {
    return (
      <main role="main">
      <PlacesList places={this.state.places} />
      {
        this.state.places.length !== 0 &&
        <Map places={this.state.places} />
      }
      </main>
    );
  }
}

export default App;
