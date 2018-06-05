import React, { Component } from 'react'
import './App.css'
import escapeRegExp from 'escape-string-regexp'
import * as GoogleMapAPI from './GoogleMapAPI'


class PlacesList extends Component {
  /**
  * Query to be searched and search results
  */
  state = {
    query: '',
    searchResult: []
  }

  /**
  * Search relevant places when the user is typing a place name 'on typing'
  */
  updateQuery = (event) => {
    this.setState({ query: event.target.value }, () => {
      // Check that query is a valid string
      if (typeof this.state.query === 'string') {
        // Construct regular expression for the query with case insensitive
        const match = new RegExp(escapeRegExp(this.state.query), 'i')

        this.setState({
          searchResult: this.props.places.filter((place) => (match.test(place.title)) )}, () => {
            // Update markers shown in the map according to search result
            GoogleMapAPI.setMarkersVisibility(this.state.searchResult)
          })
        }
      })
    }

    /**
    * Highlight marker associated with selected place
    */
    selectPlace = (event) => {
      GoogleMapAPI.highlightMarker(event.target.innerHTML)
    }

    /**
    * Render the component
    */
    render() {
      return (
        <section>
        {/* Built in bootstrap hamburger menu, aria-expanded value is toggled when menu visibility is changed.
            Guide from https://getbootstrap.com/docs/4.0/components/navbar/#supported-content */}
        <nav className="navbar navbar-dark">
        <button className="navbar-toggler" type="button" data-toggle="collapse"
        data-target="#places-list" aria-expanded="false" aria-label="toggle places search">
        <span className="navbar-toggler-icon"></span>
        </button>
        </nav>

        <aside className="collapse" id="places-list">
        {/* Relevant search results appear on typing */}
        <input className="form-control" id="search-query" type="text" name="query"
        placeholder="Search nearby places" onChange={this.updateQuery} role="search"/>

        <ul className="list-group">
        {/* Check whether there is some relevant result, or it is default state or no matched results */}
        {
          this.state.searchResult.length !== 0 ?
          this.state.searchResult.map((place) => (
            <li className="list-group-item" key={place.id}>
            <button type="button" onClick={this.selectPlace} className="btn btn-link">{place.title}</button>
            </li>
          )) :
          this.state.query.length === 0 ?
          this.props.places.map((place) => (
            <li className="list-group-item" key={place.id}>
            <button type="button" onClick={this.selectPlace} className="btn btn-link">{place.title}</button>
            </li>
          )) :
          <li className="list-group-item">
          <span>No matched places</span>
          </li>
        }
        </ul>
        </aside>
        </section>
      )
    }
  }

  export default PlacesList;
