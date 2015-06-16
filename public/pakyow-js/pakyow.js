//TODO we're only using the following fns from underscore, and it's adding ~20kb to the lib,
// effectively doubling its size. let's remove this dependency.
// each,map,flatten,filter,rest,chain,last,isFunction,pairs,without,findWhere,contains,clone

var pw = {};
(function() {
pw.util = {};

pw.util.guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
pw.init = {};

var initFns = [];
pw.init.register = function (fn) {
  initFns.push(fn);
};

document.addEventListener("DOMContentLoaded", function(event) {
  _.each(initFns, function (fn) {
    fn();
  });
});
pw.node = {};

// returns the value of the node
pw.node.value = function (node) {
  if (node.tagName === 'INPUT') {
    if (node.type === 'checkbox') {
      if (node.checked) {
        return node.name ? node.name : true;
      } else {
        return false;
      }
    }

    return node.value;
  } else if (node.tagName === 'TEXTAREA') {
    return node.value;
  }

  return node.textContent.trim();
}

/*
  Returns a representation of the node's state. Example:

  <div data-scope="list" data-id="1">
    <div data-scope="task" data-id="1">
      <label data-prop="desc">
        foo
      </label>
    </div>
  </div>

  [ [ { node: ..., id: '1', scope: 'list' }, [ { node: ..., id: '1', scope: 'task' }, [ { node: ..., prop: 'body' } ] ] ] ]
*/

pw.node.significant = function(node, arr) {
  if(node === document) node = document.getElementsByTagName('body')[0];
  if(arr === undefined) arr = [];

  var sigInfo, sigObj, sigArr, nextArr;
  if(sigInfo = pw.node.isSignificant(node)) {
    sigObj = { node: sigInfo[0], type: sigInfo[1] };
    sigArr = [sigObj, []];
    arr.push(sigArr);

    nextArr = sigArr[1];
  } else {
    nextArr = arr;
  }

  var children = node.children;
  for(var i = 0; i < children.length; i++) {
    pw.node.significant(children[i], nextArr);
  }

  return arr;
}

// attributes that would make a node significant
var sigAttrs = ['data-scope', 'data-prop'];

// returns node and an indication of it's significance
// (e.g value of scope/prop); returns false otherwise
pw.node.isSignificant = function(node) {
  var attr;

  //TODO use each
  for(var i = 0; i < sigAttrs.length; i++) {
    attr = sigAttrs[i]

    if(node.hasAttribute(attr)) {
      return [node, attr.split('-')[1]];
    }
  }

  return false;
}

pw.node.mutable = function (node) {
  return _.chain(pw.node.significant(node)).flatten().filter(function (node) {
    return pw.node.isMutable(node.node);
  }).map(function (node) {
    return node.node;
  });
}

// returns true if the node can mutate via interaction
pw.node.isMutable = function(node) {
  if (node.tagName === 'FORM') {
    return true;
  }

  if (node.tagName === 'INPUT' && !node.disabled) {
    return true;
  }

  return false;
}

// triggers evtName on node with data
pw.node.trigger = function (evtName, node, data) {
  var evt = document.createEvent('Event');
  evt.initEvent(evtName, true, true);
  node._evtData = data;
  node.dispatchEvent(evt);
}

// replaces an event listener's callback for node by name
pw.node.replaceEventListener = function (evtName, node, cb) {
  node.removeEventListener(evtName);
  node.addEventListener(evtName, cb);
}

// finds and returns scope for node
pw.node.scope = function (node) {
  if (node.getAttribute('data-scope')) {
    return node;
  }

  return pw.node.scope(node.parentNode);
}

// returns the name of the scope for node
pw.node.scopeName = function (node) {
  if (node.getAttribute('data-scope')) {
    return node.getAttribute('data-scope');
  }

  return pw.node.scopeName(node.parentNode);
}

// finds and returns prop for node
pw.node.prop = function (node) {
  if (node.getAttribute('data-prop')) {
    return node;
  }

  return pw.node.prop(node.parentNode);
}

// returns the name of the prop for node
pw.node.propName = function (node) {
  if (node.getAttribute('data-prop')) {
    return node.getAttribute('data-prop');
  }

  return pw.node.propName(node.parentNode);
}

// creates a context in which view manipulations can occur
pw.node.with = function(node, cb) {
  cb.call(node);
};

pw.node.for = function(node, data, cb) {
  if(!(node instanceof Array) && !pw.node.isNodeList(node)) node = [node];
  if(!(data instanceof Array)) data = [data];

  _.each(node, function (e, i) {
    cb.call(e, data[i]);
  });
};

pw.node.match = function(node, data) {
  if(!(node instanceof Array) && !pw.node.isNodeList(node)) node = [node];
  if(!(data instanceof Array)) data = [data];

  var collection = [];
  //TODO use each
  for(var i = 0; i < data.length; i++) {
    var view = node[i];

    // out of views, use the last one
    if(!view) {
      view = _.last(node);
    }

    var dup = view.cloneNode(true);
    view.parentNode.insertBefore(dup);

    collection.push(dup);
  }

  for(var i = 0; i < node.length; i++) {
    node[i].parentNode.removeChild(node[i]);
  }

  return collection;
};

pw.node.repeat = function(node, data, cb) {
  pw.node.for(pw.node.match(node, data), data, cb);
};

// binds an object to a node
pw.node.bind = function (data, node, cb) {
  //TODO be smarter about when bindings are found
  // or use significant for view instance and pass?
  var bindings = pw.node.findBindings(node);
  var scope = bindings[0];

  pw.node.for(node, data, function(datum) {
    if (!datum) return;

    if(datum.id) this.setAttribute('data-id', datum.id);
    pw.node.bindDataToScope(datum, scope, node);
    if(!(typeof cb === 'undefined')) cb.call(this, datum);
  });
}

pw.node.apply = function (data, node, cb) {
  var coll = pw.node.match(node, data);
  pw.node.bind(data, coll, cb);
  return coll;
}

pw.node.findBindings = function (node) {
  var bindings = [];
  pw.node.breadthFirst(node, function() {
    var o = this;
    var scope = o.getAttribute('data-scope');
    if(!scope) return;

    var props = [];
    pw.node.breadthFirst(o, function() {
      var so = this;

      // don't go into deeper scopes
      if(o != so && so.getAttribute('data-scope')) return;

      var prop = so.getAttribute('data-prop');
      if(!prop) return;
      props.push({ prop:prop, doc:so });
    });

    bindings.push({ scope: scope, doc: o, props: props });
  });

  return bindings;
}

pw.node.bindDataToScope = function (data, scope, node) {
  if(!data) return;
  if(!scope) return;

  //TODO use each
  for(var i = 0; i < scope['props'].length; i++) {
    var p = scope['props'][i];

    k = p['prop'];
    v = data[k];

    if(!v) {
      v = '';
    }

    if(typeof v === 'object') {
      pw.node.bindAttributesToNode(v, p['doc']);
    } else {
      pw.node.bindValueToNode(v, p['doc']);
    }
  }
}

pw.node.bindAttributesToNode = function (attrs, doc) {
  for(var attr in attrs) {
    var value = attrs[attr];
    if(attr === 'content') {
      pw.node.bindValueToNode(value, doc);
      continue;
    }

    if(_.isFunction(value)) value = value.call(doc.getAttribute(attr));
    !value ? pw.node.removeAttr(doc, attr) : pw.node.setAttr(doc, attr, value);
  }
}

pw.node.bindValueToNode = function (value, doc) {
  if(pw.node.isTagWithoutValue(doc)) return;

  //TODO handle other form fields (port from pakyow-presenter)
  if (doc.tagName === 'INPUT' && doc.type === 'checkbox') {
    if (value === true || (doc.value && value === doc.value)) {
      doc.checked = true;
    } else {
      doc.checked = false;
    }
  } else {
    pw.node.isSelfClosingTag(doc) ? doc.value = value : doc.textContent = value;
  }
}

var valuelessTags = ['SELECT'];
pw.node.isTagWithoutValue = function(node) {
  return valuelessTags.indexOf(node.tagName) != -1 ? true : false;
};

var selfClosingTags = ['AREA', 'BASE', 'BASEFONT', 'BR', 'HR', 'INPUT', 'IMG', 'LINK', 'META'];
pw.node.isSelfClosingTag = function(node) {
  return selfClosingTags.indexOf(node.tagName) != -1 ? true : false;
};

pw.node.breadthFirst = function (node, cb) {
  var queue = [node];
  while (queue.length > 0) {
    var subNode = queue.shift();
    if (!subNode) continue;
    if(typeof subNode == "object" && "nodeType" in subNode && subNode.nodeType === 1 && subNode.cloneNode) {
      cb.call(subNode);
    }

    var children = subNode.childNodes;
    if (children) {
      for(var i = 0; i < children.length; i++) {
        queue.push(children[i]);
      }
    }
  }
}

pw.node.isNodeList = function(nodes) {
  return typeof nodes.length !== 'undefined';
}

pw.node.byAttr = function (node, attr, compareValue) {
  var arr = [];
  var os = pw.node.all(node);
  for(var i = 0; i < os.length; i++) {
    var o = os[i];
    var value = o.getAttribute(attr);

    if(value !== null && ((typeof compareValue) === 'undefined' || value == compareValue)) {
      arr.push(o);
    }
  }

  return arr;
}

pw.node.setAttr = function (node, attr, value) {
  node.setAttribute(attr, value);
}

pw.node.removeAttr = function (node, attr) {
  node.removeAttribute(attr);
}

pw.node.hasAttr = function (node, attr) {
  return node.hasAttribute(attr);
}

pw.node.getAttr = function (node, attr) {
  return node.getAttribute(attr);
}

pw.node.all = function (node) {
  var arr = [];

  if(document !== node) arr.push(node);

  var os = node.getElementsByTagName('*');
  for(var i = 0; i < os.length; i++) {
    arr.push(os[i]);
  }

  return arr;
}

pw.node.clone = function (node) {
  return node.cloneNode(true);
}

pw.node.before = function (node, newNode) {
  node.parentNode.insertBefore(newNode, node);
}

pw.node.after = function (node, newNode) {
  node.parentNode.insertBefore(newNode, this.nextSibling);
}

pw.node.replace = function (node, newNode) {
  node.parentNode.replaceChild(newNode, node);
};

pw.node.append = function (node, newNode) {
  node.appendChild(newNode);
}

pw.node.prepend = function (node, newNode) {
  node.insertBefore(newNode, node.firstChild);
}

pw.node.remove = function (node) {
  node.parentNode.removeChild(node);
};

pw.node.text = function (node, value) {
  node.innerText = value;
};

pw.node.html = function (node, value) {
  node.innerHTML = value;
};

pw.node.clear = function (node) {
  while (node.firstChild) {
    pw.node.remove(node.firstChild);
  }
};

pw.node.title = function (node, value) {
  var titleNode = node.getElementsByTagName('title')[0];

  if (titleNode) {
    pw.node.text(titleNode, value);
  }
};
pw.attrs = {};

pw.attrs.init = function (view_or_views) {
  return new pw_Attrs(pw.collection.init(view_or_views));
};

var attrTypes = {
  hash: ['style'],
  bool: ['selected', 'checked', 'disabled', 'readonly', 'multiple'],
  mult: ['class']
};

var pw_Attrs = function (collection) {
  this.views = collection.views;
};

pw_Attrs.prototype.findType = function (attr) {
  if (attrTypes.hash.indexOf(attr) > -1) return 'hash';
  if (attrTypes.bool.indexOf(attr) > -1) return 'bool';
  if (attrTypes.mult.indexOf(attr) > -1) return 'mult';
  return 'text';
};

pw_Attrs.prototype.findValue = function (view, attr) {
  if (attr === 'class') {
    return view.node.classList;
  } else if (attr === 'style') {
    return view.node.style;
  } else if (this.findType(attr) === 'bool') {
    return pw.node.hasAttr(view.node, attr);
  } else { // just a text attr
    return pw.node.getAttr(view.node, attr);
  }
};

pw_Attrs.prototype.set = function (attr, value) {
  _.each(this.views, function (view) {
    pw.node.setAttr(view.node, attr, value);
  });
};

pw_Attrs.prototype.ensure = function (attr, value) {
  _.each(this.views, function (view) {
    var currentValue = this.findValue(view, attr);

    if (attr === 'class') {
      if (!currentValue.contains(value)) {
        currentValue.add(value);
      }
    } else if (attr === 'style') {
      _.each(_.pairs(value), function (kv) {
        view.node.style[kv[0]] = kv[1];
      });
    } else if (this.findType(attr) === 'bool') {
      if (!pw.node.hasAttr(view.node, attr)) {
        pw.node.setAttr(view.node, attr, attr);
      }
    } else { // just a text attr
      var currentValue = pw.node.getAttr(view.node, attr) || '';
      if (!currentValue.match(value)) {
        pw.node.setAttr(view.node, attr, currentValue + value);
      }
    }
  }, this);
};

pw_Attrs.prototype.deny = function (attr, value) {
  _.each(this.views, function (view) {
    var currentValue = this.findValue(view, attr);
    if (attr === 'class') {
      if (currentValue.contains(value)) {
        currentValue.remove(value);
      }
    } else if (attr === 'style') {
      _.each(_.pairs(value), function (kv) {
        view.node.style[kv[0]] = view.node.style[kv[0]].replace(kv[1], '');
      });
    } else if (this.findType(attr) === 'bool') {
      if (pw.node.hasAttr(view.node, attr)) {
        pw.node.removeAttr(view.node, attr);
      }
    } else { // just a text attr
      pw.node.setAttr(view.node, attr, pw.node.getAttr(view.node, attr).replace(value, ''));
    }
  }, this);
};
/*
  State related functions.
*/

pw.state = {};

pw.state.build = function (sigArr, parentObj) {
  var retState = [];
  for (var i = 0; i < sigArr.length; i++) {
    var nodeState = pw.state.buildForNode(sigArr[i], parentObj);
    if (!nodeState) continue;
    retState.push(nodeState);
  }

  return retState;
}

pw.state.buildForNode = function (sigTuple, parentObj) {
  var sig = sigTuple[0];
  var obj = {};

  if (sig.type === 'scope') {
    obj.scope = sig.node.getAttribute('data-scope');
    obj.id = sig.node.getAttribute('data-id');
  } else if (sig.type === 'prop' && parentObj) {
    parentObj[sig.node.getAttribute('data-prop')] = pw.node.value(sig.node);
    return;
  }

  return [obj, pw.state.build(sigTuple[1], obj)];
}

// creates and returns a new pw_State for the document or node
pw.state.init = function (node) {
  return new pw_State(node);
}


/*
  pw_State represents the state for a document or node.
*/

var pw_State = function (node) {
  this.initial = pw.state.build(pw.node.significant(node));
  this.current = JSON.parse(JSON.stringify(this.initial));
  this.diffs = [];
}

// diff the node and capture any changes
pw_State.prototype.diff = function (node) {
  return _.map(_.flatten(pw.state.build(pw.node.significant(pw.node.scope(node)))), function (nodeState) {
    var last = this.node(nodeState);

    var diffObj = {
      node: node,
      guid: pw.util.guid(),
      scope: nodeState.scope,
      id: nodeState.id
    };

    for (var key in nodeState) {
      if(!last || nodeState[key] !== last[key]) {
        diffObj[key] = nodeState[key];
      }
    }

    this.diffs.push(diffObj);
    // this.update(diffObj);

    return diffObj;
  }, this);
}

// update the current state (or state if passed) with diff
pw_State.prototype.update = function (diff, state) {
  _.each(_.filter(_.flatten(state || this.current), function (s) {
    return s.scope === diff.scope && s.id === diff.id;
  }), function (s) {
    for (var key in diff) {
      if (key === 'guid') continue;
      if (s[key] !== diff[key]) {
        s[key] = diff[key];
      }
    }
  });
}

// reverts back to the initial state, capturing the revert as a diff
pw_State.prototype.revert = function () {
  var diff = this.initial[0][0];
  this.diffs.push(diff);
  this.update(diff);
}

// rollback a diff by guid
pw_State.prototype.rollback = function (guid) {
  _.each(this.diffs, function (diff, i) {
    if (diff.guid === guid) {
      // rebuild state by starting at initial and applying diffs before i
      var rbState = JSON.parse(JSON.stringify(this.initial));
      _.each(this.diffs, function (aDiff) {
        if (diff.guid === aDiff.guid) {
          return;
        }

        this.update(aDiff, rbState);
      }, this);

      // apply diffs after i to get new current
      _.each(_.rest(this.diffs, i + 1), function (aDiff) {
        this.update(aDiff, rbState);
      }, this);

      // remove diff
      this.diffs.splice(i, 1);

      // set current state
      this.current = rbState;

      return;
    }
  }, this);
}

// returns the current state for a node
pw_State.prototype.node = function (nodeState) {
  return _.filter(_.flatten(this.current), function (s) {
    return s.scope === nodeState.scope && s.id === nodeState.id;
  })[0];
}
/*
  View related functions.
*/

pw.view = {};

// creates and returns a new pw_View for the document or node
pw.view.init = function (node) {
  return new pw_View(node);
}

/*
  pw_View contains a document with state. It watches for
  interactions with the document that trigger mutations
  in state. It can also apply state to the view.
*/

var pw_View = function (node) {
  this.node = node;
}

pw_View.prototype.applyState = function (stateArr, nodes) {
  if(!nodes) {
    nodes = pw.node.significant(this.node);
  }

  _.each(stateArr, function (state, i) {
    var node = nodes[i];
    pw.node.bind(state[0], node[0].node);
    this.applyState(state[1], node[1])
  }, this);
};

pw_View.prototype.clone = function () {
  return pw.view.init(pw.node.clone(this.node));
}

// pakyow api

pw_View.prototype.remove = function () {
  pw.node.remove(this.node);
};

pw_View.prototype.clear = function () {
  pw.node.clear(this.node);
};

pw_View.prototype.title = function (value) {
  pw.node.title(this.node, value);
};

pw_View.prototype.text = function (value) {
  pw.node.text(node, value);
};

pw_View.prototype.html = function (value) {
  pw.node.html(node, value);
};

pw_View.prototype.after = function (view) {
  pw.node.after(this.node, view.node);
}

pw_View.prototype.before = function (view) {
  pw.node.before(this.node, view.node);
}

pw_View.prototype.replace = function (view) {
  pw.node.replace(this.node, view.node);
}

pw_View.prototype.append = function (view) {
  pw.node.append(this.node, view.node);
}

pw_View.prototype.prepend = function (view) {
  pw.node.prepend(this.node, view.node);
}

pw_View.prototype.attrs = function () {
  return pw.attrs.init(this);
};

pw_View.prototype.scope = function (name) {
  return _.map(pw.node.byAttr(this.node, 'data-scope', name), function (node) {
    return pw.view.init(node);
  });
};

pw_View.prototype.prop = function (name) {
  return _.map(pw.node.byAttr(this.node, 'data-prop', name), function (node) {
    return pw.view.init(node);
  });
};

pw_View.prototype.component = function (name) {
  return _.map(pw.node.byAttr(this.node, 'data-ui', name), function (node) {
    return pw.view.init(node);
  });
};

pw_View.prototype.with = function (cb) {
  pw.node.with(this.node, cb);
};

pw_View.prototype.match = function (data) {
  pw.node.match(this.node, data);
};

pw_View.prototype.for = function (data, cb) {
  pw.node.for(this.node, data, cb);
};

pw_View.prototype.repeat = function (data, cb) {
  pw.node.repeat(this.node, data, cb);
};

pw_View.prototype.bind = function (data, cb) {
  pw.node.bind(data, this.node, cb);
};

pw_View.prototype.apply = function (data, cb) {
  pw.node.apply(data, this.node, cb);
};
pw.collection = {};

pw.collection.init = function (view_or_views, selector) {
  if (view_or_views instanceof pw_Collection) {
    return view_or_views
  } else if (view_or_views.constructor !== Array) {
    view_or_views = [view_or_views];
  }

  return new pw_Collection(view_or_views, selector);
};

pw.collection.fromNodes = function (nodes, selector) {
  return pw.collection.init(_.map(nodes, function (node) {
    return pw.view.init(node);
  }), selector);
}

var pw_Collection = function (views, selector) {
  this.views = views;
  this.selector = selector;
};

pw_Collection.prototype.find = function (query) {
  var localSelector = this.selector;

  _.each(_.pairs(query), function (pair) {
    localSelector += '[data-' + pair[0] + '="' + pair[1] + '"]';
  });

  return pw.collection.fromNodes(document.querySelectorAll(localSelector), localSelector);
};

pw_Collection.prototype.removeView = function(view) {
  view.remove();
  this.views = _.without(this.views, _.findWhere(this.views, view));
};

pw_Collection.prototype.addView = function(view) {
  var lastView = this.views[this.views.length - 1];
  pw.node.after(lastView.node, view.node);
  this.views.push(view);
};

//TODO look into a more efficient way of reordering nodes
pw_Collection.prototype.order = function (orderedIds) {
  _.each(orderedIds, function (id) {
    var match = _.find(this.views, function (view) {
      return parseInt(view.node.getAttribute('data-id')) === id;
    });

    match.node.parentNode.appendChild(match.node);
  }, this);
};

pw_Collection.prototype.length = function () {
  return this.views.length;
};

// pakyow api

pw_Collection.prototype.attrs = function () {
  return pw.attrs.init(this.views);
};

pw_Collection.prototype.remove = function() {
  _.each(this.views, function (view) {
    view.remove();
  });
};

pw_Collection.prototype.clear = function() {
  _.each(this.views, function (view) {
    view.clear();
  });
};

pw_Collection.prototype.text = function(value) {
  _.each(this.views, function (view) {
    view.text(value);
  });
};

pw_Collection.prototype.html = function(value) {
  _.each(this.views, function (view) {
    view.html(value);
  });
};

pw_Collection.prototype.append = function (data) {
  var last = this.views[this.views.length - 1];
  this.views.push(last.append(data));
  return last;
};

pw_Collection.prototype.prepend = function(data) {
  var firstView = this.views[0];

  var prependedViews = _.map(data, function (datum) {
    var view = firstView.prepend(datum);
    this.views.push(view);
    return view;
  }, this);

  return pw.collection.init(prependedViews);
};

pw_Collection.prototype.scope = function (name) {
  return pw.collection.init(
    _.reduce(this.views, [], function (views, view) {
      return views.concat(view.scope(name));
    })
  );
};

pw_Collection.prototype.prop = function (name) {
  return pw.collection.init(
    _.reduce(this.views, [], function (views, view) {
      return views.concat(view.prop(name));
    })
  );
};

pw_Collection.prototype.component = function (name) {
  return pw.collection.init(
    _.reduce(this.views, [], function (views, view) {
      return views.concat(view.component(name));
    })
  );
};

pw_Collection.prototype.with = function (cb) {
  pw.node.with(this.views, cb);
};

pw_Collection.prototype.for = function(data, fn) {
  if(!(data instanceof Array)) data = [data];

  _.each(this.views, function (view, i) {
    fn.call(view, data[i]);
  });
};

pw_Collection.prototype.match = function (data, fn) {
  if(!(data instanceof Array)) data = [data];

  if (data.length === 0) {
    this.remove();
    return fn.call(this);
  } else {
    _.each(this.views, function (view) {
      var id = parseInt(view.node.getAttribute('data-id'));
      if (!id) return;
      if (!_.find(data, function (datum) { return datum.id === id })) {
        this.removeView(view);
      }
    }, this);

    if (data.length > this.views.length) {
      var channel = this.views[0].node.getAttribute('data-channel');
      var that = this;

      window.socket.fetchView(channel, function (view) {
        _.each(data, function (datum) {
          if (!_.find(that.views, function (view) { return parseInt(view.node.getAttribute('data-id')) === datum.id })) {
            that.addView(view.clone());
          }
        }, that);

        return fn.call(that);
      });
    } else {
      return fn.call(this);
    }
  }

  return this;
};

pw_Collection.prototype.repeat = function (data, fn) {
  this.match(data, function () {
    this.for(data, fn);
  });
};

pw_Collection.prototype.bind = function (data, fn) {
  this.for(data, function(datum) {
    this.bind(datum);
    if(!(typeof fn === 'undefined')) fn.call(this, datum);
  });

  return this;
};

pw_Collection.prototype.apply = function (data, fn) {
  this.match(data, function () {
    this.bind(data, fn);
    this.order(_.map(data, function (datum) { return datum.id; }))
  });
};
/*
  Component init.
*/

pw.init.register(function () {
  pw.component.findAndInit(document.querySelectorAll('body')[0]);
});

/*
  Component related functions.
*/

pw.component = {};

pw.component.init = function () {
  return new pw_Component();
};

// stores component functions by name
var components = {};

// stores component instances by channel
var channelComponents = {};

pw.component.resetChannels = function () {
  channelComponents = {};
};

pw.component.findAndInit = function (node) {
  pw.component.resetChannels();

  _.each(pw.node.byAttr(node, 'data-ui'), function (uiNode) {
    var name = uiNode.getAttribute('data-ui');
    var cfn = components[name];

    if (cfn) {
      var channel = uiNode.getAttribute('data-channel');
      var config = uiNode.getAttribute('data-config');
      var view = pw.view.init(uiNode);

      var component = new cfn(view, pw.component.buildConfigObject(config));
      component.config = config;
      component.view = view;

      pw.component.registerForChannel(component, channel);
    } else {
      console.log('component not found: ' + name);
    }
  });
}

pw.component.push = function (packet) {
  _.each(channelComponents[packet.channel], function (component) {
    component.message(packet.channel, packet.payload);
  });
}

pw.component.register = function (name, fn) {
  fn.prototype.listen = function (channel) {
    pw.component.registerForChannel(this, channel);
  }

  fn.prototype.broadcast = function (payload, channel) {
    pw.component.push({ payload: payload, channel: channel });
  }

  components[name] = fn;
}

pw.component.buildConfigObject = function(configString) {
  var confObj = {};

  if (configString != null) {
    var pairs = configString.split(";");
    for(var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].trim().split(":");
      confObj[kv[0].trim()] = kv[1].trim();
    }
  }

  return confObj;
};

pw.component.registerForChannel = function (component, channel) {
  // store component instance by channel for messaging
  if (!channelComponents[channel]) {
    channelComponents[channel] = [];
  }

  channelComponents[channel].push(component);
};

/*
  pw_Component makes it possible to build custom controls.
*/

var pw_Component = function (cfn, node) {
}
/*
  Socket init.
*/

pw.init.register(function () {
  pw.socket.init({
    cb: function (socket) {
      window.socket = socket;
    }
  });
});

/*
  Socket related functions.
*/

pw.socket = {};

pw.socket.init = function (options) {
  return pw.socket.connect(
    options.host,
    options.port,
    options.protocol,
    options.connId,
    options.cb
  );
};

pw.socket.connect = function (host, port, protocol, connId, cb) {
  if(typeof host === 'undefined') host = window.location.hostname;
  if(typeof port === 'undefined') port = window.location.port;
  if(typeof protocol === 'undefined') protocol = window.location.protocol;
  if(typeof connId === 'undefined') connId = document.getElementsByTagName('body')[0].getAttribute('data-socket-connection-id');

  var wsUrl = '';

  if (protocol === 'http:') {
    wsUrl += 'ws://';
  } else if (protocol === 'https:') {
    wsUrl += 'wss://';
  }

  wsUrl += host;

  if (port) {
    wsUrl += ':' + port;
  }

  wsUrl += '/?socket_connection_id=' + connId;

  return new pw_Socket(wsUrl, cb);
};

var pw_Socket = function (url, cb) {
  var self = this;

  this.callbacks = {};

  this.url = url;
  this.initCb = cb;

  this.ws = new WebSocket(url);

  this.id = url.split('socket_connection_id=')[1]

  this.ws.onmessage = function (evt) {
    var data = JSON.parse(evt.data);
    if (data.id) {
      var cb = self.callbacks[data.id];
      if (cb) {
        cb.call(this, data);
        return;
      }
    }

    self.message(data);
  };

  this.ws.onclose = function (evt) {
    console.log('socket closed');
    self.reconnect();
  };

  this.ws.onopen = function (evt) {
    console.log('socket open');

    if(self.initCb) {
      self.initCb(self);
    }
  }
};

pw_Socket.prototype.send = function (message, cb) {
  message.id = pw.util.guid();
  if (!message.input) {
    message.input = {};
  }
  message.input.socket_connection_id = this.id;
  this.callbacks[message.id] = cb;
  this.ws.send(JSON.stringify(message));
}

//TODO handle custom messages (e.g. not pakyow specific)
pw_Socket.prototype.message = function (packet) {
  console.log('received message');
  console.log(packet);

  var selector = '*[data-channel="' + packet.channel + '"]';

  if (packet.channel.split(':')[0] === 'component') {
    pw.component.push(packet);
    return;
  }

  var nodes = document.querySelectorAll(selector);

  if (nodes.length === 0) {
    //TODO decide how to handle this condition; there are times where this
    // is going to be the case and not an error; at one point we were simply
    // reloading the page, but that doesn't work in all cases
    return;
  }

  pw.instruct.process(pw.collection.fromNodes(nodes, selector), packet, this);
};

pw_Socket.prototype.reconnect = function () {
  var self = this;

  if (!self.socketWait) {
    self.socketWait = 100;
  } else {
    self.socketWait *= 1.25;
  }

  console.log('reconnecting socket in ' + self.socketWait + 'ms');

  setTimeout(function () {
    pw.socket.init({ cb: self.initCb });
  }, self.socketWait);
};

pw_Socket.prototype.fetchView = function (channel, cb) {
  var uri = window.location.pathname + window.location.search;

  this.send({
    action: 'fetch-view',
    channel: channel,
    uri: uri
  }, function (res) {
    var e = document.createElement("div");
    e.innerHTML = res.body;

    var view = pw.view.init(e.childNodes[0]);
    view.node.removeAttribute('data-id');

    cb(view);
  });
}
pw.instruct = {};

pw.instruct.process = function (collection, packet, socket) {
  if (collection.length() === 1 && collection.views[0].node.getAttribute('data-version') === 'empty') {
    pw.instruct.fetchView(packet, socket, collection.views[0].node);
  } else {
    pw.instruct.perform(collection, packet.payload);
  }
};

pw.instruct.fetchView = function (packet, socket, node) {
  socket.fetchView(packet.channel, function (view) {
    var parent = node.parentNode;
    parent.replaceChild(view.node, node);

    var selector = '*[data-channel="' + packet.channel + '"]';
    var nodes = parent.querySelectorAll(selector);
    pw.instruct.perform(pw.collection.fromNodes(nodes, selector), packet.payload);
  });
};

pw.instruct.perform = function (collection, instructions) {
  var self = this;

  _.each(instructions, function (instruction, i) {
    var method = instruction[0];
    var value = instruction[1];
    var nested = instruction[2];

    if (collection[method]) {
      if (method == 'with' || method == 'for' || method == 'bind' || method == 'repeat' || method == 'apply') {
        collection[method].call(collection, value, function (datum) {
          pw.instruct.perform(this, nested);
        });
        return;
      } else if (method == 'attrs') {
        self.performAttr(collection.attrs(), nested);
        return;
      } else {
        var mutatedViews = collection[method].call(collection, value);
      }
    } else {
      console.log('could not find method named: ' + method);
      return;
    }

    if (nested instanceof Array) {
      pw.instruct.perform(mutatedViews, nested);
    } else if (mutatedViews) {
      collection = mutatedViews;
    }
  });
};

pw.instruct.performAttr = function (context, attrInstructions) {
  _.each(attrInstructions, function (attrInstruct) {
    var attr = attrInstruct[0];
    var value = attrInstruct[1];
    var nested = attrInstruct[2];

    if (value) {
      context.set(attr, value);
    } else {
      context[nested[0][0]](attr, nested[0][1]);
    }
  });
}

  if (typeof define === "function" && define.amd) {
    define(pw);
  } else if (typeof module === "object" && module.exports) {
    module.exports = pw;
  } else {
    this.pw = pw;
  }
})();
