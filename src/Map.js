import React, { Component } from 'react'
import './App.css'
import * as GoogleMapAPI from './GoogleMapAPI'


class Map extends Component {
  /**
  * Append script which calls Maps JavaScript API to index.html
  */
  componentDidMount() {
    GoogleMapAPI.appendScript(this.props.places)
  }

  /**
  * Render the component
  */
  render() {
    return (
      <section id="map-wrapper">
      <div id="map" role="presentation"></div>
      </section>
    )
  }
}

export default Map;
