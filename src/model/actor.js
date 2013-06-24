define(['src/app', 'src/constants', 'src/collection/keyframes'
    ,'src/ui/keyframe-forms', 'src/ui/crosshairs'],

    function (app, constant, KeyframeCollection
      ,KeyframeFormsView, CrosshairsView) {

  return Backbone.Model.extend({

    'initialize': function (attrs, opts) {
      _.extend(this, opts);
      this.keyframeCollection = new KeyframeCollection([], {'owner': this});

      this.keyframeFormsView = new KeyframeFormsView({
        '$el': $('#keyframe-controls')
        ,'model': this
      });

      this.crosshairsView = new CrosshairsView({
        '$el': $('#crosshairs')
        ,'model': this
      });
    }

    ,'getLength': function () {
      return this.keyframeCollection.length;
    }

    ,'moveLastKeyframe': function (to) {
      this.keyframeCollection.last().moveKeyframe(to);
    }

    ,'getAttrsForKeyframe': function (index) {
      return this.keyframeCollection.at(index).getAttrs();
    }

    ,'getMillisecondOfKeyframe': function (index) {
      return +this.keyframeCollection.at(index).get('millisecond');
    }

    // TODO: It's really odd that the Actor Model knows about keyframe easings,
    // but the Keyframe Model does not.  This logic should be done in the Actor
    // Model.
    ,'getEasingsForKeyframe': function (index) {
      var keyframeProperty =
          this.get('actor').getKeyframeProperty('transform', index);
      var easingChunks = keyframeProperty.easing.split(' ');

      return {
        'x': easingChunks[0]
        ,'y': easingChunks[1]
        ,'r': easingChunks[2]
      };
    }

    ,'updateKeyframeFormViews': function () {
      this.keyframeCollection.updateModelFormViews();
    }

    ,'updateKeyframeCrosshairViews': function () {
      this.keyframeCollection.updateModelCrosshairViews();
    }

    ,'refreshKeyframeOrder': function () {
      this.keyframeCollection.sort();
      publish(constant.KEYFRAME_ORDER_CHANGED);
    }

    // Kapi encapsulation methods

    /**
     * @param {number} millisecond
     * @param {Object} properties
     * @param {string|Object} opt_easing
     */
    ,'keyframe': function (millisecond, properties, opt_easing) {
      var modelProperties = _.extend({'millisecond': millisecond}, properties);
      this.keyframeCollection.add(modelProperties, { 'owner': this });
      var keyframeProperties = this.keyframeCollection.last().getCSS();
      this.get('actor').keyframe(millisecond, keyframeProperties, opt_easing);
    }

    ,'modifyKeyframe': function (
        millisecond, stateModification, opt_easingModification) {
      var actor = this.get('actor');
      actor.modifyKeyframe.apply(actor, arguments);
    }

    ,'moveKeyframe': function (from, to) {
      var actor = this.get('actor');
      actor.moveKeyframe.apply(actor, arguments);
    }

  });
});
