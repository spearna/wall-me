pw.component.register('mutable', function (view, config) {
  var that = this;
  this.mutate = function (target) {
    _.each(this.state.diff(target), function (diff) {
      //TODO determine where this cleanup should happen and if
      // we even need to track `node` to begin with
      delete diff.node;

      var input = {};
      var datum = _.clone(diff);
      delete datum.guid;
      delete datum.scope;
      delete datum.id;

      input[diff.scope] = datum;

      var message = {
        action: 'call_route',
        input: input
      };

      if (view.node.tagName === 'FORM') {
        var method;
        var $methodOverride = view.node.querySelector('input[name="_method"]');
        if ($methodOverride) {
          method = $methodOverride.value;
        } else {
          method = view.node.getAttribute('method');
        }

        message.method = method;
        message.uri = view.node.getAttribute('action');
      } else {
        //TODO deduce uri / method
      }

      // that.didMutate();

      //TODO move this to a `performMutate` method on component
      var self = this;
      window.socket.send(message, function (res) {
        // if (res.status === 200) {
        //   self.state.revert();
        // } else if (res.status === 302) { // follow the redirect
        //   var dest = res.headers.Location;
        //   //TODO should Navigator really be handling notifications???
        //   History.pushState({ uri: dest, notify: res.headers['Pakyow-Notify'] }, dest, dest);
        //   return;
        // } else { // mutation was rejected
        //   console.log('reverting mutation');
        //   self.state.rollback(diff.guid);

        //   if (res.headers['Pakyow-Notify']) {
        //     pw.component.push({
        //       channel: 'notification:published',
        //       payload: {
        //         notification: res.headers['Pakyow-Notify']
        //       }
        //     });
        //   }

        //   //TODO possibly emit some event that other components can listen for
        //   // thinking about things like notifying the user of the revert
        // }

        //TODO here's a thought; rather than putting all this logic here what if
        // we just emit a `response:received` notification and let history + notifier
        // handle it for each of their cases? only downside is notifier would present
        // the notification which would be undone by navigator, but the backend could
        // also render the notification so it comes back anyway; not super elegant :/

        if (res.status === 302 && res.headers.Location !== window.location.pathname) {
          var dest = res.headers.Location;
          //TODO trigger a response:redirect instead and let navigator subscribe
          history.pushState({ uri: dest }, dest, dest);
          return;
        } else if (res.status === 400) {
          // bad request
        } else {
          self.state.rollback(diff.guid);
        }

        pw.component.push({
          channel: 'response:received',
          payload: {
            response: res
          }
        });

        self.state.revert();
        view.applyState(self.state.current);
      });
    }, this);
  }

  var node = view.node;

  var self = this;
  var callback = function (evt) {
    evt.preventDefault();
    self.mutate(evt.target);
  };

  // set the initial state
  this.state = pw.state.init(node);

  // set the endpoint
  // this.endpoint = window.socket;

  if (node.tagName === 'FORM') {
    node.addEventListener('submit', callback);
  }

  if (node.tagName === 'INPUT') {
    if (node.type === 'checkbox') {
      node.addEventListener('change', callback);
    }
  }

  //TODO other mutable things

  node._hasEventListener = true;
  node.addEventListener('mutate', callback);
});
