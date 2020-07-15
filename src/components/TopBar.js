import React, { Component } from 'react';
import logo from '../assets/images/logo.svg';

class TopBar extends Component {
    render() {
        return (
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <span className="App-title">Around</span>
            </header>
        )
    }
}

export default TopBar;