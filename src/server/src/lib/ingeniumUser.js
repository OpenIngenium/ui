/**
 * Port of src/ingenium/views/ingenium_user.py (IngeniumUser / IngeniumAnonymousUser).
 * There is no database - the "user" is entirely derived from the JWT access token.
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

class IngeniumUser {
  constructor(accessToken = null) {
    this.access = accessToken;
    this.decodedAccess = null;
  }

  isAuthenticated() {
    return Boolean(this.access);
  }

  decodeAccessJwt() {
    if (!this.decodedAccess && this.access) {
      this.decodedAccess = jwt.verify(this.access, config.AUTH_PUBLIC_PEM, {
        algorithms: config.AUTH_SECRET_KEY_ALGORITHMS,
      });
    }
    return this.decodedAccess;
  }

  getUsername() {
    if (!this.access) return '';
    const decoded = this.decodeAccessJwt();
    return decoded ? decoded.username : '';
  }

  getFullName() {
    return this.getUsername();
  }

  isAdmin() {
    if (!this.access) return false;
    const decoded = this.decodeAccessJwt();
    const scopes = decoded ? decoded.scopes : [];
    return Array.isArray(scopes) && scopes.includes('admin');
  }

  getAccessExpiration() {
    if (!this.access) return null;
    const decoded = this.decodeAccessJwt();
    return decoded ? decoded.exp : null;
  }

  getAccessIat() {
    if (!this.access) return null;
    const decoded = this.decodeAccessJwt();
    return decoded ? decoded.iat : null;
  }

  getPermissions() {
    if (!this.access) return null;
    const decoded = this.decodeAccessJwt();
    return decoded ? decoded.scopes : null;
  }

  getRoles() {
    if (!this.access) return null;
    const decoded = this.decodeAccessJwt();
    return decoded ? decoded.roles : null;
  }

  getToken() {
    return this.access;
  }

  getImageUrl() {
    return this.getUsername() ? '/static/images/default-profile-photo.jpeg' : '';
  }
}

class IngeniumAnonymousUser extends IngeniumUser {
  isAuthenticated() {
    return false;
  }
}

module.exports = { IngeniumUser, IngeniumAnonymousUser };
