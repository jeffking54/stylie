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
      this.owner.updateEasingString();
    }

  });

});
