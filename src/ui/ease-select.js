define(['src/app'], function (app) {
  return Backbone.View.extend({

    'events': {
      'change': 'onChange'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);
      _.each(Tweenable.prototype.formula, function (formula, name) {
        var option = $(document.createElement('option'), {
            'value': name
          });

        option.html(name);
        this.$el.append(option);
      }, this);
    }

    ,'onChange': function (evt) {
      app.collection.actors.getCurrent().modifyKeyframe(
          app.kapi.animationLength(), {},
          { 'transform': this.getNewEasingString(app) });

      app.view.canvas.backgroundView.update();
      app.kapi.update();
    }

    ,'getNewEasingString': function () {
      var xEasing = this.owner.easeSelectViewX.$el.val();
      var yEasing = this.owner.easeSelectViewY.$el.val();
      var rEasing = this.owner.easeSelectViewR.$el.val();

      return [xEasing, yEasing, rEasing].join(' ');
    }

  });

});
