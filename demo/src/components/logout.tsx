import React from 'react';
import { Redirect } from '@pawjs/pawjs/redirect';
import Authenticator from './fake-authenticator';

console.log('Am here...');
export default class Logout extends React.Component {
  onLogoutRedirectUrl = '/login';

  state = {
    logout: false,
  };

  componentDidMount() {
    Authenticator.logout();
    this.setState({
      logout: true,
    });
  }

  render() {
    const { logout } = this.state;
    if (logout) {
      return <Redirect to={this.onLogoutRedirectUrl} />;
    }
    return null;
  }
}
