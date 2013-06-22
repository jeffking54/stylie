define([
    'src/app'
    ,'src/constants'
    ,'src/ui/incrementer-field'
    ,'src/ui/ease-select'

  ], function (

    app
    ,constant
    ,IncrementerFieldView
    ,EaseSelectView

  ) {

  function incrementerGeneratorHelper ($el) {
    return new IncrementerFieldView({
      '$el': $el

      ,'onValReenter': _.bind(function (val) {
        this.model.set($el.data('keyframeattr'), +val);
        publish(constant.PATH_CHANGED);
        app.collection.actors.getCurrent(0).updateKeyframeCrosshairViews();
        app.kapi.update();
      }, this)
    });
  }

  var KEYFRAME_TEMPLATE = [
      '<li class="keyframe">'
        ,'<h3></h3>'
      ,'</li>'
    ].join('');

  var KEYFRAME_PROPERTY_TEMPLATE = [
      '<div>'
        ,'<label>'
          ,'<span>{{propertyLabel}}:</span>'
          ,'<input class="quarter-width keyframe-attr-{{property}}" type="text" data-keyframeattr="{{property}}"></input>'
        ,'</label>'
      ,'</div>'
    ].join('');

  var EASE_SELECT_TEMPLATE = [
      '<select class="{{property}}-easing" data-axis="{{property}}"></select>'
    ].join('');

  return Backbone.View.extend({

    'events': {}

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.$el = $(KEYFRAME_TEMPLATE);
      this.buildDOM();
      this.model.keyframeForm = this;
      this.model.on('change', _.bind(this.render, this));
      this.initDOMReferences();
      this.initIncrementers();
      this.render();
    }

    ,'buildDOM': function () {
      var isFirstKeyfame = this.isFirstKeyfame();

      _.each(['x', 'y', 'r'], function (property) {
        var template = Mustache.render(KEYFRAME_PROPERTY_TEMPLATE, {
          'property': property
          ,'propertyLabel': property.toUpperCase()
        });

        var $template = $(template);

        if (!isFirstKeyfame) {
          var easeSelectView = this.initEaseSelect(property);
          $template.append(easeSelectView.$el);
        }

        this.$el.append($template);
      }, this);
    }

    ,'initDOMReferences': function () {
      this.header = this.$el.find('h3');
      this.inputX = this.$el.find('.keyframe-attr-x');
      this.inputY = this.$el.find('.keyframe-attr-y');
      this.inputR = this.$el.find('.keyframe-attr-r');
    }

    ,'initIncrementers': function () {
      this.incrementerViews = {};
      _.each([this.inputX, this.inputY, this.inputR], function ($el) {
        this.incrementerViews[$el.data('keyframeattr')] =
            incrementerGeneratorHelper.call(this, $el);
      }, this);
    }

    ,'initEaseSelect': function (propertyName, previousSibling) {
      var viewName = 'easeSelectView' + propertyName.toUpperCase();
      var inputName = 'input'  + propertyName.toUpperCase();
      var template = Mustache.render(EASE_SELECT_TEMPLATE, {
          'property': propertyName
        });

      var view = this[viewName] = new EaseSelectView({
        '$el': $(template)
        ,'owner': this
      });

      return view;
    }

    ,'isFirstKeyfame': function () {
      return this.model.collection.indexOf(this.model) === 0;
    }

    ,'render': function () {
      this.header.text(this.model.get('millisecond'));
      if (this.model.get('x') !== parseFloat(this.inputX.val())) {
        this.inputX.val(this.model.get('x'));
      }
      if (this.model.get('y') !== parseFloat(this.inputY.val())) {
        this.inputY.val(this.model.get('y'));
      }
      if (this.model.get('r') !== parseFloat(this.inputR.val())) {
        this.inputR.val(this.model.get('r'));
      }
    }

    ,'updateEasingString': function () {
      var xEasing = this.easeSelectViewX.$el.val();
      var yEasing = this.easeSelectViewY.$el.val();
      var rEasing = this.easeSelectViewR.$el.val();
      var newEasingString = [xEasing, yEasing, rEasing].join(' ');

      this.model.setEasingString(newEasingString);

      // TODO: These function calls are too specific and assume that there will
      // only ever be one actor.
      app.view.canvas.backgroundView.update();
      app.kapi.update();
    }

  });
});
