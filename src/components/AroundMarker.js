import React, { Component } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';
import PropTypes from 'prop-types';

import blueMarkerUrl from '../assets/images/blue-marker.svg';

class AroundMarker extends Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
    }
 
    state = {
        isOpen: false
    };

    handleToggle = () => {
        this.setState(preState => ({ isOpen: !preState.isOpen}))
    }

    render() {
        const {isOpen} = this.state;
        const {url, user, message, location} = this.props.post;
        const {lat, lon} = location;
        return (
            <Marker position={{ lat: lat, lng: lon}}
                    onClick={this.handleToggle}>
                {
                    isOpen ? (
                        <InfoWindow>
                            <div>
                                <img src={url} alt={message} className="around-marker-image"/>
                                <p>{`${user}: ${message}`}</p>
                            </div>
                        </InfoWindow>
                    ) : null
                }        
            </Marker>
        )
    }
}

export default  AroundMarker;