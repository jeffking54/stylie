define([
    'src/app'
    ,'src/constants'
    ,'src/utils'
    ,'src/ui/incrementer-field'
    ,'src/ui/ease-select'

  ], function (

    app
    ,constant
    ,util
    ,IncrementerFieldView
    ,EaseSelectView

  ) {

  function incrementerGeneratorHelper ($el) {
    return new IncrementerFieldView({
      '$el': $el

      ,'onValReenter': _.bind(function (val) {
        this.model.set($el.data('keyframeattr'), +val);
        publish(constant.PATH_CHANGED);
        // TODO: Should access actor through the owner model
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
      '<div class="property-field">'
        ,'<label>'
          ,'<span>{{propertyLabel}}:</span>'
          ,'<input class="quarter-width keyframe-attr-{{property}}" type="text" data-keyframeattr="{{property}}" value="{{value}}">'
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
      ,'click .remove button': 'removeKeyframe'
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
          ,'value': this.model.get(property)
        });

        var $template = $(template);

        if (!isFirstKeyfame) {
          var easeSelectView = this.initEaseSelect(property);
          $template.append(easeSelectView.$el);
        }

        this['$input' + property.toUpperCase()] = $template;
        this.$el.append($template);
      }, this);
    }

    ,'initDOMReferences': function () {
      this.$header = this.$el.find('h3');
      this.$pinnedButtonArray = this.$el.find('.pinned-button-array');
    }

    ,'initIncrementers': function () {
      _.each([this.$inputX, this.$inputY, this.$inputR], function ($el) {
        var $input = $el.find('input');
        var keyframeAttr = $input.data('keyframeattr');
        this['incrementerView' + keyframeAttr.toUpperCase()] =
            incrementerGeneratorHelper.call(this, $input);
      }, this);

      if (!this.isFirstKeyfame()) {
        var template = Mustache.render(MILLISECOND_INPUT_TEMPLATE, {
          'value': this.model.get('millisecond')
        });

        this.millisecondIncrementer = new IncrementerFieldView({
          '$el': $(template)
          ,'onBlur': _.bind(this.onMillisecondIncrementerBlur, this)

          // Defer to the blur event handler for all code paths that call
          // onMillisecondIncrementerBlur.  It's a browser-level event and
          // inserts its handler into the JavaScript thread synchronously,
          // creating null pointers that jQuery is not expecting in
          // jQuery#remove.
          ,'onEnterDown': _.bind(function () {
             this.millisecondIncrementer.$el.trigger('blur');
          }, this)
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

    ,'getKeyframeIndex': function () {
      return this.model.collection.indexOf(this.model);
    }

    ,'isFirstKeyfame': function () {
      return this.getKeyframeIndex() === 0;
    }

    ,'isRemovable': function () {
      return this.getKeyframeIndex() > 0;
    }

    ,'onMillisecondIncrementerBlur': function (evt) {
      this.millisecondIncrementer.$el.detach();
      var millisecond = this.validateMillisecond(
          this.millisecondIncrementer.$el.val());

      if (this.model.owner.hasKeyframeAt(millisecond)) {
        if (millisecond !== this.model.get('millisecond')) {
          publish(constant.ALERT_ERROR, [
              'There is already a keyframe at millisecond '
              + millisecond + '.']);
        }
      } else {
        this.model.moveKeyframe(millisecond);
        this.owner.model.refreshKeyframeOrder();
      }

      this.renderHeader();
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

    ,'validateMillisecond': function (millisecond) {
      return isNaN(millisecond)
        ? 0
        : Math.abs(+millisecond);
    }

    ,'editMillisecond': function () {
      if (this.isEditingMillisecond || !this.canEditMillisecond) {
        return;
      }

      this.isEditingMillisecond = true;

      this.$header
        .empty()
        .append(this.millisecondIncrementer.$el);

      this.millisecondIncrementer.$el
        .val(this.model.get('millisecond'))
        .focus();
    }

    // Kicks off a series of events that involves calling tearDown
    ,'removeKeyframe': function () {
      this.model.removeKeyframe();
    }

    ,'tearDown': function () {
      _.each(['X', 'Y', 'R'], function (axis) {
        this['easeSelectView' + axis].tearDown();
        this['incrementerView' + axis].tearDown();
        this['$input' + axis].remove();
      }, this);

      this.millisecondIncrementer.tearDown();
      this.$header.remove();
      this.$pinnedButtonArray.remove();
      this.remove();
      util.deleteAllProperties(this);
    }

  });
});
