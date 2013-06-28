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
        ,'<div class="pinned-button-array">'
        ,'</div>'
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

  var REMOVE_KEYFRAME_BUTTON = [
      '<label class="remove">'
        ,'<span>Remove this keyframe</span>'
        ,'<button class="icon icon-remove">&nbsp;</button>'
      ,'</label>'
    ].join('');

  var EASE_SELECT_TEMPLATE = [
      '<select class="{{property}}-easing" data-axis="{{property}}"></select>'
    ].join('');

  var MILLISECOND_INPUT_TEMPLATE = [
      '<input class="millisecond-input" type="text" value="{{value}}">'
    ].join('');

  return Backbone.View.extend({

    'events': {
      'click h3': 'editMillisecond'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);

      this.isEditingMillisecond = false;
      this.canEditMillisecond = !this.isFirstKeyfame();

      this.$el = $(KEYFRAME_TEMPLATE);
      this.initDOMReferences();
      this.buildDOM();
      this.model.keyframeFormView = this;
      this.model.on('change', _.bind(this.render, this));
      this.initIncrementers();
      this.render();
    }

    ,'buildDOM': function () {
      var isFirstKeyfame = this.isFirstKeyfame();

      if (this.isRemovable()) {
        var $template = $(Mustache.render(REMOVE_KEYFRAME_BUTTON));
        this.$pinnedButtonArray.append($template);
      }

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
      this.$header = this.$el.find('h3');
      this.$pinnedButtonArray = this.$el.find('.pinned-button-array');
      this.$inputX = this.$el.find('.keyframe-attr-x');
      this.$inputY = this.$el.find('.keyframe-attr-y');
      this.$inputR = this.$el.find('.keyframe-attr-r');
    }

    ,'initIncrementers': function () {
      this.incrementerViews = {};
      _.each([this.$inputX, this.$inputY, this.$inputR], function ($el) {
        this.incrementerViews[$el.data('keyframeattr')] =
            incrementerGeneratorHelper.call(this, $el);
      }, this);

      if (!this.isFirstKeyfame()) {
        var template = Mustache.render(MILLISECOND_INPUT_TEMPLATE, {
              'value': this.model.get('millisecond')
            });
        this.millisecondIncrementer = new IncrementerFieldView({
          '$el': $(template)
          ,'onEnterDown': _.bind(this.onMillisecondIncrementerEnter, this)
        });
      }
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

    ,'isRemovable': function () {
      return this.model.collection.indexOf(this.model) > 1;
    }

    ,'onMillisecondIncrementerEnter': function () {
      this.millisecondIncrementer.$el.detach();
      var newMillisecond = this.millisecondIncrementer.$el.val();
      this.updateMillisecond(newMillisecond);
      this.renderHeader();
      this.owner.model.refreshKeyframeOrder();
      this.isEditingMillisecond = false;
    }

    ,'render': function () {
      this.renderHeader();

      if (this.model.get('x') !== parseFloat(this.$inputX.val())) {
        this.$inputX.val(this.model.get('x'));
      }
      if (this.model.get('y') !== parseFloat(this.$inputY.val())) {
        this.$inputY.val(this.model.get('y'));
      }
      if (this.model.get('r') !== parseFloat(this.$inputR.val())) {
        this.$inputR.val(this.model.get('r'));
      }
    }

    ,'renderHeader': function () {
      this.$header.text(this.model.get('millisecond'));
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

    ,'updateMillisecond': function (newMillisecond) {
      if (!isNaN(newMillisecond)) {
        var validMillisecond = Math.abs(+newMillisecond);
        this.model.moveKeyframe(validMillisecond);
      }
    }

    ,'editMillisecond': function () {
      if (this.isEditingMillisecond || !this.canEditMillisecond) {
        return;
      }

      this.isEditingMillisecond = true;

      this.$header
        .empty()
        .append(this.millisecondIncrementer.$el);

      this.millisecondIncrementer.$el.focus();
    }

  });
});
