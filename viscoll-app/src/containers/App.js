import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import light from '../styles/light';
import '../styles/App.css';
import Authentication from './Authentication';
import Dashboard from './Dashboard';
import Project from './Project';
import ProjectViewOnly from './ProjectViewOnly'
import {persistStore} from 'redux-persist'
import store from "../store/store";
import {Provider} from "react-redux";
import AppLoadingScreen from "../components/global/AppLoadingScreen";
import localForage from 'localforage'
import PageNotFound from '../components/global/PageNotFound';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

injectTapEventPlugin();

/** Main app */
class App extends Component {

  constructor() {
    super()
    this.state = { rehydrated: false }
  }

  componentWillMount(){
    persistStore(store, {storage: localForage, whitelist:['user']}, () => {
      setTimeout(()=>{this.setState({ rehydrated: true })}, 500);
    })
  }

  render() {
    if (!this.state.rehydrated) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(light)}>
           <AppLoadingScreen loading={true} /> 
        </MuiThemeProvider>
      )
    }
    return (
      <Provider store={store} > 
        <Router>
          <MuiThemeProvider muiTheme={getMuiTheme(light)}>
            <Switch>
              <Route exact path="/" component={Authentication} />
              <Route path="/confirmation" component={Authentication} />
              <Route path="/password" component={Authentication} />
              <Route path="/dashboard" component={Dashboard} />
              <Route exact path="/project/:id" component={Project} />
              <Route exact path="/project/:id/viewOnly" component={ProjectViewOnly} />
              <Route component={PageNotFound} />
            </Switch>
          </MuiThemeProvider>
        </Router>
      </Provider>
    );
  }
}

export default App;
