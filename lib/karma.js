var crypto = require('crypto');
var coArray = require('co-array');

function Blessing(addonStore, tenant) {
  if (!(this instanceof Blessing)) {
    return new Blessing(addonStore, tenant);
  }
  var groupKey = crypto.createHash('sha1')
    .update(String(tenant.group))
    .update(tenant.links.capabilities)
    .digest('hex');
  this._store = addonStore.narrow(groupKey);
}

var proto = Blessing.prototype;

proto.forUser = function (userId) {
  return this._forSubject('user', userId);
};

proto.updateUser = function (user, change) {
  var self = this;
  return function *() {
    yield self.saveUser(user);
    return yield self._updateSubject('user', user.id, change);
  };
};

proto.forThing = function (thingName) {
  return this._forSubject('thing', thingName);
};

proto.updateThing = function (thingName, change) {
  return this._updateSubject('thing', thingName, change);
};

proto._forSubject = function (type, subject) {
  var self = this;
  return function *() {
    var key = self._subjectKey(type, subject);
    return (yield self._store.get(key)) || 0;
  };
};

proto._updateSubject = function (type, subject, change) {
  var self = this;
  return function *() {
    var key = self._subjectKey(type, subject);
    var blessing = ((yield self._store.get(key)) || 0) + change;
    yield self._store.set(key, blessing);
    return blessing;
  };
};

proto.saveUser = function (user) {
  var self = this;
  return function *() {
    yield self._store.set('user-info:' + user.id, user);
  };
};

proto.loadUser = function (userId) {
  var self = this;
  return function *() {
    return yield self._store.get('user-info:' + userId);
  };
};

proto.isEnabled = function (roomId) {
  var self = this;
  return function *() {
    return (yield self._store.get(self._roomKey(roomId))) !== false;
  };
};

proto.setEnabled = function (roomId, isEnabled) {
  var self = this;
  return function *() {
    yield self._store.set(self._roomKey(roomId), isEnabled);
  };
};

proto.list = function (type, desc) {
  var self = this;
  return function *() {
    var all = yield self._store.all();

    var list = Object.keys(all).filter(function (key) {
      return key.indexOf(type + ':') === 0;
    }).map(function (key) {
      var name = key.slice(type.length + 1);
      var blessing = ('     ' + all[key]).slice(-5);
      return {
        name: name,
        blessing: blessing
      };
    }).sort(function (a, b) {
      var delta = a.blessing - b.blessing;
      return desc ? -delta : delta;
    }).slice(0, 9);
    
    if (type === 'user') {
      list = yield coArray(list).map(function *(entry) {
        if (type === 'user') {
          var user = yield self.loadUser(entry.name);
          if (user && user.name) {
            entry.name = user.name;
          } else {
            entry.name = entry.name + ' (update blessing to see user name)';
          }
        }
        return entry;
      }).result;
    }
    
    return list;
  };
};

proto._subjectKey = function (type, subject) {
  return type + ':' + subject.toString().toLowerCase().trim();
};

proto._roomKey = function (roomId) {
  return 'room:' + roomId;
};

module.exports = Blessing;
