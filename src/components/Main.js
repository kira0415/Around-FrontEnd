import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom';
import Register from './Register';
import Login from './Login';

class Main extends Component {
    render() {
        return (
            <div className="main">
                <Switch>
                    <Route path="/register" component={Register}/>
                    <Route path="/login" component={Login}/>
                </Switch>
            </div>
        )
    }
}

export default Main;